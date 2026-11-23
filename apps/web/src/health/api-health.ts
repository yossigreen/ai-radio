export type ApiHealth = 'up' | 'database-down' | 'unreachable';

/**
 * Asks the NestJS API for its health. Next.js only renders; all data comes from the API.
 *
 * fetch has no default timeout: without one, an API that accepts the connection but never
 * answers would hang the page render. A timeout turns "slow" into "unreachable".
 */
export async function fetchApiHealth(apiUrl: string, timeoutMs = 2_000): Promise<ApiHealth> {
  try {
    const response = await fetch(`${apiUrl}/health`, { signal: AbortSignal.timeout(timeoutMs) });
    return response.ok ? 'up' : 'database-down';
  } catch {
    return 'unreachable';
  }
}
