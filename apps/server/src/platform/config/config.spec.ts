import { loadConfig } from './config';

describe('loadConfig', () => {
  it('fails fast when DATABASE_URL is missing', () => {
    expect(() => loadConfig({})).toThrow('DATABASE_URL');
  });

  it('applies defaults for optional values', () => {
    expect(loadConfig({ DATABASE_URL: 'postgres://x' })).toEqual({
      databaseUrl: 'postgres://x',
      temporalAddress: 'localhost:7233',
      temporalNamespace: 'default',
      apiPort: 3001,
    });
  });
});
