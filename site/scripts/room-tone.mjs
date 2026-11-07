// Generates the ambient room-tone loop: seeded brown noise (integrated white noise with a small
// leak, so it stays centred), gently low-passed, 40 s mono at 22,050 Hz, about -32 dBFS RMS. The
// last 2 s are cross-faded into the first 2 s so the loop has no seam. Synthesised here, so there
// is no third-party recording and no licence to track (see public/audio/CREDITS.md).
// Writes public/audio/room-tone.mp3 via ffmpeg (64 kbps mono); the WAV is a temporary file.
// Usage (from site/): node scripts/room-tone.mjs
import { writeFileSync, unlinkSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const RATE = 22050, SECONDS = 40, FADE = 2, SEED = 20261009;
const total = (SECONDS + FADE) * RATE;
let state = SEED >>> 0;
const rand = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 2 ** 32 * 2 - 1; };

const raw = new Float64Array(total);
let brown = 0, lp = 0;
for (let i = 0; i < total; i++) {
  brown = brown * 0.998 + rand() * 0.02;
  lp += (brown - lp) * 0.25; // one-pole low-pass: takes the edge off the hiss
  raw[i] = lp;
}
// Remove DC, then cross-fade the tail into the head (equal-power) for a seamless loop.
const mean = raw.reduce((a, b) => a + b, 0) / total;
const n = SECONDS * RATE, f = FADE * RATE;
const out = new Float64Array(n);
for (let i = 0; i < n; i++) out[i] = raw[i] - mean;
for (let i = 0; i < f; i++) {
  const t = i / f;
  out[i] = out[i] * Math.sin(t * Math.PI / 2) + (raw[n + i] - mean) * Math.cos(t * Math.PI / 2);
}
const rms = Math.sqrt(out.reduce((a, v) => a + v * v, 0) / n);
const gain = 10 ** (-32 / 20) / rms;

const pcm = Buffer.alloc(44 + n * 2);
pcm.write('RIFF', 0); pcm.writeUInt32LE(36 + n * 2, 4); pcm.write('WAVE', 8);
pcm.write('fmt ', 12); pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(1, 22);
pcm.writeUInt32LE(RATE, 24); pcm.writeUInt32LE(RATE * 2, 28); pcm.writeUInt16LE(2, 32); pcm.writeUInt16LE(16, 34);
pcm.write('data', 36); pcm.writeUInt32LE(n * 2, 40);
for (let i = 0; i < n; i++) pcm.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(out[i] * gain * 32767))), 44 + i * 2);

const wav = join(tmpdir(), `voa-room-tone-${process.pid}.wav`);
writeFileSync(wav, pcm);
const dir = resolve('public', 'audio');
mkdirSync(dir, { recursive: true });
const mp3 = join(dir, 'room-tone.mp3');
try {
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wav, '-ac', '1', '-codec:a', 'libmp3lame', '-b:a', '64k', mp3], { stdio: 'inherit' });
  if (r.status !== 0) throw new Error('ffmpeg failed (is it installed?)');
} finally {
  unlinkSync(wav);
}
console.log(`wrote ${mp3} (${SECONDS} s, seed ${SEED})`);
