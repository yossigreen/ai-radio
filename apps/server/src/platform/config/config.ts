export interface AppConfig {
  databaseUrl: string;
  temporalAddress: string;
  temporalNamespace: string;
  apiPort: number;
}

function required(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/** Reads configuration from the environment and fails fast on anything missing. */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return {
    databaseUrl: required(env, 'DATABASE_URL'),
    temporalAddress: env.TEMPORAL_ADDRESS ?? 'localhost:7233',
    temporalNamespace: env.TEMPORAL_NAMESPACE ?? 'default',
    apiPort: Number(env.API_PORT ?? 3001),
  };
}
