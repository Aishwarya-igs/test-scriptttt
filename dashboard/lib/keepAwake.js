/**
 * Keeps the machine awake for as long as a test run is in flight.
 *
 * Why this is needed: a Playwright run generates no keyboard or mouse input,
 * and Windows' idle timers do not count background CPU work as activity. On a
 * default Balanced power plan the machine therefore sleeps mid-run (observed
 * here: "Sleep after" was 180 seconds on AC). Sleep suspends the whole
 * process tree — the runner, its workers, and Chrome — so the run does not
 * merely slow down, it stops dead and no further test events arrive. Node's
 * timers are suspended too, so even Playwright's own per-test timeout never
 * fires; the run just hangs until someone wakes the machine.
 *
 * The fix is a scoped, temporary power request rather than editing the user's
 * power plan: the same mechanism media players and installers use. It is held
 * only while a run is active and released as soon as the queue drains, so
 * normal idle behaviour resumes the moment testing finishes.
 *
 * The display is kept on as well, not just the system. Runs here are headed
 * (`--headed`, because headless traffic gets blocked by the CDN's bot
 * detection), and letting the display sleep invites Chrome's occlusion
 * handling to throttle rendering in the browser under test — plus the display
 * timeout is what triggers the idle lock screen in the first place.
 */
const { spawn } = require('child_process');

const IS_WINDOWS = process.platform === 'win32';
const IS_MAC = process.platform === 'darwin';

/**
 * ES_CONTINUOUS (0x80000000) makes the state persist until reset or the
 * calling thread exits; ES_SYSTEM_REQUIRED (0x1) blocks system sleep;
 * ES_DISPLAY_REQUIRED (0x2) blocks display sleep. Combined: 0x80000003.
 *
 * Passed as the decimal literal 2147483651 rather than as
 * `0x80000000 -bor 0x1 -bor 0x2`: Windows PowerShell parses 0x80000000 as a
 * signed Int32, so that expression yields a negative number which fails to
 * convert to the uint parameter. The call then never runs while the helper
 * process happily stays alive, holding nothing — a silent no-op.
 *
 * SetThreadExecutionState returns the previous state, or 0 on failure, so a
 * failed call exits non-zero instead of pretending to hold the machine awake.
 */
const KEEP_AWAKE_FLAGS = 2147483651;
const WINDOWS_SCRIPT = `
Add-Type -Namespace Pw -Name Power -MemberDefinition '
  [DllImport("kernel32.dll", SetLastError = true)]
  public static extern uint SetThreadExecutionState(uint esFlags);
'
if ([Pw.Power]::SetThreadExecutionState([uint32]${KEEP_AWAKE_FLAGS}) -eq 0) { exit 1 }
while ($true) { Start-Sleep -Seconds 3600 }
`;

class KeepAwake {
  constructor({ log = console } = {}) {
    this.child = null;
    this.holders = 0;
    this.log = log;
  }

  /**
   * Reference-counted so overlapping callers can't release each other's hold.
   * Safe to call when already held.
   */
  acquire() {
    this.holders += 1;
    if (this.child || this.holders > 1) return;

    try {
      if (IS_WINDOWS) {
        // The request belongs to the helper's thread, so it is released
        // automatically if this process dies for any reason — including the
        // dashboard server crashing, which is why it isn't done in-process.
        this.child = spawn(
          'powershell.exe',
          ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', WINDOWS_SCRIPT],
          { stdio: 'ignore', windowsHide: true }
        );
      } else if (IS_MAC) {
        // -d display, -i idle sleep, -m disk, -s system.
        this.child = spawn('caffeinate', ['-dims'], { stdio: 'ignore' });
      } else {
        return; // No portable equivalent on Linux; runs there are typically headless/CI.
      }
    } catch (err) {
      this.log.error?.(`[dashboard] could not inhibit sleep for this run: ${err.message}`);
      this.child = null;
      return;
    }

    const helper = this.child;

    // A failure to hold the machine awake must never take the run down with
    // it — worst case the original sleep behaviour returns.
    helper.on('error', (err) => {
      this.log.error?.(`[dashboard] sleep inhibitor failed: ${err.message}`);
      if (this.child === helper) this.child = null;
    });

    // The helper is supposed to outlive the run. If it exits on its own, the
    // machine is no longer being held awake, and saying so beats letting a run
    // silently freeze again hours later.
    helper.on('exit', (code) => {
      if (this.child !== helper) return; // Expected exit from release().
      this.child = null;
      if (this.holders > 0) {
        this.log.error?.(
          `[dashboard] sleep inhibitor exited early (code ${code}); this machine may sleep mid-run`
        );
      }
    });

    helper.unref();
  }

  /** Releases one hold; the machine may sleep again once the last one is gone. */
  release() {
    if (this.holders > 0) this.holders -= 1;
    if (this.holders > 0 || !this.child) return;
    try {
      this.child.kill();
    } catch {
      // Already gone; nothing to release.
    }
    this.child = null;
  }

  /** Drops every hold — used on server shutdown. */
  releaseAll() {
    this.holders = 0;
    if (!this.child) return;
    try {
      this.child.kill();
    } catch {
      // Already gone.
    }
    this.child = null;
  }

  get active() {
    return Boolean(this.child);
  }
}

module.exports = { KeepAwake };
