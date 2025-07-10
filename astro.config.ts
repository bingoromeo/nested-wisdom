import { defineConfig } from "astro/config";
import netlify from "@astrojs/netlify/functions";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: netlify({
    // This is the crucial fix: prevents SSR from intercepting your API/functions
    exclude: ["/api/*", "/.netlify/functions/*"]
  }),
});
