// Dev-only: serves the placeholder line from tools/build_audio.py --dev-placeholder, if built.
import { readFileSync } from 'node:fs';
import { devPagesEnabled, devAudioFile } from '../../../content/dev.js';

const FILES = { 'portrait-placeholder.mp3': 'audio/mpeg', 'portrait-placeholder.vtt': 'text/vtt' };

export function getStaticPaths() {
  if (!devPagesEnabled()) return [];
  return Object.entries(FILES).flatMap(([file, type]) => {
    const path = devAudioFile(file);
    return path ? [{ params: { file }, props: { path, type } }] : [];
  });
}

export function GET({ props }) {
  return new Response(readFileSync(props.path), { headers: { 'Content-Type': props.type } });
}
