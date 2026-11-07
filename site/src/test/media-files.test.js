// Shipped media files (site/public/media/, always copied to the build) must each belong to a verified
// media record with a usable licence, and every exhibit's files must be there.
import { it, expect } from 'vitest';
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { listChapters, loadChapter, mediaIndex, MEDIA_DIR, listInductees } from '../content/load.js';
import { exhibitFiles } from '../museum/mediafiles.js';

const USABLE = new Set(['public-domain', 'cc0', 'cc-by', 'cc-by-sa']);
const records = new Map(listInductees().flatMap(slug => [...mediaIndex(slug)]));

it('every exhibit has its panel image, room texture and (360 documents) GLB', () => {
  for (const { slug, n } of listChapters()) {
    for (const ex of loadChapter(slug, n).exhibits || []) {
      const f = exhibitFiles(ex);
      for (const key of [f.front, f.back].filter(Boolean)) {
        expect(existsSync(join(MEDIA_DIR, `${key}.jpg`)), `${slug}/${n} ${ex.id} ${key}.jpg`).toBe(true);
        expect(existsSync(join(MEDIA_DIR, 'room', `${key}.jpg`)), `${slug}/${n} ${ex.id} room/${key}.jpg`).toBe(true);
      }
      if (f.model) expect(existsSync(join(MEDIA_DIR, `${f.model}.glb`)), `${slug}/${n} ${ex.id} ${f.model}.glb`).toBe(true);
    }
  }
});

it('every shipped media file belongs to a verified record with a usable licence', () => {
  const files = [...readdirSync(MEDIA_DIR), ...readdirSync(join(MEDIA_DIR, 'room'))].filter(f => /\.(jpg|glb)$/.test(f));
  expect(files.length).toBeGreaterThan(0);
  for (const f of files) {
    const id = (/^([A-Z]{3}-M-\d{4})/.exec(f) || [])[1];
    const m = records.get(id);
    expect(Boolean(m && m.status === 'verified' && USABLE.has(m.license_class)), f).toBe(true);
  }
});
