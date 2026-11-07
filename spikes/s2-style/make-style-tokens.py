#!/usr/bin/env python3
"""Spike helper: derive style-tokens.json (DTCG 2025.10 colour objects, explicit $type on every token) from styles-all.json for the chosen styles."""
import json, sys
SRC, DST = 'styles-all.json', 'style-tokens.json'
KEEP = sys.argv[1:] or ['toon', 'duotone']
d = json.load(open(SRC))
def srgb(h):
    comps = [round(int(h[i:i+2], 16) / 255, 5) for i in (1, 3, 5)]
    return {'colorSpace': 'srgb', 'components': comps, 'alpha': 1, 'hex': h.lower()}
DIM = {('post', 'cell')}            # px
DOC = {
  'outline.widthDeg': 'Outline width as an angle in degrees (not a DTCG unit). Angular so the line weight is the same anywhere on the sphere.',
  'outline.crease': 'Crease angle in degrees above which a mesh edge gets a ribbon.',
  'lighting.dome': 'Total sky-dome intensity, averaged over lighting.domeSamples shadowed directional samples.',
  'lighting.domeSamples': 'Number of cosine-weighted dome samples accumulated per bake.',
  'post.levels': 'Tone levels between ink and paper (4 = ink, two mixes, paper).',
  'post.cell': 'Dither cell edge in output pixels.',
  'post.ink': 'Shadow tone. Derived from the darkest 2 percent of the archival photograph.',
  'post.paper': 'Highlight tone. Derived from the lightest 2 percent of the archival photograph.',
}
def typed(path, t, group_type):
    v = t['$value']; ty = t.get('$type') or group_type
    out = {}
    if ty == 'color' or (isinstance(v, str) and v.startswith('#')): out['$type'] = 'color'; out['$value'] = srgb(v)
    elif path in ('post.cell',): out['$type'] = 'dimension'; out['$value'] = {'value': v, 'unit': 'px'}
    elif isinstance(v, (int, float)): out['$type'] = 'number'; out['$value'] = v
    else: out['$type'] = 'string'; out['$value'] = v
    if path in DOC: out['$description'] = DOC[path]
    return out
def convert(group, prefix='', gt=None):
    res = {}
    gt = group.get('$type', gt)
    for k, v in group.items():
        if k.startswith('$'):
            if k == '$description': res[k] = v
            continue
        if '$value' in v: res[k] = typed(prefix + k, v, gt)
        else: res[k] = convert(v, prefix + k + '.', gt)
    return res
out = {'$description': 'IHH spike S2 style tokens (DTCG-like, Format Module 2025.10 colour objects). base = inert defaults; each style authors only what differs. Enumerations use $type string, which is not a DTCG type. Spike, not a standard.', 'style': {}}
for sid in ['base'] + KEEP: out['style'][sid] = convert(d['style'][sid])
json.dump(out, open(DST, 'w'), indent=1)
print('wrote', DST, len(open(DST).read()), 'bytes; styles', ['base'] + KEEP)
