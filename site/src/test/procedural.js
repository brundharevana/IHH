// Fixtures for the procedural room code (room.js gallery, reconstruction.js place, layout.js doors):
// the four Einstein chapters as they were before the real-scan museum (Task 5) moved every Einstein
// room into the scanned Great Drawing Room. The procedural rooms still ship (the reconstructed-place
// dev bench, Task 6's study basis); their tests keep these exact inputs.
import { readFileSync } from 'node:fs';

export const PROCEDURAL_NUMBERS = [1, 2, 3, 4];
export const proceduralChapter = n => JSON.parse(readFileSync(new URL(`./fixtures/procedural/einstein-${n}.json`, import.meta.url), 'utf8'));
