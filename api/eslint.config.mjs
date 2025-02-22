import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '../services/db/**',
                'src/services/db/**',
                './services/db/**',
              ],
              message:
                'Direct imports from db services are not allowed outside of the services directory.',
            },
            {
              group: ['src/services/db/repo.ts'],
              message:
                'Direct imports from repo.ts are not allowed anywhere except within the db directory.',
            },
          ],
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['src/services/db/**/*.{js,mjs,cjs,ts}'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  {
    files: ['src/services/**/*.{js,mjs,cjs,ts}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['src/services/db/repo.ts'],
              message:
                'Direct imports from repo.ts are not allowed anywhere except within the db directory.',
            },
          ],
        },
      ],
    },
  },
  {
    languageOptions: {
      globals: globals.node,
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: '.',
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintConfigPrettier,
];
