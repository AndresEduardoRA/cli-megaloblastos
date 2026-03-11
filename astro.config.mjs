import { defineConfig } from "astro/config";
import vercel from '@astrojs/vercel';
import vue from "@astrojs/vue";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [vue({ appEntrypoint: '/src/pages/_app' }), tailwind()],
  output: 'server',
  adapter: vercel({
    webAnalytics: {
      enabled: false,
    },
  }),
});
