// The public origin the WordPress oEmbed response points at. The production domain is not decided
// yet, so this is ONE placeholder on the reserved .example TLD (it never resolves). Replace it with
// the real origin before the oEmbed file is handed to IHH, then run `node scripts/write-oembed.mjs`;
// src/test/embed.test.js fails if public/oembed/*.json drifts from it.
export const PRODUCTION_ORIGIN = 'https://voices-of-arrival.example';
