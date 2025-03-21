import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ['src/schemas/icon.ts'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '*/services/db',
              message:
                'Direct imports from db service are not allowed outside of services directory.',
            },
            {
              name: '*/services/db/*',
              message:
                'Direct imports from db service are not allowed outside of services directory.',
            },
          ],
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_', // Add this line
        },
      ],
    },
  },
  {
    files: ['src/services/**/*.{js,mjs,cjs,ts}'],
    rules: {
      'no-restricted-imports': 'off',
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
