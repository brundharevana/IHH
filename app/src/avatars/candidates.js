// The three guide candidates shown on avatars.html. Files and licences: app/CREDITS.md
// ("Guide candidates"). Sizes are the shipped GLB sizes in bytes.
const ROCKETBOX = 'https://github.com/microsoft/Microsoft-Rocketbox'
const LICENCE = 'MIT (Copyright (c) 2020 Microsoft). Redistribution and modification allowed; keep the notice.'

export const MOTION = {
  female: { url: '/models/guide-candidates/motion-female.glb', bytes: 2361192 },
  male: { url: '/models/guide-candidates/motion-male.glb', bytes: 2678332 },
}

export const CANDIDATES = [
  {
    id: 'a',
    label: 'Candidate A',
    name: 'Business Female 02',
    look: 'Older docent: red tweed blazer, glasses, trousers',
    url: '/models/guide-candidates/docent-a-business-female-02.glb',
    bytes: 1675324,
    motion: 'female',
    source: `Microsoft Rocketbox, Assets/Avatars/Professions/Business_Female_02 (facial variant)`,
    sourceUrl: `${ROCKETBOX}/tree/master/Assets/Avatars/Professions/Business_Female_02`,
  },
  {
    id: 'b',
    label: 'Candidate B',
    name: 'Business Female 01',
    look: 'Dark trouser suit, white shirt, short hair',
    url: '/models/guide-candidates/docent-b-business-female-01.glb',
    bytes: 1019760,
    motion: 'female',
    source: `Microsoft Rocketbox, Assets/Avatars/Professions/Business_Female_01 (facial variant)`,
    sourceUrl: `${ROCKETBOX}/tree/master/Assets/Avatars/Professions/Business_Female_01`,
  },
  {
    id: 'c',
    label: 'Candidate C',
    name: 'Business Male 03',
    look: 'Charcoal suit, white shirt, teal tie',
    url: '/models/guide-candidates/docent-c-business-male-03.glb',
    bytes: 1031356,
    motion: 'male',
    // this head's neutral reads tense (low inner brows, wide eyes): relax it a little
    restFace: { AK_03_BrowInnerUp: 0.35, AK_19_EyeSquintLeft: 0.6, AK_20_EyeSquintRight: 0.6, smile: 0.3 },
    source: `Microsoft Rocketbox, Assets/Avatars/Professions/Business_Male_03 (facial variant)`,
    sourceUrl: `${ROCKETBOX}/tree/master/Assets/Avatars/Professions/Business_Male_03`,
  },
].map((c) => ({ ...c, licence: LICENCE }))

export const VISEME_NOTE = '15 Oculus visemes (sil, PP, FF, TH, DD, kk, CH, SS, nn, RR, aa, E, I, O, U) plus ARKit blink, brow, squint, smile and jaw-open blendshapes'
export const MOTION_NOTE = 'Rocketbox motion-capture library (MIT): idle_neutral, gestic_talk_neutral / relaxed, gestic_presentation, gestic_listen_accept'

export const mb = (b) => `${(b / 1048576).toFixed(1)} MB`
