// One Postgres container for the whole test run; specs read its URI from the environment.
// Workers are forked after globalSetup, so they inherit TEST_DATABASE_URL.
const { PostgreSqlContainer } = require('@testcontainers/postgresql');

// Same image as local dev and production (pgvector is needed from M3 on).
const POSTGRES_IMAGE = 'pgvector/pgvector:pg17';

module.exports = async function globalSetup() {
  const container = await new PostgreSqlContainer(POSTGRES_IMAGE).start();
  globalThis.__POSTGRES_CONTAINER__ = container;
  process.env.TEST_DATABASE_URL = container.getConnectionUri();
};
