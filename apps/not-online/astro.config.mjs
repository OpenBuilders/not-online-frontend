import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import { fileURLToPath } from 'node:url';

const isBuild = process.argv.includes('build');

export default defineConfig({
  site: 'https://not.online',
  output: 'server',
  adapter: cloudflare(),
  integrations: [react()],
  // In production the Vite editor build is staged here alongside the SSR
  // renderer's assets. During local Astro development keep using its source
  // public directory so `npm run dev:online` remains self-contained.
  publicDir: isBuild ? './.deploy-public' : './public',
  trailingSlash: 'never',
  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
});
