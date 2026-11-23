import type { ApiHealth } from './api-health';

const LABELS: Record<ApiHealth, string> = {
  up: 'API and database are up',
  'database-down': 'API is up, database is down',
  unreachable: 'API is unreachable',
};

export function HealthStatus({ health }: { health: ApiHealth }) {
  return <p role="status">{LABELS[health]}</p>;
}
