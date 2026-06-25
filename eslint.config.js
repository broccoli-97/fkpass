import js from '@eslint/js';
import globals from 'globals';

// Flat config (ESLint v9). The published site has no build step; we lint the
// Cloudflare Pages Function and the Node-side test/config files.
//
// Note: the small inline <script> in 06-feedback.html is intentionally NOT linted
// here — eslint-plugin-html resolves its processor lazily and is brittle under
// flat config. Its one security-critical property (rendering user content via
// textContent, never innerHTML) is enforced instead by test/design-system.test.js.
export default [
  { ignores: ['node_modules/**', 'coverage/**', 'dist/**', '.wrangler/**'] },

  // Cloudflare Pages Functions run on the Workers runtime (web globals).
  {
    files: ['functions/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  // Browser-side shared scripts shipped with the site (e.g. terms.js).
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: { ...globals.browser },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },

  // Node-side tests + this config file.
  {
    files: ['test/**/*.js', 'eslint.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node, ...globals.browser },
    },
    rules: { ...js.configs.recommended.rules },
  },
];
