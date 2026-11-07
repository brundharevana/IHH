// Dev-only: serves the Einstein painting and depth map to the /dev/portrait/ bench without the
// licence gate (see the note in src/pages/dev/[page].astro). Never emitted in production builds.
import { readFileSync } from 'node:fs';
import { devPagesEnabled } from '../../../content/dev.js';
import { portraitFiles } from '../../../content/load.js';

export function getStaticPaths() {
  const f = devPagesEnabled() ? portraitFiles('einstein') : null;
  if (!f) return [];
  return [
    { params: { file: 'einstein.webp' }, props: { path: f.image, type: 'image/webp' } },
    { params: { file: 'einstein-depth.png' }, props: { path: f.depth, type: 'image/png' } },
  ];
}

export function GET({ props }) {
  return new Response(readFileSync(props.path), { headers: { 'Content-Type': props.type } });
}
