import { fetchApiHealth } from './api-health';

describe('fetchApiHealth', () => {
  const realFetch = global.fetch;
  afterEach(() => {
    global.fetch = realFetch;
  });

  function mockFetch(
    impl: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
  ): void {
    global.fetch = jest.fn(impl);
  }

  it('is up when the API answers 200', async () => {
    mockFetch(() => Promise.resolve({ ok: true } as Response));
    await expect(fetchApiHealth('http://api')).resolves.toBe('up');
  });

  it('never caches: health is live state', async () => {
    mockFetch(() => Promise.resolve({ ok: true } as Response));
    await fetchApiHealth('http://api');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://api/health',
      expect.objectContaining({ cache: 'no-store' }),
    );
  });

  it('reports the database down when the API answers 503', async () => {
    mockFetch(() => Promise.resolve({ ok: false } as Response));
    await expect(fetchApiHealth('http://api')).resolves.toBe('database-down');
  });

  it('is unreachable when the request fails', async () => {
    mockFetch(() => Promise.reject(new Error('ECONNREFUSED')));
    await expect(fetchApiHealth('http://api')).resolves.toBe('unreachable');
  });

  it('is unreachable when the API accepts the connection but never answers', async () => {
    // A hung API: the response never arrives, so only the abort signal can end the wait.
    mockFetch(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new Error('aborted'));
          });
        }),
    );
    await expect(fetchApiHealth('http://api', 50)).resolves.toBe('unreachable');
  });
});
