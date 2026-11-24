import { fetchApiHealth } from '../health/api-health';
import { HealthStatus } from '../health/health-status';

export default async function HomePage() {
  const health = await fetchApiHealth();
  return (
    <main>
      <h1>A.I. Radio</h1>
      <p>Always Interesting Radio. Skeleton build: no broadcast yet.</p>
      <HealthStatus health={health} />
    </main>
  );
}
