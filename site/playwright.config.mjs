import { defineConfig, devices } from '@playwright/test';
// Headless Chromium has no GPU: SwiftShader gives it WebGL2 so the 3D path (not Lite) is exercised.
const gl = { launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } };
export default defineConfig({
  testDir: 'e2e',
  // The build carries the ?debug test hooks (PUBLIC_TEST_HOOKS=1) and goes to dist-e2e/, never dist/.
  // Dev-page specs need a PUBLIC_DEV_PAGES=1 build: playwright.dev.config.mjs (npm run e2e:dev).
  testIgnore: ['portrait.spec.js', 'reconstruction.spec.js', 'scan.spec.js'],
  // Two workers (Task 5 fix round 1): every room is a real scan now, and software WebGL draws one frame
  // of the 1M-triangle desktop bundle in about 270 ms (measured on the dev machine, one worker). With
  // four browsers drawing at once, frames took seconds and tests timed on rendered frames (ring hover,
  // idle breathing) ran out of time; with two they pass. No assertion or timeout was changed for this.
  workers: 2,
  webServer: { command: 'npm run build && npm run preview', env: { PUBLIC_DEV_PAGES: '', PUBLIC_TEST_HOOKS: '1' }, port: 4321, reuseExistingServer: true, timeout: 180000 },
  use: { baseURL: 'http://localhost:4321' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], ...gl } },
    { name: 'mobile', use: { ...devices['Pixel 7'], ...gl } },
  ],
});
