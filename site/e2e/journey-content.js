// The shipped Einstein journey (content/einstein/journey.json), so e2e checks follow content changes
// (stops renumbered, labels narrowed) instead of hard-coding old labels.
import { readFileSync } from 'node:fs';

export const JOURNEY = JSON.parse(readFileSync(new URL('../../content/einstein/journey.json', import.meta.url), 'utf8'));
export const stopOf = id => JOURNEY.stops.find(s => s.id === id);
export const numberOf = id => JOURNEY.stops.findIndex(s => s.id === id) + 1;
export const headingOf = id => { const s = stopOf(id); return s.date ? `${s.label}, ${s.date}` : s.label; };
export const MAPPED = JOURNEY.stops.filter(s => s.map).map(s => s.id);
// The list control of a stop: its number and heading, as one accessible name.
export const titleName = id => `${numberOf(id)} ${headingOf(id)}`;

// The aerial manifest the site ships for a pinned stop (site/public/aerial/einstein/<id>/).
export const aerialOf = id => JSON.parse(readFileSync(new URL(`../public/aerial/einstein/${id}/manifest.json`, import.meta.url), 'utf8'));
// Pinned stops with no room at city precision: choosing one zooms to the neighbourhood and ends on its
// stop card. PLAIN is the first of them (the specs once named Berne, removed when its fact lost G5).
export const PLAIN_STOPS = MAPPED.filter(id => !stopOf(id).chapter && aerialOf(id).precision === 'city');
export const PLAIN = PLAIN_STOPS[0];
