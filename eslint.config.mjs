import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';
export default [
  { ignores: ['dist/**', '.astro/**', '.qa/**', 'test-results/**', 'node_modules/**', '.sites-runtime/**'] },
  js.configs.recommended, ...tseslint.configs.recommended, ...astro.configs['flat/recommended'],
  { languageOptions: { globals: { ...globals.browser, ...globals.node } }, rules: { 'no-console': 'error', 'no-debugger': 'error' } },
  { files: ['**/*.astro'], languageOptions: { parserOptions: { parser: tseslint.parser } } }
];
