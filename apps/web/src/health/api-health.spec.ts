import { fetchApiHealth } from './api-health';

describe('fetchApiHealth', () => {
  const realFetch = global.fetch;
  afterEach(() => {
    global.fetch = realFetch;
  });

  function mockFetch(impl: () => Promise<Response>): void {
    global.fetch = jest.fn(impl);
  }

  it('is up when the API answers 200', async () => {
    mockFetch(() => Promise.resolve({ ok: true } as Response));
    await expect(fetchApiHealth('http://api')).resolves.toBe('up');
  });

  it('reports the database down when the API answers 503', async () => {
    mockFetch(() => Promise.resolve({ ok: false } as Response));
    await expect(fetchApiHealth('http://api')).resolves.toBe('database-down');
  });

  it('is unreachable when the request fails', async () => {
    mockFetch(() => Promise.reject(new Error('ECONNREFUSED')));
    await expect(fetchApiHealth('http://api')).resolves.toBe('unreachable');
  });
});
