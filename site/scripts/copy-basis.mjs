// Copies three's Basis Universal transcoder (basis_transcoder.js and .wasm) into public/basis/, where
// the KTX2Loader of a scanned room fetches it (src/museum/loader.js TRANSCODER_PATH). Run by the
// voa-basis-transcoder integration in astro.config.mjs on every dev and build run. Fails loudly if
// three no longer ships the files.
import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const BASIS_FILES = ['basis_transcoder.js', 'basis_transcoder.wasm'];
export const BASIS_SRC = join(SITE, 'node_modules', 'three', 'examples', 'jsm', 'libs', 'basis');
export const BASIS_OUT = join(SITE, 'public', 'basis');

export function copyBasisTranscoder({ src = BASIS_SRC, out = BASIS_OUT } = {}) {
  mkdirSync(out, { recursive: true });
  let bytes = 0;
  for (const f of BASIS_FILES) {
    const from = join(src, f);
    if (!existsSync(from)) throw new Error(`Basis transcoder ${f} not found in ${src}: is three installed (npm ci)?`);
    copyFileSync(from, join(out, f));
    bytes += statSync(from).size;
  }
  return bytes;
}
