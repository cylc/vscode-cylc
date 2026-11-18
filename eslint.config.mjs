import js from '@eslint/js'
import globals from 'globals'
import json from '@eslint/json'
import { defineConfig } from 'eslint/config'
import neostandard, { resolveIgnoresFromGitignore } from 'neostandard'

const commaDangle = [
  'error',
  {
    arrays: 'always-multiline',
    objects: 'always-multiline',
    imports: 'always-multiline',
    exports: 'always-multiline',
    functions: 'only-multiline',
  },
]

const jsonConfig = {
  plugins: { json },
  extends: ['json/recommended'],
}

export default defineConfig([
  ...neostandard({
    noJsx: true,
    ignores: [
      ...resolveIgnoresFromGitignore(),
    ],
  }),

  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: {
      js,
    },
    extends: [
      'js/recommended',
    ],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      '@stylistic/comma-dangle': commaDangle,
    },
  },

  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
    },
  },

  {
    files: ['**/*.json'],
    ignores: [
      'package-lock.json',
    ],
    ...jsonConfig,
    language: 'json/json',
  },

  {
    files: [
      '**/*.jsonc',
      '.vscode/*.json',
      '*.language-configuration.json',
    ],
    ...jsonConfig,
    language: 'json/jsonc',
    languageOptions: {
      allowTrailingCommas: true,
    },
  },
])
