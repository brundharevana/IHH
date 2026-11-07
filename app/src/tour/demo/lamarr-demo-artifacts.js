// Artifact records for the two presentation demos (tour.html?demo=photo-room | gallery-case), in the
// shape of data/artifacts.js (data/README.md). Title, holder, catalogue id, rights, credit, alt and
// source are the media records' own words (data/inductees/lamarr/media.jsonl, status verified,
// license_class public-domain). Every line is a verified fact's text (facts.jsonl), id alongside.
// Page labels for the patent case file name the page, as listed in data/inductees/lamarr/ARTIFACTS.md.
// Physical page sizes are not in the records: pages keep the scans' aspect ratio.
import { narr } from '../data/shape.js'

const D = '/rooms-demo/lamarr'
const portrait = (w, h) => [0.28 * (w / h), 0.28]
const landscape = (w, h) => [0.28, 0.28 * (h / w)]

export const NORMANDIE_PHOTO = {
  id: 'LAM-M-0023',
  slug: 'lamarr',
  kind: 'photo',
  title: 'S.S. Normandie arriving in New York Harbor on maiden voyage',
  maker: 'Fairchild Aerial Surveys, Inc.',
  date: 'c1936 Jan. 27',
  theme: 'Immigration & Migration',
  holder: 'Library of Congress Prints and Photographs Division',
  catalogueId: 'LC-USZ62-90162',
  rights: 'Public domain (no known restrictions on publication)',
  source: 'https://www.loc.gov/item/97504351/',
  credit: 'Library of Congress Prints and Photographs Division',
  alt: 'S.S. Normandie arriving in New York Harbor on maiden voyage.',
  photos: [{ src: `${D}/LAM-M-0023.webp`, label: 'Photograph' }],
  lines: [],
}

export const NATURALIZATION_FILE = {
  id: 'LAM-M-0022',
  slug: 'lamarr',
  kind: 'document',
  title: 'Petition for Naturalization for Hedwig Maria Stauffer',
  theme: 'Immigration & Migration',
  holder: 'National Archives at Riverside',
  catalogueId: 'NAID 335708097',
  rights: 'Public domain',
  source: 'https://catalog.archives.gov/id/335708097',
  credit: 'National Archives at Riverside, Petition for Naturalization for Hedwig Maria Stauffer, NAID 335708097.',
  alt: 'This file contains a certificate of arrival, declaration of intention, affidavits of witnesses, and petition for naturalization for Hedwig Maria Stauffer, also known as Hedy Lamarr.',
  pages: [
    { src: `${D}/LAM-M-0022-p1.webp`, sizeM: portrait(1689, 2048) },
    { src: `${D}/LAM-M-0022-p2.webp`, sizeM: portrait(1570, 2048) },
    { src: `${D}/LAM-M-0022-p3.webp`, sizeM: portrait(1569, 2048) },
    { src: `${D}/LAM-M-0022-p4.webp`, sizeM: landscape(2048, 1319) },
    { src: `${D}/LAM-M-0022-p5.webp`, sizeM: landscape(2048, 1317) },
    { src: `${D}/LAM-M-0022-p6.webp`, sizeM: landscape(2048, 1281) },
    { src: `${D}/LAM-M-0022-p7.webp`, sizeM: landscape(2048, 1342) },
    { src: `${D}/LAM-M-0022-p8.webp`, sizeM: landscape(2048, 1273) },
    { src: `${D}/LAM-M-0022-p9.webp`, sizeM: landscape(2048, 1297) },
  ],
  lines: [
    { label: 'Also known as', text: 'Hedwig Maria Stauffer is also known as Hedy Lamarr.', factId: 'LAM-F-0007' },
    {
      label: 'The file',
      text: 'The naturalization file at the National Archives at Riverside for Hedwig Maria Stauffer, also known as Hedy Lamarr, Hedwig Kiesler Mandl Markey, Hedy Kiesler, Hedy Mandl, and Hedy Markey, contains a certificate of arrival, declaration of intention, affidavits of witnesses, and petition for naturalization.',
      factId: 'LAM-F-0001',
    },
  ],
}

const CASE_FILE_COMMON = {
  slug: 'lamarr',
  theme: 'Science',
  holder: 'National Archives at Kansas City',
  catalogueId: 'NAID 167820368',
  rights: 'Public domain',
  source: 'https://catalog.archives.gov/id/167820368',
  credit: 'National Archives at Kansas City, Records of the Patent and Trademark Office, Utility Patent Case Files, NAID 167820368.',
  alt: 'Patent Case File No. 2,292,387, Secret Communication System, Inventors Hedy Kiesler Markey and George Antheil. Architectural and Engineering Drawings and Textual Records.',
}

const pg = (n, w, label) => ({ src: `${D}/LAM-M-0001-p${n}.webp`, sizeM: portrait(w, 2048), label })

export const PATENT_CASE_FILE = {
  ...CASE_FILE_COMMON,
  id: 'LAM-M-0001',
  kind: 'document',
  title: 'Patent Case File No. 2,292,387, Secret Communication System',
  maker: 'Hedy Kiesler Markey and George Antheil',
  // seven of the file's 43 pages are on file (ARTIFACTS.md); in the order of the case
  pages: [
    pg(34, 1244, 'Petition and power of attorney'),
    pg(33, 1244, 'Signatures and oath'),
    pg(5, 1407, 'Drawing sheet 1'),
    pg(6, 1407, 'Drawing sheet 2'),
    pg(39, 1520, 'Notice of allowance'),
    pg(41, 1583, 'Final fee'),
    pg(7, 1407, 'Printed patent'),
  ],
  lines: [
    { label: 'Inventors', text: 'The Inventors of Patent Case File No. 2,292,387, Secret Communication System, were Hedy Kiesler Markey and George Antheil.', factId: 'LAM-F-0046' },
    { label: 'Filed', text: 'Secret Communication System, by Hedy Kiesler Markey and George Antheil, was filed June 10, 1941.', factId: 'LAM-F-0091' },
    { label: 'Signed', text: 'In 1941 Hedy Kiesler Markey and George Antheil signed at Los Angeles, Calif., as inventors of the Secret Communication System.', factId: 'LAM-F-0096' },
  ],
  clip: narr('lamarr', 1, ['c4'], ['LAM-F-0096']),
  listen: 'Hear about the case file',
}

// The printed patent: one page of the same case file, shown on its own stand in the case.
export const PRINTED_PATENT = {
  ...CASE_FILE_COMMON,
  id: 'LAM-M-0001',
  kind: 'sheet',
  title: 'Patent 2,292,387, Secret Communication System',
  maker: 'Hedy Kiesler Markey and George Antheil',
  date: 'Aug. 11, 1942',
  pages: [pg(7, 1407, 'Printed patent')],
  lines: [
    { label: 'Patented', text: 'Patent 2,292,387, Secret Communication System, was patented Aug. 11, 1942.', factId: 'LAM-F-0090' },
    { label: 'Inventors', text: 'Patent 2,292,387, Secret Communication System, is by Hedy Kiesler Markey of Los Angeles and George Antheil of Manhattan Beach, Calif.', factId: 'LAM-F-0097' },
    { label: 'Awarded', text: 'Lamarr and Antheil were awarded U.S. Patent 2,292,387 in 1942.', factId: 'LAM-F-0084' },
  ],
  clip: narr('lamarr', 1, ['c5'], ['LAM-F-0084']),
  listen: 'Hear about the patent',
}

// The gallery's wall panel: the chapter's verified lines, verbatim (LAM-F-0090 to LAM-F-0095).
export const PANEL_LINES = [
  { factId: 'LAM-F-0091', text: 'Secret Communication System, by Hedy Kiesler Markey and George Antheil, was filed June 10, 1941.' },
  { factId: 'LAM-F-0093', text: 'The post-office address of Hedy Kiesler Markey and George Antheil, petitioners to the U.S. Patent Office on Jun 10 1941, was 11805 Bellagio Road, Bel-Air, Los Angeles, California.' },
  { factId: 'LAM-F-0092', text: 'The United States Patent Office allowed the application of Hedy Kiesler Markey for a patent for the Secret Communication System with 6 claims; Notice of Allowance NOV 13 1941.' },
  { factId: 'LAM-F-0090', text: 'Patent 2,292,387, Secret Communication System, was patented Aug. 11, 1942.' },
  { factId: 'LAM-F-0094', text: 'The Secret Communication System contemplates employing records of the type used for many years in player pianos, which consist of long rolls of paper having perforations.' },
  { factId: 'LAM-F-0095', text: 'In a conventional player piano record there may be 88 rows of perforations, and in the Secret Communication System such a record would permit the use of 88 different carrier frequencies.' },
]

// "Arriving": the chapter's one verified line about New York (LAM-F-0100), and its narration clip.
export const ARRIVING_LINE = {
  factId: 'LAM-F-0100',
  text: 'The Waterbury Democrat (Waterbury, Conn.), October 4, 1937, on Austrian Hedy Kiesler: Now Miss Kiesler is here in person (above as New York saw her).',
}
export const ARRIVING_CLIP = narr('lamarr', 1, ['c2'], ['LAM-F-0100'])
export const INVENTION_CLIP = narr('lamarr', 1, ['c3', 'c4', 'c5'], ['LAM-F-0086', 'LAM-F-0096', 'LAM-F-0084'])
// the wall panel's stop: the chapter's opening line (LAM-F-0086); c4 and c5 play with the two records
export const PANEL_CLIP = narr('lamarr', 1, ['c3'], ['LAM-F-0086'])
