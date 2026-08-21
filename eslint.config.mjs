import { defineConfig, globalIgnores } from 'eslint/config'
import react from 'eslint-plugin-react'
import _import from 'eslint-plugin-import'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import testingLibrary from 'eslint-plugin-testing-library'
import globals from 'globals'
import tsParser from '@typescript-eslint/parser'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const compat = new FlatCompat({
  baseDirectory: dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

const restrictedIcons = {
  group: ['@ant-design/icons*'],
  message: [
    'Import of icons from @ant-design/icons is restricted.',
    'Instead import from ~/glint/icons/AccessibleIconsAntDesign.',
  ].join(' '),
}

const restrictedRoutePages = {
  regex: '^(?:\\.\\.?/(?:.*/)?[A-Z][^/]*|(?:[^/]*/)*(?:pages|components)(?:/.*)?)$',
  caseSensitive: true,
  allowTypeImports: true,
  message: [
    'A static import here lands this page in the main bundle, so every user downloads it on first load',
    'even if they never open this section.',
    "Reach the page through this section's shared `page` loader instead: lazy: lazyRoute(page, m => m.YourPage).",
  ].join(' '),
}

export default defineConfig([globalIgnores([
  'app/frontend/__tests__',
  'app/frontend/glint/**/__tests__',
  'config/**/*.ts',
  '**/jest-setup.js',
  '**/vite.config.ts',
  '**/vitest.config.ts',
]), {
  extends: compat.extends(
    'airbnb',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/jsx-runtime',
  ),

  plugins: {
    react,
    import: _import,
    '@typescript-eslint': typescriptEslint,
    'testing-library': testingLibrary,
  },

  languageOptions: {
    globals: {
      ...globals.browser,
      __DEV__: true,
      __TEST__: true,
      __DISABLE_LOGGER_: true,
      __PROD__: true,
      __MOCK_SERVER_PORT__: true,
      location: true,
      I18n: true,
      Utils: true,
    },

    parser: tsParser,
    ecmaVersion: 8,
    sourceType: 'module',

    parserOptions: {
      ecmaFeatures: {
        experimentalObjectRestSpread: true,
        jsx: true,
      },
    },
  },

  settings: {
    'import/resolver': {
      node: {
        paths: ['app/frontend'],
      },

      alias: {
        '~/': '',
      },
    },
  },

  rules: {
    'import/no-named-as-default-member': 0,
    camelcase: 'off',
    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': 'error',

    '@typescript-eslint/naming-convention': ['error', {
      selector: 'variable',
      format: ['camelCase', 'UPPER_CASE', 'snake_case', 'PascalCase'],
      leadingUnderscore: 'allowSingleOrDouble',
      trailingUnderscore: 'allowSingleOrDouble',
    }],

    '@typescript-eslint/no-empty-function': 0,
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/no-this-alias': 0,

    '@typescript-eslint/no-unused-vars': ['error', {
      caughtErrors: 'none',
    }],

    '@typescript-eslint/no-unused-expressions': ['error', {
      allowShortCircuit: true,
      allowTernary: true,
    }],

    '@typescript-eslint/no-empty-object-type': 'off',
    '@typescript-eslint/member-delimiter-style': 0,
    '@typescript-eslint/no-use-before-define': 0,
    '@typescript-eslint/no-ex': 0,
    '@typescript-eslint/explicit-function-return-type': 1,

    '@typescript-eslint/explicit-module-boundary-types': [1, {
      allowTypedFunctionExpressions: true,
      allowDirectConstAssertionInArrowFunctions: true,
    }],

    '@typescript-eslint/no-empty-interface': 'off',
    semi: [2, 'never'],
    'max-len': [2, 120, 2],
    'no-debugger': 'off',
    'react/no-array-index-key': 0,
    'no-shadow': 0,
    'react/prop-types': 0,
    'react/sort-comp': 0,
    'space-before-function-paren': ['error', 'always'],
    'no-restricted-globals': 0,
    'class-methods-use-this': 0,

    'react/jsx-indent': [2, 2, {
      indentLogicalExpressions: true,
    }],

    'react/jsx-filename-extension': [1, {
      extensions: ['.js', '.jsx', '.tsx'],
    }],

    'import/extensions': 'off',
    'import/no-extraneous-dependencies': 0,
    'jsx-a11y/anchor-is-valid': 0,
    'jsx-a11y/click-events-have-key-events': 0,
    'import/no-cycle': 0,
    'import/no-unresolved': 0,
    'import/no-named-as-default': 0,
    'react/require-default-props': 0,
    'jsx-a11y/anchor-has-content': 0,
    'react/button-has-type': 0,
    'consistent-return': 0,
    'array-callback-return': 0,
    'no-param-reassign': 0,
    'no-unused-expressions': 0,
    'jsx-a11y/label-has-associated-control': 0,
    'jsx-a11y/label-has-for': 0,
    'jsx-a11y/alt-text': 0,
    'react/forbid-prop-types': 0,
    'jsx-a11y/no-static-element-interactions': 0,
    'react/no-multi-comp': 0,
    'import/prefer-default-export': 0,
    'func-names': 0,
    'no-use-before-define': 0,
    'no-template-curly-in-string': 0,
    'jsx-a11y/media-has-caption': 0,

    'no-console': ['error', {
      allow: ['warn', 'error'],
    }],

    'no-restricted-imports': ['error', {
      patterns: [restrictedIcons],
    }],
  },
}, {
  files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],

  rules: {
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
  },
}, {
  files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  extends: compat.extends('plugin:testing-library/react'),
}, {
  files: [
    'app/frontend/glint/icons/AccessibleIconsAntDesign/**',
    'app/frontend/glint/icons/**',
  ],

  rules: {
    'no-restricted-imports': 0,
  },
}, {
  // Keeps each menu section a single on-demand download: route files may only reach pages via the shared loader.
  files: [
    'app/frontend/modules/admin/**/routes/index.tsx',
    'app/frontend/modules/admin/**/routes.tsx',
    'app/frontend/modules/admin/modules/QuestionCenter/index.tsx',
  ],

  // Its route list feeds a standalone Rails entrypoint, not the admin SPA bundle.
  ignores: ['app/frontend/modules/admin/modules/IndividualDashboard/**'],

  rules: {
    'no-restricted-imports': ['error', {
      patterns: [restrictedIcons, restrictedRoutePages],
    }],
  },
}])
