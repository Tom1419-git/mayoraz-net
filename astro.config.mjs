// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://mayoraz-net.ch',
  integrations: [sitemap({
    // Page de confirmation : noindex + hors sitemap (contenu mince, pas un objectif SEO)
    filter: (page) => !page.includes('/offre-pme/merci/'),
  })],
});
