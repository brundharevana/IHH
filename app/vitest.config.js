import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'
import { assetVersions } from './scripts/assetVersions.mjs'
export default defineConfig({
  plugins: [assetVersions(fileURLToPath(new URL('./public', import.meta.url)))],
  test: { environment: 'node', include: ['src/**/*.test.js', 'scripts/**/*.test.js'] },
})
