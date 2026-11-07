export const PHONE_BUDGET = { drawCalls: 80, triangles: 150000, lights: 4, textureBytes: 24e6, downloadBytes: 2.5e6 };
// A stat that was not measured (missing, NaN, Infinity, a string, a negative count) fails the
// check: an unmeasured room must never pass the budget gate silently.
const measured = v => typeof v === 'number' && Number.isFinite(v) && v >= 0;
export function checkBudget(stats, budget = PHONE_BUDGET) {
  const s = stats && typeof stats === 'object' ? stats : {};
  return Object.keys(budget).map(k => {
    if (!measured(s[k])) return `${k} is missing or not a finite non-negative number`;
    return s[k] > budget[k] ? `${k} ${s[k]} exceeds ${budget[k]}` : null;
  }).filter(Boolean);
}

// Scanned rooms (real-scan museum spec, Budget check): written limits per device class, separate from
// the procedural-room limits above, which are unchanged. downloadBytes is the room download on that
// device: the sharp preview, the device's bundle (GLB, meshopt geometry, KTX2 textures) and the
// occluder. The Basis transcoder is not in it: it is fetched once, cached for every scanned room, and
// held to TRANSCODER_BUDGET (reading agreed in Task 3 review, fix round 1); gpuBytes is GPU memory with textures counted at their
// compressed (transcoded KTX2) size plus the geometry buffers; triangles is the bundle's mesh.
export const SCAN_BUDGET = Object.freeze({
  phone: Object.freeze({ downloadBytes: 5e6, gpuBytes: 20e6, triangles: 500000 }),
  desktop: Object.freeze({ downloadBytes: 10e6, gpuBytes: 48e6, triangles: 1000000 }),
});
// The self-hosted Basis transcoder (site/public/basis/, copied from three at build time): about
// 585 kB, fetched once and cached across rooms, so it is held to its own limit rather than counted in
// each room's download.
export const TRANSCODER_BUDGET = Object.freeze({ downloadBytes: 600000 });
// Errors for a scanned bundle ({ bytes, gpu_bytes, tris }, as content/scans/<id>.json records it) on
// a device class; [] means it may load. An unmeasured figure fails, as checkBudget does.
export function checkScanBundle(bundle, cls) {
  const limits = SCAN_BUDGET[cls];
  if (!limits) return [`unknown device class ${cls}`];
  const b = bundle && typeof bundle === 'object' ? bundle : {};
  return checkBudget({ downloadBytes: b.bytes, gpuBytes: b.gpu_bytes, triangles: b.tris }, limits);
}

// The whole scanned room on the GPU (review ruling, Task 5 fix round 1): the scan (its bundle's
// gpu_bytes) plus our layer as uploaded (easels, exhibit textures, name cards, doors, rings).
export const SCAN_ROOM_GPU = Object.freeze({ phone: 24e6, desktop: 64e6 });

// The recreated study corner's props (Task 6, tools/build_study_corner.py) have no allowance of their
// own (fix round 1): they load with the room and count in its download. Errors for a room download of
// scanBytes (preview + bundle + occluder, scanroom.js scanDownload) plus extraBytes (the corner) on a
// device class; [] means it may load. Their GPU memory counts in SCAN_ROOM_GPU with the rest of our layer.
export function roomDownloadErrors(scanBytes, extraBytes, cls) {
  const limits = SCAN_BUDGET[cls];
  if (!limits) return [`unknown device class ${cls}`];
  if (!measured(scanBytes) || !measured(extraBytes)) return ['room download is not measured'];
  const total = scanBytes + extraBytes;
  return total > limits.downloadBytes ? [`room download ${total} bytes (scan ${scanBytes} + corner ${extraBytes}) is over the ${cls} room download limit of ${limits.downloadBytes}`] : [];
}
