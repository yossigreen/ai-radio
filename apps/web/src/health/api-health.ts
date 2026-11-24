export type ApiHealth = 'up' | 'database-down' | 'unreachable';

/**
 * Asks the NestJS API for its health. Next.js only renders; all data comes from the API.
 *
 * fetch has no default timeout: without one, an API that accepts the connection but never
 * answers would hang the page render. A timeout turns "slow" into "unreachable".
 *
 * The default URL is read per call (a default parameter), so the server's runtime environment
 * applies, not the one at build time.
 */
export async function fetchApiHealth(
  apiUrl = process.env.API_URL ?? 'http://localhost:3001',
  timeoutMs = 2_000,
): Promise<ApiHealth> {
  try {
    const response = await fetch(`${apiUrl}/health`, {
      cache: 'no-store', // live state: a cached "up" would hide an outage
      signal: AbortSignal.timeout(timeoutMs),
    });
    return response.ok ? 'up' : 'database-down';
  } catch {
    return 'unreachable';
  }
}
