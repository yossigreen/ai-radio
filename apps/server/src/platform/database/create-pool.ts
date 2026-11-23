import { Pool } from 'pg';

/**
 * Creates a pg Pool whose connections can drop without crashing the process.
 *
 * A pg client emits 'error' when its connection dies (DB restart, failover, network loss),
 * and an EventEmitter 'error' with no listener crashes Node. pg-pool only listens on *idle*
 * clients and removes that listener on checkout, so every client gets a baseline listener
 * here. Callers that hold a client (e.g. the playout lock) add their own for recovery logic.
 */
export function createPool(connectionString: string): Pool {
  const pool = new Pool({ connectionString, connectionTimeoutMillis: 2_000 });
  pool.on('connect', (client) => {
    client.on('error', (error) => {
      console.error('[database] connection lost:', error.message);
    });
  });
  // Required: pg-pool re-emits idle-client errors on the pool. Already logged above.
  pool.on('error', () => undefined);
  return pool;
}
