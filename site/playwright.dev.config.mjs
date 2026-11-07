import { defineConfig, devices } from '@playwright/test';
// Dev-page specs (portrait player bench at /dev/portrait/, reconstructed place at /dev/reconstruction/,
// scanned rooms at /dev/scan/<id>/). Builds with PUBLIC_DEV_PAGES=1 into
// dist-dev/ and serves it on its own port, so the production server on 4321 is never reused.
const gl = { launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } };
export default defineConfig({
  testDir: 'e2e',
  testMatch: ['portrait.spec.js', 'reconstruction.spec.js', 'scan.spec.js'],
  webServer: {
    command: 'npm run build && npx astro preview --port 4322',
    env: { PUBLIC_DEV_PAGES: '1', PUBLIC_TEST_HOOKS: '1' },
    port: 4322, reuseExistingServer: false, timeout: 180000,
  },
  use: { baseURL: 'http://localhost:4322' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], ...gl } },
    { name: 'mobile', use: { ...devices['Pixel 7'], ...gl } },
  ],
});
