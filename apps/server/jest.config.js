/** @type {import('jest').Config} */
module.exports = {
  roots: ['<rootDir>/src'],
  globalSetup: '<rootDir>/src/testing/postgres.global-setup.js',
  globalTeardown: '<rootDir>/src/testing/postgres.global-teardown.js',
  // Starting the Postgres container and the Temporal test server takes time.
  testTimeout: 120_000,
  transform: {
    '^.+\\.ts$': [
      '@swc/jest',
      {
        jsc: {
          parser: { syntax: 'typescript', decorators: true },
          // Nest's dependency injection reads constructor types from decorator metadata.
          transform: { legacyDecorator: true, decoratorMetadata: true },
          target: 'es2023',
        },
        module: { type: 'commonjs' },
      },
    ],
  },
};
