import typescript from '@typescript-eslint/eslint-plugin';
import type { ParserOptions } from '@typescript-eslint/parser';
import typescriptParser from '@typescript-eslint/parser';
import type { ESLint, Linter } from 'eslint';
import { globalIgnores } from 'eslint/config';

const config: Linter.Config[] = [
  // Global settings
  globalIgnores(['dist']),

  {
    ignores: [],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      } satisfies ParserOptions,
      parser: typescriptParser,
      globals: {
        node: true,
      },
    },
  },

  // TypeScript configurations
  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': typescript as typeof typescript & ESLint.Plugin,
    },
    rules: {
      // Intentional uses of non-null assertions here. We want non-existent keys to throw errors!
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ...typescript.configs['recommended']!.rules,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ...typescript.configs['strict-type-checked']!.rules,

      // Your custom rules
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'warn',
      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        {
          ignoreVoidOperator: true,
        },
      ],
      '@typescript-eslint/no-extraneous-class': [
        'warn',
        {
          allowWithDecorator: true,
        },
      ],
      '@typescript-eslint/no-invalid-void-type': [
        'warn',
        {
          allowAsThisParameter: true,
        },
      ],
      '@typescript-eslint/no-meaningless-void-operator': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-use-before-define': ['error', 'nofunc'],
      '@typescript-eslint/no-shadow': 'warn',
      '@typescript-eslint/prefer-for-of': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': [
        'error',
        {
          ignorePrimitives: true,
        },
      ],

      // Already flagged by TypeScript
      '@typescript-eslint/no-unused-vars': 'off',

      // General rules
      'max-lines-per-function': [
        'warn',
        {
          max: 100,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      complexity: ['warn', { max: 15 }],
      'eol-last': ['error', 'always'],
    } satisfies Linter.RulesRecord,
  },
];

export default config;
