// Copies built narration and quote audio (content/<slug>/audio/, from tools/build_audio.py) into the static
// output. Generates nothing until audio exists for a chapter.
import { readFileSync } from 'node:fs';
import { listChapters, loadChapter, chapterAudio, quoteAudio } from '../../../content/load.js';

export function getStaticPaths() {
  const pair = (slug, name, a) => [
    { params: { slug, file: `${name}.mp3` }, props: { path: a.mp3, type: 'audio/mpeg' } },
    { params: { slug, file: `${name}.vtt` }, props: { path: a.vtt, type: 'text/vtt' } },
  ];
  return listChapters().flatMap(({ slug, n }) => {
    const a = chapterAudio(slug, n);
    const quotes = (loadChapter(slug, n).quotes || []).flatMap(q => {
      const qa = quoteAudio(slug, n, q.id);
      return qa ? pair(slug, `${n}-${q.id}`, qa) : [];
    });
    return [...(a ? pair(slug, `${n}-narration`, a) : []), ...quotes];
  });
}

export function GET({ props }) {
  return new Response(readFileSync(props.path), { headers: { 'Content-Type': props.type } });
}
