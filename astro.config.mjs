// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://mayoraz-net.ch',
  integrations: [sitemap({
    // Page de confirmation : noindex + hors sitemap (contenu mince, pas un objectif SEO)
    // + /contact/merci/ et /jeu-trex/ : noindex déclarés, elles ne doivent PAS être
    //   dans le sitemap (sinon GSC signale « Submitted URL marked 'noindex' »).
    filter: (page) => !page.includes('/offre-pme/merci/')
                     && !page.includes('/contact/merci/')
                     && !page.includes('/jeu-trex/'),
  })],
});
