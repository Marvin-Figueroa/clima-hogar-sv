// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Production URL — used for canonical, Open Graph and sitemap URLs
  site: 'https://climahogarsv.com',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      // Thank-you page is noindex — keep it out of the sitemap
      filter: (page) => !page.includes('/gracias/'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
