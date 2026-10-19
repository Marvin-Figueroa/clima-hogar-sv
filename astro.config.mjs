// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Production URL — used for canonical, Open Graph and sitemap URLs
  site: 'https://climahogarsv.com',
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()],
  },
});
