// Dev-only fake reconstructed place for /dev/reconstruction/ (PUBLIC_DEV_PAGES=1 builds only).
// Nothing here is real: every visible string is marked PLACEHOLDER and the basis records point at
// example.org. It exercises the production room code, plaque, unseen-wall labels and look-around.
import { validatePlace } from '../museum/reconstruction.js';

const BASIS = ['DEV-M-0001', 'DEV-M-0002'];
const PLACE = {
  w: 4, d: 5, h: 3,
  items: [
    { kind: 'desk', x: 0, z: -2.0, rotY: 0, w: 1.2, d: 0.6, h: 0.75, basis: 'DEV-M-0001' },
    { kind: 'chair', x: 0, z: -1.3, rotY: Math.PI, w: 0.45, d: 0.45, h: 0.9, basis: 'DEV-M-0001' },
    { kind: 'lamp', x: 0.4, y: 0.75, z: -2.1, rotY: 0, w: 0.2, d: 0.2, h: 0.45, basis: 'DEV-M-0001' },
    { kind: 'document', x: -0.2, y: 0.75, z: -2.0, rotY: 0.2, w: 0.21, d: 0.3, h: 0.005, basis: 'DEV-M-0001' },
    { kind: 'window', x: 1.97, y: 0.9, z: -0.5, rotY: -Math.PI / 2, w: 1.0, d: 0.06, h: 1.4, basis: 'DEV-M-0002' },
    { kind: 'bookcase', x: 1.8, z: 1.2, rotY: -Math.PI / 2, w: 1.2, d: 0.35, h: 2.0, basis: 'DEV-M-0002' },
  ],
  unseen: ['south', 'west'],
};

const EXHIBITS = [{ id: 'ex1', number: 1, type: 'framed-photograph', wall: 'north', slot: 1, media_id: 'DEV-M-0001' }];

export function devPlace() {
  const errors = validatePlace(PLACE, BASIS, EXHIBITS);
  if (errors.length) throw new Error(`dev place: ${errors.join('; ')}`);
  const basis = BASIS.map((id, i) => ({
    id, title: `PLACEHOLDER basis photograph ${i + 1}`, holder: 'PLACEHOLDER holder', date: 'PLACEHOLDER', dateKind: 'accessed',
    credit: null, url: `https://example.org/placeholder-photo-${i + 1}`,
    label: `PLACEHOLDER basis photograph ${i + 1}, PLACEHOLDER holder, accessed PLACEHOLDER`,
  }));
  const exhibits = [{
    id: 'ex1', number: 1, label: '1. PLACEHOLDER exhibit', title: 'PLACEHOLDER exhibit', type: 'framed-photograph',
    titleChips: [], media: { kind: 'image', src: '/media/DEV-M-0001.jpg', alt: 'PLACEHOLDER image' },
    notes: [], credit: null, rights: null, evidence: null, reconstruction: null,
    originalUrl: 'https://example.org/placeholder-original',
  }];
  return {
    heading: { inductee: 'PLACEHOLDER', title: 'Reconstructed place (dev only, PLACEHOLDER)', titleChips: [], accent: '#3a2a2a' },
    exhibits,
    reconstruction: { basis, note: { text: 'PLACEHOLDER note, not a fact.', chips: [] }, unseen: [...PLACE.unseen] },
    runtime: {
      slug: 'dev', n: 0,
      chapter: {
        id: 'dev-place', room: 'reconstructed-place', accent: '#3a2a2a', quotes: [], narration: [],
        exhibits: EXHIBITS,
        reconstruction: { basis_media_ids: BASIS, place: PLACE },
      },
    },
  };
}
