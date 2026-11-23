import type { Pool } from 'pg';
import { createPool } from '../../platform/database/create-pool';
import { testDatabaseUrl } from '../../testing/test-database';
import { waitFor } from '../../testing/wait-for';
import { PlayoutLeaderLock } from './playout-leader-lock';

describe('PlayoutLeaderLock', () => {
  const LOCK_KEY = 42;
  let poolA: Pool;
  let poolB: Pool;
  let errorLog: jest.SpyInstance;

  beforeAll(() => {
    // Two pools simulate two separate playout processes.
    poolA = createPool(testDatabaseUrl());
    poolB = createPool(testDatabaseUrl());
    errorLog = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterAll(async () => {
    errorLog.mockRestore();
    await poolA.end();
    await poolB.end();
  });

  it('allows only one leader at a time and hands over on release', async () => {
    const a = new PlayoutLeaderLock(poolA, LOCK_KEY);
    const b = new PlayoutLeaderLock(poolB, LOCK_KEY);

    expect(await a.tryAcquire()).toBe(true);
    expect(await b.tryAcquire()).toBe(false);

    await a.release();
    expect(await b.tryAcquire()).toBe(true);
    expect(a.isLeader).toBe(false);
    expect(b.isLeader).toBe(true);

    await b.release();
  });

  it('drops leadership and frees the lock when the leader connection dies', async () => {
    const leader = new PlayoutLeaderLock(poolA, LOCK_KEY);
    const standby = new PlayoutLeaderLock(poolB, LOCK_KEY);

    expect(await leader.tryAcquire()).toBe(true);
    expect(await standby.tryAcquire()).toBe(false);

    // Simulate a crash or network loss: Postgres kills the session holding the lock.
    await poolB.query(
      `select pg_terminate_backend(pid) from pg_locks
       where locktype = 'advisory' and objid = $1 and granted`,
      [LOCK_KEY],
    );

    await waitFor(() => !leader.isLeader);
    expect(await standby.tryAcquire()).toBe(true);
    await standby.release();
  });
});
