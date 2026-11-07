// Publishes the public fact log exports linked from "How this was made": the combined exports
// in data/export/ (tools/export.py --all), filtered by publicExports to verified, not-rejected records labelled with their review state.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from '../../content/load.js';
import { publicExports } from '../../content/exports.js';

const TYPES = { 'facts.csv': 'text/csv; charset=utf-8', 'sources.csv': 'text/csv; charset=utf-8',
  'media.csv': 'text/csv; charset=utf-8', 'provenance.jsonld': 'application/ld+json' };

export function getStaticPaths() {
  const dir = join(ROOT, 'data', 'export');
  const names = Object.keys(TYPES);
  if (!names.every(n => existsSync(join(dir, n)))) return [];
  const out = publicExports(Object.fromEntries(names.map(n => [n, readFileSync(join(dir, n), 'utf8')])));
  return names.map(file => ({ params: { file }, props: { body: out[file], type: TYPES[file] } }));
}

export function GET({ props }) {
  return new Response(props.body, { headers: { 'Content-Type': props.type } });
}
