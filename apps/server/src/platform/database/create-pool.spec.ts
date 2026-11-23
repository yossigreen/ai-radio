import { testDatabaseUrl } from '../../testing/test-database';
import { waitFor } from '../../testing/wait-for';
import { createPool } from './create-pool';

describe('createPool', () => {
  let errorLog: jest.SpyInstance;

  beforeEach(() => {
    errorLog = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    errorLog.mockRestore();
  });

  async function terminateBackend(pid: number | undefined): Promise<void> {
    const admin = createPool(testDatabaseUrl());
    await admin.query('select pg_terminate_backend($1)', [pid]);
    await admin.end();
  }

  it('survives the server terminating an idle connection and reconnects', async () => {
    const pool = createPool(testDatabaseUrl());
    const { rows } = await pool.query<{ pid: number }>('select pg_backend_pid() as pid');
    const idlePid = rows[0]?.pid;

    await terminateBackend(idlePid);

    // Without the listeners the process would crash here instead of logging.
    await waitFor(() => errorLog.mock.calls.length > 0);
    const again = await pool.query<{ pid: number }>('select pg_backend_pid() as pid');
    expect(again.rows[0]?.pid).not.toBe(idlePid);
    await pool.end();
  });

  it('survives the server terminating a checked-out connection', async () => {
    const pool = createPool(testDatabaseUrl());
    const client = await pool.connect();
    const { rows } = await client.query<{ pid: number }>('select pg_backend_pid() as pid');

    await terminateBackend(rows[0]?.pid);

    await waitFor(() => errorLog.mock.calls.length > 0);
    client.release(true);
    await pool.end();
  });
});
