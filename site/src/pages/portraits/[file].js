// Publishes each inductee's painted portrait and depth map from content/<slug>/portrait/, only when
// gatedPortrait passes (verified photo record with a usable licence). Otherwise nothing is emitted
// and the chapter page shows no portrait.
import { readFileSync } from 'node:fs';
import { listInductees, loadInductee, factIndex, mediaIndex, portraitFiles } from '../../content/load.js';
import { gatedPortrait } from '../../content/portrait.js';

export function getStaticPaths() {
  return listInductees().flatMap(slug => {
    const ind = loadInductee(slug);
    const view = gatedPortrait(ind, { ...factIndex(slug), media: mediaIndex(slug) }, s => Boolean(portraitFiles(s)));
    if (!view) return [];
    const f = portraitFiles(slug);
    return [
      { params: { file: `${slug}.webp` }, props: { path: f.image, type: 'image/webp' } },
      { params: { file: `${slug}-depth.png` }, props: { path: f.depth, type: 'image/png' } },
    ];
  });
}

export function GET({ props }) {
  return new Response(readFileSync(props.path), { headers: { 'Content-Type': props.type } });
}
