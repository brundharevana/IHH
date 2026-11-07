// S2 spike: resolve a DTCG-like token document into a plain nested parameter object for one style.
// Accepts colour $value as a hex string or as the 2025.10 object {colorSpace, components, alpha, hex}.
// Accepts dimension $value as {value, unit} or a number. Resolves {alias.path} references. Enumerations are $type "string".
const hex2 = (n) => Math.round(Math.min(1, Math.max(0, n)) * 255).toString(16).padStart(2, '0');

function colourToHex(v) {
  if (typeof v === 'string') return v;
  if (v && v.hex) return v.hex;
  if (v && v.colorSpace === 'srgb' && Array.isArray(v.components)) return '#' + v.components.slice(0, 3).map(hex2).join('');
  throw new Error('unsupported colour value ' + JSON.stringify(v));
}

export function flatten(doc) {
  const flat = {};
  (function walk(node, path, type) {
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('$') || !v || typeof v !== 'object') continue;
      if ('$value' in v) flat[[...path, k].join('.')] = { type: v.$type || type, value: v.$value };
      else walk(v, [...path, k], v.$type || type);
    }
  })(doc, [], null);
  return flat;
}

export function resolveStyle(doc, styleId) {
  const flat = flatten(doc);
  const lookup = (p, depth = 0) => {
    if (depth > 8) throw new Error('alias loop at ' + p);
    const t = flat[p];
    if (!t) throw new Error('missing token ' + p);
    if (typeof t.value === 'string' && /^\{.+\}$/.test(t.value)) return lookup(t.value.slice(1, -1), depth + 1);
    return t;
  };
  const out = {}; let authored = 0, inherited = 0;
  const put = (key, prefix) => {
    const t = lookup(key); const parts = key.slice(prefix.length).split('.'); let v = t.value;
    if (t.type === 'color') v = colourToHex(v); else if (t.type === 'dimension' && v && typeof v === 'object') v = v.value;
    let o = out; for (let i = 0; i < parts.length - 1; i++) o = o[parts[i]] ||= {};
    o[parts[parts.length - 1]] = v;
  };
  const own = 'style.' + styleId + '.', base = 'style.base.';
  for (const key of Object.keys(flat)) if (key.startsWith(base) && styleId !== 'base') { put(key, base); inherited++; }
  for (const key of Object.keys(flat)) if (key.startsWith(own)) { put(key, own); authored++; }
  if (!authored) throw new Error('no tokens for style ' + styleId);
  out.id = styleId; out.authoredTokens = authored; out.tokenCount = Object.keys(flat).filter((k) => k.startsWith(own) || k.startsWith(base)).length;
  return out;
}
