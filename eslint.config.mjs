// @ts-check
import eslint from '@eslint/js';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import tseslint from 'typescript-eslint';

const tlsDisabled =
  'Disables TLS certificate checks: any network attacker can impersonate the server.';

export default tseslint.config(
  { ignores: ['**/dist/**', '**/.next/**', '**/coverage/**', '**/next-env.d.ts'] },
  eslint.configs.recommended,
  {
    // Security patterns ported from Anthropic's security-guidance plugin (ADR 0021): known
    // injection and XSS sinks. No type information needed, so they cover JS files too.
    // A justified exception needs an eslint-disable comment that says why.
    rules: {
      'no-eval': 'error', // new Function is caught by @typescript-eslint/no-implied-eval
      // Core rule, separate from the TS variant used for pg below, so neither replaces the other.
      'no-restricted-imports': [
        'error',
        {
          paths: ['child_process', 'node:child_process'].map((name) => ({
            name,
            importNames: ['exec', 'execSync', 'default'],
            message: 'Use execFile or spawn with an argument array: exec runs a shell string.',
          })),
        },
      ],
      'no-restricted-properties': [
        'error',
        ...['innerHTML', 'outerHTML', 'insertAdjacentHTML'].map((property) => ({
          property,
          message: 'XSS sink: render through React, or set textContent.',
        })),
        ...['write', 'writeln'].map((property) => ({
          object: 'document',
          property,
          message: 'XSS sink: render through React.',
        })),
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "Property[key.name='shell'][value.value=true]",
          message:
            'shell: true runs the command through /bin/sh, like exec. Pass an argument array.',
        },
        {
          selector:
            "Property[key.name='rejectUnauthorized'][value.value=false], Property[key.value='rejectUnauthorized'][value.value=false], AssignmentExpression[left.property.name='rejectUnauthorized'][right.value=false]",
          message: tlsDisabled,
        },
        {
          selector:
            "MemberExpression[property.name='NODE_TLS_REJECT_UNAUTHORIZED'], MemberExpression[property.value='NODE_TLS_REJECT_UNAUTHORIZED']",
          message: tlsDisabled,
        },
      ],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      // Nest controllers and providers are classes with injected constructors.
      '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
    },
  },
  {
    files: ['apps/server/**/*.ts'],
    ignores: ['apps/server/src/platform/database/create-pool.ts'],
    rules: {
      // A pg Pool or Client without error listeners crashes the process when a connection
      // drops (found twice in M0: the API and playout). createPool() attaches them.
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'pg',
              importNames: ['Pool', 'Client', 'default'],
              allowTypeImports: true,
              message: 'Use createPool() from platform/database: it handles connection errors.',
            },
          ],
        },
      ],
    },
  },
  ...nextCoreWebVitals.map((config) => ({
    ...config,
    files: ['apps/web/**/*.{ts,tsx}'],
    settings: { ...config.settings, next: { rootDir: 'apps/web/' } },
  })),
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    // XSS sink (ADR 0021). React escapes everything else.
    rules: { 'react/no-danger': 'error' },
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: { globals: { module: 'readonly', require: 'readonly', process: 'readonly' } },
  },
);
