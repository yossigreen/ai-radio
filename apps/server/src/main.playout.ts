import { setTimeout as sleep } from 'node:timers/promises';
import { PlayoutLeaderLock } from './modules/broadcast/playout-leader-lock';
import { loadConfig } from './platform/config/config';
import { createPool } from './platform/database/create-pool';

const PLAYOUT_LOCK_KEY = 7_001;
const TICK_MS = 6_000;

async function run(): Promise<void> {
  const config = loadConfig();
  const pool = createPool(config.databaseUrl);
  const lock = new PlayoutLeaderLock(pool, PLAYOUT_LOCK_KEY);
  const shutdown = new AbortController();
  const stop = (): void => {
    shutdown.abort();
  };
  process.once('SIGTERM', stop);
  process.once('SIGINT', stop);

  try {
    while (!shutdown.signal.aborted) {
      try {
        if (await lock.tryAcquire()) {
          // M1 replaces this with: playlist = f(timeline, now) → publish.
          console.log(`[playout] leader tick ${new Date().toISOString()}`);
        } else {
          console.log('[playout] standby: another instance is leader');
        }
      } catch (error) {
        // Playout must outlive a database blip: log, then retry on the next tick.
        console.error('[playout] tick failed, retrying next tick:', error);
      }
      await sleep(TICK_MS, undefined, { signal: shutdown.signal }).catch(() => undefined);
    }
  } finally {
    await lock.release();
    await pool.end();
  }
}

run().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
