export type ApiHealth = 'up' | 'database-down' | 'unreachable';

/** Asks the NestJS API for its health. Next.js only renders; all data comes from the API. */
export async function fetchApiHealth(apiUrl: string): Promise<ApiHealth> {
  try {
    const response = await fetch(`${apiUrl}/health`);
    return response.ok ? 'up' : 'database-down';
  } catch {
    return 'unreachable';
  }
}
