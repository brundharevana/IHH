// Dev-only bench for scanned rooms, /dev/scan/<id>/ (PUBLIC_DEV_PAGES=1 builds only). It loads a real
// scan bundle with the production room code and stands two Einstein exhibits (chapter 1, ex1 and ex2,
// verified records) on easels, at PLACEHOLDER spots chosen for testing: Task 5 places the real
// exhibits. The next room (for the prefetch) is another usable scan.
import { loadScan, loadChapter, loadInductee, factIndex, mediaIndex, exhibitView } from './load.js';
import { scanRuntime, scanCredit } from '../museum/scanroom.js';

// Free floor in front of each room's centre (from the occluder: floor survey on a 0.5 m grid, redone
// after the rooms were squared to their walls in Task 3 fix round 1).
const EASELS = {
  'kings-hall': [{ x: -1.1, z: -4.6, rotY: 0 }, { x: 1.1, z: -4.6, rotY: 0 }],
  'hallwyl-great-drawing-room': [{ x: -0.9, z: -1.6, rotY: 0 }, { x: 0.9, z: -1.6, rotY: 0 }],
  'hallwyl-dining-room': [{ x: -1.0, z: -3.4, rotY: 0 }, { x: 0.8, z: -3.4, rotY: 0 }],
};
export const DEV_SCAN_IDS = Object.keys(EASELS);
const NEXT = { 'kings-hall': 'hallwyl-great-drawing-room', 'hallwyl-great-drawing-room': 'kings-hall', 'hallwyl-dining-room': 'kings-hall' };

export function devScan(id) {
  const m = loadScan(id);
  const ch = loadChapter('einstein', 1);
  const inductee = loadInductee('einstein');
  const idx = { ...factIndex('einstein'), media: mediaIndex('einstein') };
  const raw = ch.exhibits.filter(e => ['ex1', 'ex2'].includes(e.id)).map((e, i) => {
    const { wall, slot, ...rest } = e;
    return { ...rest, easel: { ...EASELS[id][i], group: 'easels' } };
  });
  return {
    heading: { inductee: 'PLACEHOLDER (dev bench)', title: `Scanned room (dev only): ${m.place}`, titleChips: [], accent: '#3a2a2a' },
    exhibits: raw.map(e => exhibitView(e, idx)),
    scan: scanCredit(m, inductee.name),
    liteHref: '/einstein/lite/',
    runtime: {
      slug: 'dev', n: 0,
      chapter: { room: { scan: id }, title: 'PLACEHOLDER', accent: '#3a2a2a', quotes: [], narration: [], exhibits: raw },
      scan: scanRuntime(m),
      next: { scan: scanRuntime(loadScan(NEXT[id])) },
    },
  };
}
