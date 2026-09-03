import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useDashboardSocket } from '../api/useDashboardSocket';
import type { Platform, ProjectsManifest, RunRecord } from '../api/types';
import { NewRunForm } from '../components/NewRunForm';
import { RunCard } from '../components/RunCard';

/**
 * One page per platform, driven entirely by the id in the URL — there is no
 * Web page, Mobile page or TV page in the code, only this. Adding a platform
 * is an edit to dashboard/config/platforms.json; nothing here changes.
 *
 * This is where a run is STARTED, which is why the start form lives here and
 * not on Run history: starting is inherently per-platform (you run the web
 * suite or the mobile suite), while history is a record of everything that
 * already ran and is better read across platforms.
 *
 * Its other job is telling apart states that all look like "empty" if you only
 * count runs:
 *   - the platform is not declared at all (bad URL)
 *   - it is declared but has no repo pointed at it yet (nothing CAN run)
 *   - it is wired up and simply has not run yet (something can run)
 * Each needs a different action from whoever is looking, so each says so.
 */
export function PlatformPage() {
  const { platformId } = useParams<{ platformId: string }>();
  const [platforms, setPlatforms] = useState<Platform[] | null>(null);
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [manifest, setManifest] = useState<ProjectsManifest | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const refetchRuns = useCallback(() => {
    if (!platformId) return;
    api
      .listRuns(50, platformId)
      .then((next) => {
        setRuns(next);
        setError(null);
      })
      // A 400 here means the id is not a declared platform; the render below
      // already covers that case from the registry, so this only needs to
      // avoid leaving stale runs from a previously-viewed platform on screen.
      .catch(() => setRuns([]));
  }, [platformId]);

  useEffect(() => {
    api
      .getPlatforms()
      .then((res) => setPlatforms(res.platforms))
      .catch(() => setError('Could not load the platform registry.'));
    // The environment/project/tag choices still come from this repo's
    // playwright config; a platform that can't run never renders the form, so
    // a failure here only matters for the one platform that does.
    api.getProjects().then(setManifest).catch(() => {});
  }, []);

  useEffect(() => {
    refetchRuns();
  }, [refetchRuns]);

  useDashboardSocket((msg) => {
    if (msg.type === 'run-status' || msg.type === 'job-status' || msg.type === 'snapshot') refetchRuns();
  });

  async function handleStart(args: { env: string; project?: string; grep?: string }) {
    setStarting(true);
    try {
      const { runId } = await api.startRun(args);
      navigate(`/runs/${runId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start that run');
    } finally {
      setStarting(false);
    }
  }

  if (!platforms) {
    return (
      <div className="page-fade">
        <div className="page-heading">
          <p className="muted">Loading…</p>
        </div>
      </div>
    );
  }

  const platform = platforms.find((p) => p.id === platformId);
  if (!platform) {
    return (
      <div className="page-fade">
        <div className="page-heading">
          <h2>Unknown platform</h2>
          <p className="muted">
            No platform with id <code>{platformId}</code> is declared in <code>dashboard/config/platforms.json</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-fade">
      <div className="page-heading">
        <h2>
          {platform.icon} {platform.label}
        </h2>
        {platform.description && <p className="muted">{platform.description}</p>}
      </div>

      {error && <div className="rca-error">{error}</div>}

      {!platform.configured ? (
        <div className="card platform-unconfigured">
          <div className="platform-unconfigured-title">No test suite is connected to this platform yet</div>
          <p className="muted">
            {platform.repoRoot
              ? // A path that was set but does not exist is a different problem
                // from never having set one, and the fix is different too.
                'The configured path does not exist on this machine, so nothing can be read from it:'
              : 'Point this platform at a checkout of its test suite by setting "repoRoot" for it in:'}
          </p>
          <pre className="platform-unconfigured-path">
            {platform.repoRoot ?? 'dashboard/config/platforms.json'}
          </pre>
          <p className="muted">
            Once it points at a real repo, this page lists that suite's runs. Running tests and generating fixes for a
            second repo needs the runner and the RCA/spot-fix engine to become platform-aware too — that work is
            deliberately not done yet, so nothing here pretends to be wired up when it is not.
          </p>
        </div>
      ) : (
        <>
          {platform.canRun ? (
            manifest && <NewRunForm manifest={manifest} onStart={handleStart} starting={starting} />
          ) : (
            // Configured but not runnable: the repo is there, the runner just
            // can't target it yet. Saying so beats a form that would silently
            // run the wrong suite.
            <div className="card">
              <div className="platform-unconfigured-title">Runs can't be started from here yet</div>
              <p className="muted">
                {platform.label} has a repo connected, but the runner still executes tests in this dashboard's own
                repo, so starting a run here would run the wrong suite. Past {platform.label} runs are listed below.
              </p>
            </div>
          )}

          <div className="card run-list">
            <div className="table-toolbar">
              <h3>Recent {platform.label} runs</h3>
              <Link to="/runs" className="link-button">
                View all runs →
              </Link>
            </div>
            {runs.length === 0 ? (
              <p className="muted">
                No runs recorded for {platform.label} yet{platform.canRun ? ' — start one above.' : '.'}
              </p>
            ) : (
              <div className="run-card-grid">
                {runs.map((run) => (
                  <RunCard key={run.runId} run={run} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
