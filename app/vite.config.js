import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { assetVersions } from './scripts/assetVersions.mjs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { rmSync } from 'node:fs'

const root = dirname(fileURLToPath(import.meta.url))

// public/avatars/ holds the narration of the dev-only avatars.html page: keep it out of the build
const devOnlyPublic = () => ({
  name: 'ihh-dev-only-public',
  apply: 'build',
  closeBundle() {
    rmSync(resolve(root, 'dist/avatars'), { recursive: true, force: true })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), assetVersions(resolve(root, 'public')), devOnlyPublic()],
  build: {
    rollupOptions: {
      // Three pages: the landing (index.html), the guided tour (tour.html) and the WordPress embed
      // (embed.html). avatars.html (the guide-candidate review page) is served by the dev server only.
      input: {
        main: resolve(root, 'index.html'),
        tour: resolve(root, 'tour.html'),
        embed: resolve(root, 'embed.html'),
      },
    },
  },
})
