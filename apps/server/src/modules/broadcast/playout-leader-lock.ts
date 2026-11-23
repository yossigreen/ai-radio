import { Pool, PoolClient } from 'pg';

/**
 * Ensures a single active playout instance using a Postgres advisory lock.
 *
 * Advisory locks belong to a database *session*, so the lock must be held on one
 * dedicated connection for as long as this instance is the leader. Returning that
 * connection to the pool would release the lock (or leak it to another caller).
 *
 * If that connection dies, Postgres releases the lock, so this instance must stop
 * acting as leader immediately: the error handler drops leadership.
 *
 * Correctness does not depend on this lock (the playlist is a pure function of
 * timeline and time, ADR 0005); it prevents duplicate work.
 */
export class PlayoutLeaderLock {
  private client: PoolClient | undefined;

  constructor(
    private readonly pool: Pool,
    private readonly lockKey: number,
  ) {}

  get isLeader(): boolean {
    return this.client !== undefined;
  }

  async tryAcquire(): Promise<boolean> {
    if (this.client) return true;
    const client = await this.pool.connect();
    try {
      const result = await client.query<{ acquired: boolean }>(
        'select pg_try_advisory_lock($1) as acquired',
        [this.lockKey],
      );
      if (result.rows[0]?.acquired) {
        this.client = client;
        // A checked-out client's errors are not handled by the pool. Without this
        // listener a dropped connection is an unhandled 'error' event and crashes the process.
        client.on('error', (error) => {
          this.onConnectionLost(client, error);
        });
        return true;
      }
    } catch (error) {
      client.release();
      throw error;
    }
    client.release();
    return false;
  }

  private onConnectionLost(client: PoolClient, error: Error): void {
    if (this.client !== client) return;
    this.client = undefined;
    // Passing the error destroys the connection instead of returning it to the pool.
    client.release(error);
  }

  async release(): Promise<void> {
    const client = this.client;
    if (!client) return;
    this.client = undefined;
    try {
      await client.query('select pg_advisory_unlock($1)', [this.lockKey]);
    } finally {
      client.release();
    }
  }
}
