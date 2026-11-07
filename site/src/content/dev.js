// Dev-only pages (src/pages/dev/) are generated only when the build runs with PUBLIC_DEV_PAGES=1.
// A normal `npm run build` emits nothing under /dev/ (checked by e2e/no-dev-pages.spec.js).
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export const devPagesEnabled = () => process.env.PUBLIC_DEV_PAGES === '1';

// tools/build_audio.py --dev-placeholder writes here (gitignored).
export const DEV_AUDIO = resolve(process.cwd(), '.dev-audio');
export const devAudioFile = name => {
  const p = resolve(DEV_AUDIO, name);
  return existsSync(p) ? p : null;
};
