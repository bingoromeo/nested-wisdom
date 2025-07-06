import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import netlify from '@astrojs/netlify/functions'; // using serverless Netlify adapter

export default defineConfig({
  integrations: [tailwind()],
  output: 'server',
  adapter: netlify({}), // <-- pass an empty config object
})