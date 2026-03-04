import eslintPluginAstro from 'eslint-plugin-astro';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  // Lint all JS, TS, and Astro files
  ...eslintPluginAstro.configs.recommended,

  // Disable ESLint rules that conflict with Prettier formatting
  eslintConfigPrettier,

  {
    rules: {
      // Enforce consistent use of const
      'prefer-const': 'error',
      // No unused variables
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      // No console.log in production code (warn so CI doesn't break on dev logs)
      'no-console': 'warn',
    },
  },

  {
    // Ignore build output and dependencies
    ignores: ['dist/**', 'node_modules/**', '.astro/**'],
  },
];
