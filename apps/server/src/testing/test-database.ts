/** The URI of the shared test Postgres started by postgres.global-setup.js. */
export function testDatabaseUrl(): string {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error('TEST_DATABASE_URL is not set: is the Jest globalSetup configured?');
  return url;
}
