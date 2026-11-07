// Test helper: exhibits sized as the runtime sizes them. The runtime gives each exhibit its media
// file's aspect (exhibits.js aspectOf reads the loaded texture's image size); without it a test
// frames a default-sized exhibit (fix round 1: a landscape photograph is wider on the phone than the
// test assumed, and the study corner's close view that passed the test fell back at runtime).
// textureOf(ex) -> { front, back } stand-ins carrying only { image: { width, height } }, read from
// the JPEG headers of the shipped files in site/public/media/.
import { readFileSync, existsSync } from 'node:fs';
import { exhibitFiles } from '../museum/mediafiles.js';

const MEDIA = new URL('../../public/media/', import.meta.url);

// Width and height of a baseline or progressive JPEG (its first SOFn segment).
export function jpegSize(buf) {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) throw new Error('not a JPEG');
  let at = 2;
  while (at < buf.length) {
    if (buf[at] !== 0xff) throw new Error(`JPEG marker expected at ${at}`);
    const m = buf[at + 1], len = buf.readUInt16BE(at + 2);
    if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return { width: buf.readUInt16BE(at + 7), height: buf.readUInt16BE(at + 5) };
    at += 2 + len;
  }
  throw new Error('no frame header');
}

const sized = key => {
  if (!key) return null;
  const f = new URL(`${key}.jpg`, MEDIA);
  if (!existsSync(f)) throw new Error(`no shipped media file ${key}.jpg`);
  return { image: jpegSize(readFileSync(f)) };
};

export const mediaTextureOf = ex => { const f = exhibitFiles(ex); return { front: sized(f.front), back: sized(f.back) }; };
