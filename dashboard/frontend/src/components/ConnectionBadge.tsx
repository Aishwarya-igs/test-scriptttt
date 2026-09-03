import { useSocketConnected } from '../api/useDashboardSocket';

export function ConnectionBadge() {
  const connected = useSocketConnected();
  return (
    <span className={`connection-badge${connected ? ' is-live' : ' is-offline'}`}>
      <span className="connection-dot" />
      {connected ? 'Live' : 'Reconnecting…'}
    </span>
  );
}
