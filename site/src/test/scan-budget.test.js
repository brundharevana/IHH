// Budget gate for scanned rooms (real-scan museum, Task 3): explicit per-device-class limits; GPU
// memory at compressed (KTX2) size; procedural-room limits unchanged; the self-hosted Basis
// transcoder's size recorded and held to its own limit.
import { it, expect, describe } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { PHONE_BUDGET, SCAN_BUDGET, TRANSCODER_BUDGET, checkScanBundle } from '../museum/budget.js';
import { ROOT } from '../content/load.js';

const BASIS = join(process.cwd(), 'node_modules', 'three', 'examples', 'jsm', 'libs', 'basis');
const manifests = readdirSync(join(ROOT, 'content', 'scans')).filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(readFileSync(join(ROOT, 'content', 'scans', f), 'utf8')));

describe('scanned-room limits', () => {
  it('are the written per-device figures', () => {
    expect(SCAN_BUDGET).toEqual({
      phone: { downloadBytes: 5e6, gpuBytes: 20e6, triangles: 500000 },
      desktop: { downloadBytes: 10e6, gpuBytes: 48e6, triangles: 1000000 },
    });
    expect(Object.isFrozen(SCAN_BUDGET) && Object.isFrozen(SCAN_BUDGET.phone) && Object.isFrozen(SCAN_BUDGET.desktop)).toBe(true);
  });
  it('leave the procedural-room phone limits unchanged', () => {
    expect(PHONE_BUDGET).toEqual({ drawCalls: 80, triangles: 150000, lights: 4, textureBytes: 24e6, downloadBytes: 2.5e6 });
  });
});

describe('checkScanBundle', () => {
  const phoneOk = { bytes: 4.5e6, gpu_bytes: 14.9e6, tris: 499995 };
  it('passes a bundle within its device limits', () => {
    expect(checkScanBundle(phoneOk, 'phone')).toEqual([]);
    expect(checkScanBundle({ bytes: 9.4e6, gpu_bytes: 43.9e6, tris: 999999 }, 'desktop')).toEqual([]);
  });
  it('rejects an over-limit phone bundle (fixture), naming each limit', () => {
    const over = { bytes: 5e6 + 1, gpu_bytes: 20e6 + 1, tris: 500001 };
    const e = checkScanBundle(over, 'phone');
    expect(e).toHaveLength(3);
    expect(e.join(' ')).toMatch(/downloadBytes 5000001 exceeds 5000000.*gpuBytes 20000001 exceeds 20000000.*triangles 500001 exceeds 500000/);
  });
  it('rejects a desktop bundle on a phone', () => {
    expect(checkScanBundle({ bytes: 9.4e6, gpu_bytes: 43.9e6, tris: 999999 }, 'phone')).toHaveLength(3);
  });
  it('rejects an over-limit desktop bundle', () => {
    expect(checkScanBundle({ bytes: 10e6 + 1, gpu_bytes: 30e6, tris: 1e6 }, 'desktop')).toEqual(['downloadBytes 10000001 exceeds 10000000']);
    expect(checkScanBundle({ bytes: 9e6, gpu_bytes: 48e6 + 1, tris: 1e6 }, 'desktop')).toEqual(['gpuBytes 48000001 exceeds 48000000']);
  });
  it('fails an unmeasured bundle and an unknown device class', () => {
    expect(checkScanBundle({ bytes: 1 }, 'phone')).toEqual([
      'gpuBytes is missing or not a finite non-negative number',
      'triangles is missing or not a finite non-negative number',
    ]);
    expect(checkScanBundle(null, 'phone')).toHaveLength(3);
    expect(checkScanBundle(phoneOk, 'tablet')).toEqual(['unknown device class tablet']);
  });
});

describe('shipped scans', () => {
  it('every usable manifest has both bundles, each within its device limits', () => {
    const usable = manifests.filter(m => m.usable !== false);
    expect(usable.map(m => m.id).sort()).toEqual(['hallwyl-dining-room', 'hallwyl-great-drawing-room', 'kings-hall']);
    for (const m of usable) {
      for (const cls of ['phone', 'desktop']) {
        // The room download per device is the preview, the device bundle and the occluder.
        const download = m.preview.bytes + m.bundles[cls].bytes + m.occluder.bytes;
        expect(checkScanBundle({ ...m.bundles[cls], bytes: download }, cls), `${m.id} ${cls}`).toEqual([]);
        // GPU memory is counted at the compressed texture size plus the geometry.
        expect(m.bundles[cls].gpu_bytes).toBe(m.bundles[cls].gpu_texture_bytes + m.bundles[cls].gpu_geometry_bytes);
      }
    }
  });
});

describe('Basis transcoder', () => {
  it('is recorded in the budgets and its files fit', () => {
    expect(TRANSCODER_BUDGET).toEqual({ downloadBytes: 600000 });
    const bytes = ['basis_transcoder.js', 'basis_transcoder.wasm'].reduce((a, f) => a + statSync(join(BASIS, f)).size, 0);
    expect(bytes).toBeGreaterThan(0);
    expect(bytes).toBeLessThanOrEqual(TRANSCODER_BUDGET.downloadBytes);
  });
});
