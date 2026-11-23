import { fetchApiHealth } from '../health/api-health';
import { HealthStatus } from '../health/health-status';

// Rendered per request: health must not be cached at build time.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const health = await fetchApiHealth(process.env.API_URL ?? 'http://localhost:3001');
  return (
    <main>
      <h1>A.I. Radio</h1>
      <p>Always Interesting Radio. Skeleton build: no broadcast yet.</p>
      <HealthStatus health={health} />
    </main>
  );
}
