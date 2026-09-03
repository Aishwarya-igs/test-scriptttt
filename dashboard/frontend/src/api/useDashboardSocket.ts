import { useEffect, useRef, useState } from 'react';
import type { AppliedSpotFix, AutoUpdateStatus, RunRecord } from './types';

export type SocketMessage =
  | { type: 'snapshot'; runs: RunRecord[] }
  | { type: 'run-status'; runId: string; status: string }
  | { type: 'job-status'; runId: string; jobId: string; status: string }
  | { type: 'run-event'; runId: string; jobId: string; event: string; payload: unknown }
  | { type: 'spot-fixes-applied'; fixes: AppliedSpotFix[] }
  | { type: 'run-stalled'; runId: string; stalledSince: string | null; silentForMs?: number }
  | { type: 'runs-cleared'; deleted: number }
  | ({ type: 'auto-update-status' } & AutoUpdateStatus);

type Listener = (msg: SocketMessage) => void;
type StatusListener = (connected: boolean) => void;

/**
 * One real WebSocket shared by the whole app instead of one per hook call —
 * every page (nav sidebar badge, overview, history, detail) can subscribe
 * without opening its own connection. Reconnects with a fixed backoff so a
 * dev-server restart or a laptop sleep/wake doesn't leave the UI silently
 * stale.
 */
let socket: WebSocket | null = null;
let connected = false;
const listeners = new Set<Listener>();
const statusListeners = new Set<StatusListener>();

function setConnected(next: boolean) {
  connected = next;
  statusListeners.forEach((l) => l(next));
}

function connect() {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const ws = new WebSocket(`${protocol}://${window.location.host}/ws`);
  socket = ws;

  ws.onopen = () => setConnected(true);
  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data) as SocketMessage;
      listeners.forEach((l) => l(msg));
    } catch {
      // Ignore malformed frames.
    }
  };
  ws.onclose = () => {
    setConnected(false);
    if (socket === ws) socket = null;
    setTimeout(connect, 2000);
  };
  ws.onerror = () => ws.close();
}

if (typeof window !== 'undefined') connect();

export function useDashboardSocket(onMessage: (msg: SocketMessage) => void) {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    const listener: Listener = (msg) => onMessageRef.current(msg);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
}

export function useSocketConnected() {
  const [isConnected, setIsConnected] = useState(connected);

  useEffect(() => {
    statusListeners.add(setIsConnected);
    setIsConnected(connected);
    return () => {
      statusListeners.delete(setIsConnected);
    };
  }, []);

  return isConnected;
}
