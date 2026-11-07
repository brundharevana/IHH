// Artifact records for the viewer (artifact/ArtifactViewer.jsx), keyed by media id
// (data/inductees/<slug>/media.jsonl, status "verified"). Shape and rules: ./README.md.
// Every visitor-facing line is a verbatim part of a verified fact (factId alongside); title, holder,
// catalogue id, rights and credit come from the media record.
import { EINSTEIN_ARTIFACTS } from './einstein-artifacts.js'
import { LAMARR_ARTIFACTS } from './lamarr-artifacts.js'
import { NAISMITH_ARTIFACTS } from './naismith-artifacts.js'
import { MUIR_ARTIFACTS } from './muir-artifacts.js'
import { ALBRIGHT_ARTIFACTS } from './albright-artifacts.js'

export const ARTIFACTS = {
  // Einstein's documents and photographs (letters, naturalization record, Navy photographs)
  ...EINSTEIN_ARTIFACTS,
  // Hedy Lamarr's documents, photographs and the labelled mechanism recreation (lamarr-artifacts.js)
  ...LAMARR_ARTIFACTS,
  // James Naismith's book, newspaper pages, the Hall of Fame photograph, the link-only first-team
  // photograph and the labelled peach basket and ball recreations (naismith-artifacts.js)
  ...NAISMITH_ARTIFACTS,
  // John Muir's passport application, 1863 drawings, Yosemite and Glacier Point photographs, the 1875
  // fern sheet, the 1887 self-portrait, the rooms' basis photographs and the link-only 1913 petition
  // (muir-artifacts.js)
  ...MUIR_ARTIFACTS,
  // Madeleine Albright's photographs (six federal photographs in which she wears a pin among them), the
  // UN contact sheet, the typed memorandum (owner ruling), the rooms' basis photographs, and the link-only
  // handwritten letters and brooch page (albright-artifacts.js)
  ...ALBRIGHT_ARTIFACTS,
  // The nine letters to Lieutenant Stephen Brunauer as one series (kind 'series'): the viewer pages
  // through the letters in date order, with a date picker; each letter keeps its own record and card.
  'EIN-SERIES-BRUNAUER': {
    id: 'EIN-SERIES-BRUNAUER',
    slug: 'einstein',
    kind: 'series',
    title: 'Letters to Lieutenant Stephen Brunauer, 1943-1944',
    date: '1943-1944',
    year: 1943,
    theme: 'Science',
    letters: ['EIN-M-0050', 'EIN-M-0015', 'EIN-M-0051', 'EIN-M-0052', 'EIN-M-0053', 'EIN-M-0054', 'EIN-M-0055', 'EIN-M-0056', 'EIN-M-0057'],
    lines: [],
  },
  // Photograph series (owner feedback round 8, item 5): the photographs of one moment, shown at one stop and
  // narrated by one record line. The viewer steps through them (numbered chips, arrow keys); each photograph keeps
  // its own record and card. The series' title is IHH's grouping: its record line is grounded only in its
  // photographs' own cards (check_narration.py), and its numbers in their records (displayedNumbers.js).
  'EIN-SERIES-GOTHENBURG-1923': {
    id: 'EIN-SERIES-GOTHENBURG-1923',
    slug: 'einstein',
    kind: 'series',
    unit: 'photograph',
    title: 'Albert Einstein, Nobel Prize lecture, Gothenburg, July 11, 1923',
    date: 'July 11, 1923',
    year: 1923,
    letters: ['EIN-M-0079', 'EIN-M-0081'],
    lines: [],
  },
  'EIN-SERIES-SEATED-1954': {
    id: 'EIN-SERIES-SEATED-1954',
    slug: 'einstein',
    kind: 'series',
    unit: 'photograph',
    title: 'Albert Einstein in study, seated',
    date: '1954',
    year: 1954,
    letters: ['EIN-M-0030', 'EIN-M-0032'],
    lines: [],
  },
  // EIN-M-0042 is undated: the series carries no date of its own
  'EIN-SERIES-STANDING': {
    id: 'EIN-SERIES-STANDING',
    slug: 'einstein',
    kind: 'series',
    unit: 'photograph',
    title: 'Albert Einstein in study, standing; looking out window',
    letters: ['EIN-M-0031', 'EIN-M-0042', 'EIN-M-0033'],
    lines: [],
  },
  // John Muir: the three 1923 photographs of the Fountain Lake farm (Wisconsin Historical Society), and the two 1903
  // Underwood & Underwood stereographs of Glacier Point (Library of Congress)
  'MUI-SERIES-FOUNTAIN-1923': {
    id: 'MUI-SERIES-FOUNTAIN-1923',
    slug: 'muir',
    kind: 'series',
    unit: 'photograph',
    title: 'Muir’s Fountain Lake Home',
    date: '1923',
    year: 1923,
    letters: ['MUI-M-0086', 'MUI-M-0084', 'MUI-M-0085'],
    lines: [],
  },
  'MUI-SERIES-GLACIER-1903': {
    id: 'MUI-SERIES-GLACIER-1903',
    slug: 'muir',
    kind: 'series',
    unit: 'photograph',
    title: 'Theodore Roosevelt and John Muir on Glacier Point, Yosemite Valley, California, in 1903',
    date: '1903',
    year: 1903,
    letters: ['MUI-M-0079', 'MUI-M-0013'],
    lines: [],
  },
  // Madeleine Albright: the National Archives' photographs of the naturalization ceremony of September 14, 2016
  'ALB-SERIES-CEREMONY-2016': {
    id: 'ALB-SERIES-CEREMONY-2016',
    slug: 'albright',
    kind: 'series',
    unit: 'photograph',
    title: 'Naturalization Ceremony at the National Archives in Washington, D.C.',
    date: 'September 14, 2016',
    year: 2016,
    letters: ['ALB-M-0070', 'ALB-M-0017', 'ALB-M-0064'],
    lines: [],
  },
  'EIN-M-0025': {
    id: 'EIN-M-0025',
    slug: 'einstein',
    kind: 'photo',
    title: 'Albert Einstein and Elsa Einstein arriving by ship, San Diego, 1930',
    date: 'December 31, 1930',
    year: 1930,
    theme: 'Immigration & Migration',
    holder: 'University of California, Los Angeles. Library. Department of Special Collections',
    catalogueId: 'ark:/21198/zz002dd690',
    rights: 'CC BY 4.0',
    source: 'https://digital.library.ucla.edu/catalog/ark:/21198/zz002dd690',
    credit: 'Los Angeles Times Photographic Collection, University of California, Los Angeles. Library. Department of Special Collections. CC BY 4.0.',
    alt: 'View of Albert Einstein and Elsa Einstein aboard the ship, the SS Belgenland, upon their arrival in San Diego. December 31, 1930.',
    photos: [{ src: '/landing/artifacts/EIN-M-0025.webp', label: 'Photograph' }],
    lines: [
      { label: 'Arrival', text: 'In 1930, Albert Einstein and Elsa Einstein arrived in San Diego on the Belgenland.', factId: 'EIN-F-0120' },
      { label: 'Dated', text: 'On Dec. 31, 1930, Dr. Albert Einstein arrived in San Diego enroute to Pasadena.', factId: 'EIN-F-0099' },
    ],
  },
}

// Dev only (?viewer=test): exercises the viewer modes with files already in the repo. Never shown
// to visitors; labelled as a viewer test, not an artifact.
export const VIEWER_TESTS = import.meta.env.DEV
  ? {
      'test-pages': {
        id: 'test-pages',
        kind: 'document',
        title: 'Viewer test: page-through',
        test: true,
        pages: [
          { src: '/tour/letter-EIN-M-0015-p1.webp', sizeM: [0.2163, 0.279], label: 'Page 1' },
          { src: '/landing/artifacts/EIN-M-0002.webp', sizeM: [0.2, 0.25], label: 'Page 2' },
        ],
        lines: [],
      },
      'test-sheet': {
        id: 'test-sheet',
        kind: 'sheet',
        title: 'Viewer test: sheet with a back',
        test: true,
        pages: [{ src: '/landing/artifacts/EIN-M-0025.webp', back: '/landing/artifacts/EIN-M-0002.webp', sizeM: [0.25, 0.2] }],
        lines: [],
      },
      'test-photoset': {
        id: 'test-photoset',
        kind: 'photoset',
        title: 'Viewer test: photo set',
        test: true,
        photos: [
          { src: '/landing/artifacts/EIN-M-0002.webp', label: 'Front' },
          { src: '/landing/artifacts/EIN-M-0025.webp', label: 'Back' },
          { src: '/media/einstein/EIN-M-0059.webp', label: 'Detail' },
        ],
        lines: [],
      },
      'test-model': {
        id: 'test-model',
        kind: 'model',
        title: 'Viewer test: glTF object',
        test: true,
        model: { src: '/models/guide-candidates/docent-b-business-female-01.glb', notes: [{ pos: [0, 1.55, 0.1], label: 'Head', text: 'A note pinned to a point on the object.' }] },
        lines: [],
      },
    }
  : {}

// Media whose rights are unknown or disputed: shown as link-only (neutral icon plus "View at the
// holder"), never as an image, a page-through or a thumbnail. Any media file on a record listed here
// is stripped, so a record cannot display by accident. EIN-M-0058 and LAM-M-0028 have no record in the
// app; they are listed so none can be added with an image. ALB-M-0027 is reached only as a link from
// ALB-M-0059's card (`links`). Every id here must be a verified record or one the owner ruled link-only
// (scripts/check_content.mjs LINK_ONLY_RULED: ALB-M-0054, ALB-M-0056); a rejected record (the Einstein
// letter the store rejected) is not listed, and the content gate fails the build if any data names it.
export const LINK_ONLY = new Set(['NAI-M-0004', 'EIN-M-0016', 'EIN-M-0058', 'MUI-M-0061', 'LAM-M-0028', 'ALB-M-0054', 'ALB-M-0056', 'ALB-M-0027'])
for (const id of LINK_ONLY) {
  const a = ARTIFACTS[id]
  if (!a) continue
  a.linkOnly = true
  delete a.pages
  delete a.photos
  delete a.model
  delete a.backdrop
}

// The records of a series, in the order listed (date order).
export const seriesLetters = (art) => (art?.letters || []).map((id) => ARTIFACTS[id]).filter(Boolean)

export const artifactById = (id) => ARTIFACTS[id] || VIEWER_TESTS[id] || null

// The files of the photo room built from a photograph record (its `backdrop`: the projected photo, the filled plate
// and the proxy masks), or null. A photo room (place.photo) names only its record; its files come from the record,
// so the record a place declares is the one it draws (round 9 fix round 7, Codex review 6).
export const backdropOf = (mediaId) => {
  const a = mediaId ? ARTIFACTS[mediaId] : null
  return a && !a.linkOnly && a.backdrop ? a.backdrop : null
}
