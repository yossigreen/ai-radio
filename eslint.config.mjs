// @ts-check
import eslint from '@eslint/js';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['**/dist/**', '**/.next/**', '**/coverage/**', '**/next-env.d.ts'] },
  eslint.configs.recommended,
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
              importNames: ['Pool', 'Client'],
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
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: { globals: { module: 'readonly', require: 'readonly', process: 'readonly' } },
  },
);
