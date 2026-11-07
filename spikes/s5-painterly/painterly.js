// S5 painterly filter (spike; illustrative reconstruction). Raw WebGL2, no libraries.
// Pipeline (every pass is a full-screen fragment shader, all lengths in pixels at the reference size times target.scale):
//   [pre-blur] -> prep (palette grade, optional background regrade/field under a mask) -> structure tensor (Sobel)
//   -> Gaussian-smoothed tensor -> flow field (minor eigenvector, anisotropy) -> anisotropic Kuwahara (8 sectors, polynomial weights) x passes
//   -> 3D value noise -> line-integral convolution of the noise along the flow (bristle streaks + stroke dabs)
//   -> composite: broken colour from the stroke field, impasto height (strokes + canvas weave) lit by one light -> RGBA8.
// mode 'equirect': every neighbour lookup goes through the sphere (tangent-plane offset, renormalise, back to uv), the texture wraps in u,
// and the noise is a function of the 3D view direction, so the left/right seam and the poles are filtered like any other pixel.
// Image convention everywhere: texture row 0 = top of the image (no UNPACK_FLIP_Y); readPixels therefore returns top-first rows.

const VERT = `#version 300 es
void main(){ vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2)); gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0); }`;

const COMMON = `#version 300 es
precision highp float; precision highp int; precision highp sampler2D;
uniform vec2 uSize; uniform int uMode; uniform float uYaw;
out vec4 outColor;
const float PI = 3.14159265358979; const float TAU = 6.28318530717959;
vec2 pixUV(){ return gl_FragCoord.xy / uSize; }
vec3 dirOf(vec2 uv){ float lon = (uv.x - 0.5) * TAU; float lat = (0.5 - uv.y) * PI; return vec3(sin(lon) * cos(lat), sin(lat), -cos(lon) * cos(lat)); }
vec2 uvOf(vec3 d){ float lon = atan(d.x, -d.z); float lat = asin(clamp(d.y, -1.0, 1.0)); return vec2(lon / TAU + 0.5, 0.5 - lat / PI); }
struct Frame { vec3 d; vec3 e; vec3 s; };
Frame frameOf(vec2 uv){
  Frame f; if (uMode == 0) { f.d = vec3(0.0); f.e = vec3(0.0); f.s = vec3(0.0); return f; }
  float lon = (uv.x - 0.5) * TAU; float lat = (0.5 - uv.y) * PI; float cl = cos(lat), sl = sin(lat), co = cos(lon), so = sin(lon);
  f.d = vec3(so * cl, sl, -co * cl); f.e = vec3(co, 0.0, so); f.s = vec3(so * sl, -cl, -co * sl); return f;
}
// neighbour of uv offset by 'off' pixels (x right/east, y down/south); on the sphere the offset is taken in the tangent plane
vec2 nbF(Frame f, vec2 uv, vec2 off){
  if (uMode == 0) return uv + off / uSize;
  return uvOf(normalize(f.d + (TAU / uSize.x) * (off.x * f.e + off.y * f.s)));
}
vec2 nb(vec2 uv, vec2 off){ return nbF(frameOf(uv), uv, off); }
// position for noise: image pixels (flat) or view direction scaled to equator pixels (equirect), optionally yawed (seam roll test)
vec3 pos3(vec2 uv){
  if (uMode == 0) return vec3(uv * uSize, 0.0);
  vec3 d = dirOf(uv); float c = cos(uYaw), s = sin(uYaw);
  d = vec3(c * d.x + s * d.z, d.y, -s * d.x + c * d.z);
  return d * (uSize.x / TAU);
}
uvec3 pcg3d(uvec3 v){ v = v * 1664525u + 1013904223u; v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y; v ^= v >> 16u; v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y; return v; }
float h01(ivec3 c, uint seed){ uvec3 h = pcg3d(uvec3(c + ivec3(65536)) ^ uvec3(seed, seed * 7919u, seed * 104729u)); return float(h.x & 0xffffffu) / 16777215.0; }
float vnoise(vec3 p, uint seed){
  vec3 i = floor(p); vec3 f = p - i; vec3 u = f * f * (3.0 - 2.0 * f); ivec3 c = ivec3(i);
  float a = h01(c, seed), b = h01(c + ivec3(1, 0, 0), seed), cc = h01(c + ivec3(0, 1, 0), seed), d = h01(c + ivec3(1, 1, 0), seed);
  float e = h01(c + ivec3(0, 0, 1), seed), g = h01(c + ivec3(1, 0, 1), seed), h = h01(c + ivec3(0, 1, 1), seed), k = h01(c + ivec3(1, 1, 1), seed);
  return mix(mix(mix(a, b, u.x), mix(cc, d, u.x), u.y), mix(mix(e, g, u.x), mix(h, k, u.x), u.y), u.z);
}
float luma(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
`;

const FRAGS = {
  blur: `uniform sampler2D uIn; uniform vec2 uDir; uniform float uSigma;
void main(){ vec2 uv = pixUV(); Frame F = frameOf(uv); int r = int(ceil(2.5 * uSigma)); vec4 acc = vec4(0.0); float ws = 0.0;
  for (int k = -r; k <= r; k++) { float w = exp(-float(k * k) / (2.0 * uSigma * uSigma)); acc += texture(uIn, nbF(F, uv, uDir * float(k))) * w; ws += w; }
  outColor = acc / ws; }`,

  prep: `uniform sampler2D uSrc; uniform sampler2D uMask; uniform int uMono; uniform int uHasMask;
uniform vec4 uRamp[8]; uniform int uRampN; uniform vec4 uBgRamp[8]; uniform int uBgRampN; uniform vec3 uField[5];
uniform vec2 uLevels; uniform float uFieldScale, uFieldDetail, uFieldMix, uMapMix, uSat, uContrast, uShadowAmt, uHiAmt, uFlatJitter, uFlatJitterScale;
uniform vec3 uShadowTint, uHiTint;
vec3 rampEval(float x){ vec3 c = uRamp[0].rgb; for (int i = 1; i < 8; i++) { if (i >= uRampN) break; float a = uRamp[i - 1].w, b = uRamp[i].w; if (x >= a) c = mix(uRamp[i - 1].rgb, uRamp[i].rgb, clamp((x - a) / max(b - a, 1e-5), 0.0, 1.0)); } return c; }
vec3 bgRampEval(float x){ vec3 c = uBgRamp[0].rgb; for (int i = 1; i < 8; i++) { if (i >= uBgRampN) break; float a = uBgRamp[i - 1].w, b = uBgRamp[i].w; if (x >= a) c = mix(uBgRamp[i - 1].rgb, uBgRamp[i].rgb, clamp((x - a) / max(b - a, 1e-5), 0.0, 1.0)); } return c; }
void main(){
  vec2 uv = pixUV(); vec3 c = clamp((texture(uSrc, uv).rgb - uLevels.x) / max(uLevels.y - uLevels.x, 1e-3), 0.0, 1.0);
  float L = clamp((luma(c) - 0.5) * uContrast + 0.5, 0.0, 1.0);
  vec3 mapped = rampEval(L); vec3 col;
  if (uMono == 1) col = mapped;
  else { vec3 cs = mix(vec3(luma(c)), c, uSat); cs = clamp((cs - 0.5) * uContrast + 0.5, 0.0, 1.0); col = mix(cs, mapped, uMapMix); }
  col = mix(col, uShadowTint, uShadowAmt * (1.0 - L) * (1.0 - L));
  col = mix(col, uHiTint, uHiAmt * L * L);
  vec3 p = pos3(uv);
  if (uFlatJitter > 0.0) { float j = vnoise(p / uFlatJitterScale, 11u) * 0.65 + vnoise(p / (uFlatJitterScale * 0.37), 12u) * 0.35 - 0.5; col *= 1.0 + 2.0 * uFlatJitter * j; }
  if (uHasMask == 1) {
    float m = texture(uMask, uv).r;
    if (m > 0.0) {
      vec3 regrade = bgRampEval(L);
      float f1 = vnoise(p / uFieldScale, 21u), f2 = vnoise(p / uFieldDetail, 22u), f3 = vnoise(p / (uFieldScale * 0.5), 23u);
      float t = clamp(f1 * 0.7 + f2 * 0.3, 0.0, 0.9999) * 4.0; int i0 = int(floor(t)); float fr = fract(t);
      vec3 field = mix(uField[i0], uField[min(i0 + 1, 3)], smoothstep(0.2, 0.8, fr));
      field = mix(field, uField[4], smoothstep(0.62, 0.9, f3) * 0.55);
      field *= 0.8 + 0.4 * L;
      col = mix(col, mix(regrade, field, uFieldMix), m);
    }
  }
  outColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`,

  tensor: `uniform sampler2D uIn;
void main(){ vec2 uv = pixUV(); Frame F = frameOf(uv);
  vec3 a = texture(uIn, nbF(F, uv, vec2(-1.0, -1.0))).rgb, b = texture(uIn, nbF(F, uv, vec2(0.0, -1.0))).rgb, c = texture(uIn, nbF(F, uv, vec2(1.0, -1.0))).rgb;
  vec3 d = texture(uIn, nbF(F, uv, vec2(-1.0, 0.0))).rgb, f = texture(uIn, nbF(F, uv, vec2(1.0, 0.0))).rgb;
  vec3 g = texture(uIn, nbF(F, uv, vec2(-1.0, 1.0))).rgb, h = texture(uIn, nbF(F, uv, vec2(0.0, 1.0))).rgb, i = texture(uIn, nbF(F, uv, vec2(1.0, 1.0))).rgb;
  vec3 gx = (c + 2.0 * f + i - a - 2.0 * d - g) / 4.0; vec3 gy = (g + 2.0 * h + i - a - 2.0 * b - c) / 4.0;
  outColor = vec4(dot(gx, gx), dot(gx, gy), dot(gy, gy), 1.0); }`,

  orient: `uniform sampler2D uIn; uniform float uPriorK, uPriorAngle, uPriorJitter, uPriorScale;
void main(){ vec2 uv = pixUV(); vec3 g = texture(uIn, uv).xyz;
  // stroke-direction prior: in flat areas the tensor is ~0, so a weak prior tensor (gradient across a slowly varying stroke angle) decides the flow
  float th = uPriorAngle + uPriorJitter * (vnoise(pos3(uv) / uPriorScale, 31u) - 0.5) * 2.0; vec2 g0 = vec2(-sin(th), cos(th));
  float E = g.x + uPriorK * g0.x * g0.x, F = g.y + uPriorK * g0.x * g0.y, G = g.z + uPriorK * g0.y * g0.y;
  float disc = sqrt(max((E - G) * (E - G) + 4.0 * F * F, 0.0)); float l1 = 0.5 * (E + G + disc), l2 = 0.5 * (E + G - disc);
  vec2 v = vec2(l1 - E, -F); vec2 t = length(v) > 1e-12 ? normalize(v) : vec2(cos(th), sin(th));
  float A = (l1 + l2) > 1e-12 ? (l1 - l2) / (l1 + l2) : 0.0;
  outColor = vec4(t, atan(t.y, t.x), A); }`,

  kuwahara: `uniform sampler2D uIn; uniform sampler2D uTfm; uniform float uRadius, uQ, uAlpha, uZeta, uEta, uGauss, uHard;
void main(){
  vec2 uv = pixUV(); Frame Fr = frameOf(uv); vec4 t = texture(uTfm, uv); float A = t.w, phi = t.z;
  float a = uRadius * clamp((uAlpha + A) / uAlpha, 0.1, 2.0), b = uRadius * clamp(uAlpha / (uAlpha + A), 0.1, 2.0);
  float cp = cos(phi), sp = sin(phi);
  mat2 SR = mat2(1.0 / a, 0.0, 0.0, 1.0 / b) * mat2(cp, -sp, sp, cp);
  int mx = int(ceil(sqrt(a * a * cp * cp + b * b * sp * sp))), my = int(ceil(sqrt(a * a * sp * sp + b * b * cp * cp)));
  vec4 m[8]; vec3 s[8]; for (int k = 0; k < 8; k++) { m[k] = vec4(0.0); s[k] = vec3(0.0); }
  for (int j = -my; j <= my; j++) for (int i = -mx; i <= mx; i++) {
    vec2 v = SR * vec2(float(i), float(j)); float r2 = dot(v, v); if (r2 > 1.0) continue;
    vec3 c = texture(uIn, nbF(Fr, uv, vec2(float(i), float(j)))).rgb;
    float w[8]; float sum = 0.0, z, vxx, vyy;
    vxx = uZeta - uEta * v.x * v.x; vyy = uZeta - uEta * v.y * v.y;
    z = max(0.0, v.y + vxx); w[0] = z * z; z = max(0.0, -v.x + vyy); w[2] = z * z; z = max(0.0, -v.y + vxx); w[4] = z * z; z = max(0.0, v.x + vyy); w[6] = z * z;
    vec2 u = 0.70710678 * vec2(v.x - v.y, v.x + v.y);
    vxx = uZeta - uEta * u.x * u.x; vyy = uZeta - uEta * u.y * u.y;
    z = max(0.0, u.y + vxx); w[1] = z * z; z = max(0.0, -u.x + vyy); w[3] = z * z; z = max(0.0, -u.y + vxx); w[5] = z * z; z = max(0.0, u.x + vyy); w[7] = z * z;
    for (int k = 0; k < 8; k++) sum += w[k];
    if (sum < 1e-8) continue;
    float g = exp(-uGauss * r2) / sum;
    for (int k = 0; k < 8; k++) { float wk = w[k] * g; m[k] += vec4(c * wk, wk); s[k] += c * c * wk; }
  }
  vec4 o = vec4(0.0);
  for (int k = 0; k < 8; k++) { if (m[k].w <= 0.0) continue; vec3 mu = m[k].rgb / m[k].w; vec3 var = abs(s[k] / m[k].w - mu * mu); float sig2 = var.r + var.g + var.b;
    float w = 1.0 / (1.0 + pow(uHard * sig2, 0.5 * uQ)); o += vec4(mu * w, w); }
  outColor = vec4(o.w > 0.0 ? o.rgb / o.w : texture(uIn, uv).rgb, 1.0);
}`,

  noise: `uniform float uBristle, uStroke;
// cellular (Worley) value: every pixel takes the random values of its nearest jittered feature point -> irregular patches that the LIC stretches into dabs
vec2 cellVal(vec3 p, uint seed){ vec3 i = floor(p); float best = 1e9; ivec3 bc = ivec3(i); int zr = uMode == 0 ? 0 : 1;
  for (int z = -1; z <= 1; z++) { if (z < -zr || z > zr) continue; for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    ivec3 c = ivec3(i) + ivec3(x, y, z); vec3 fp = vec3(c) + vec3(h01(c, seed), h01(c, seed + 1u), uMode == 0 ? 0.0 : h01(c, seed + 2u));
    vec3 dd = fp - p; float d = dot(dd, dd); if (d < best) { best = d; bc = c; } } }
  return vec2(h01(bc, seed + 3u), h01(bc, seed + 4u)); }
void main(){ vec3 p = pos3(pixUV());
  float fine = vnoise(p / uBristle, 1u);
  vec2 cv = cellVal(p / uStroke, 2u);
  outColor = vec4(fine, cv.x, cv.y, 1.0); }`,

  lic: `uniform sampler2D uNoise; uniform sampler2D uTfm; uniform int uLen; uniform float uGain;
void main(){ vec2 uv = pixUV(); Frame F = frameOf(uv);
  vec3 acc = texture(uNoise, uv).rgb; float ws = 1.0; vec2 t0 = texture(uTfm, uv).xy;
  for (int sg = 0; sg < 2; sg++) {
    vec2 tp = sg == 0 ? t0 : -t0; vec2 off = vec2(0.0);
    for (int k = 1; k <= 64; k++) { if (k > uLen) break;
      vec2 t = texture(uTfm, nbF(F, uv, off)).xy; if (dot(t, tp) < 0.0) t = -t; off += t; tp = t;
      float w = 1.0 - float(k) / float(uLen + 1); acc += texture(uNoise, nbF(F, uv, off)).rgb * w; ws += w; }
  }
  outColor = vec4(clamp(0.5 + (acc / ws - 0.5) * uGain, 0.0, 1.0), 1.0); }`,

  composite: `uniform sampler2D uKuw; uniform sampler2D uLic;
uniform float uJitV, uJitT, uImpF, uImpC, uBump, uImpLight, uSpec, uSpecPow, uCanvas, uCanvasPeriod; uniform vec3 uLight, uTempAxis;
float weave(vec3 p){ float f = TAU / uCanvasPeriod; if (uMode == 0) return sin(f * p.x) * sin(f * p.y);
  vec3 n = normalize(p); vec3 w = n * n; return w.z * sin(f * p.x) * sin(f * p.y) + w.x * sin(f * p.y) * sin(f * p.z) + w.y * sin(f * p.z) * sin(f * p.x); }
float height(vec2 q){ vec3 n = texture(uLic, q).rgb; return uImpF * (n.r - 0.5) + uImpC * (n.g - 0.5) + uCanvas * 0.5 * weave(pos3(q)); }
void main(){ vec2 uv = pixUV(); Frame F = frameOf(uv);
  vec3 c = texture(uKuw, uv).rgb; vec3 n0 = texture(uLic, uv).rgb;
  c *= 1.0 + uJitV * (n0.g - 0.5) * 2.0;
  c += uJitT * (n0.b - 0.5) * 2.0 * uTempAxis;
  float hx = height(nbF(F, uv, vec2(1.0, 0.0))) - height(nbF(F, uv, vec2(-1.0, 0.0)));
  float hy = height(nbF(F, uv, vec2(0.0, 1.0))) - height(nbF(F, uv, vec2(0.0, -1.0)));
  vec3 N = normalize(vec3(-hx * uBump, -hy * uBump, 1.0)); vec3 Ld = normalize(uLight);
  c *= mix(1.0, max(dot(N, Ld), 0.0) / Ld.z, uImpLight);
  c += uSpec * pow(max(reflect(-Ld, N).z, 0.0), uSpecPow);
  outColor = vec4(clamp(c, 0.0, 1.0), 1.0); }`,

  view: `uniform sampler2D uEq; uniform mat3 uRot; uniform vec2 uTanHalf;
void main(){ vec2 uv = pixUV(); vec2 n = vec2(uv.x - 0.5, 0.5 - uv.y) * 2.0 * uTanHalf; vec3 d = uRot * normalize(vec3(n.x, n.y, -1.0));
  outColor = vec4(texture(uEq, uvOf(d)).rgb, 1.0); }`,
};

const hex3 = (h) => { const n = parseInt(h.slice(1), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
const rampArr = (stops) => { const a = new Float32Array(32); stops.forEach(([pos, hex], i) => { a.set([...hex3(hex), pos], i * 4); }); return a; };

export class Painter {
  constructor() {
    this.canvas = document.createElement('canvas'); this.canvas.width = this.canvas.height = 4;
    const gl = this.canvas.getContext('webgl2', { antialias: false, depth: false, stencil: false, premultipliedAlpha: false, powerPreference: 'high-performance' });
    if (!gl) throw new Error('WebGL2 unavailable');
    if (!gl.getExtension('EXT_color_buffer_float')) throw new Error('EXT_color_buffer_float unavailable');
    this.gl = gl; this.vao = gl.createVertexArray(); this.progs = {}; this.pool = {};
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    this.info = { renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : 'n/a', version: gl.getParameter(gl.VERSION), maxTexture: gl.getParameter(gl.MAX_TEXTURE_SIZE) };
    const t = performance.now(); for (const k of Object.keys(FRAGS)) this.progs[k] = this.compile(k); this.compileMs = +(performance.now() - t).toFixed(1);
  }
  compile(name) {
    const gl = this.gl; const mk = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(name + ': ' + gl.getShaderInfoLog(s)); return s; };
    const p = gl.createProgram(); gl.attachShader(p, mk(gl.VERTEX_SHADER, VERT)); gl.attachShader(p, mk(gl.FRAGMENT_SHADER, COMMON + FRAGS[name])); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(name + ' link: ' + gl.getProgramInfoLog(p));
    return { p, loc: {} };
  }
  texture(w, h, { kind = 'f16', mode = 'flat', filter = 'linear', data = null } = {}) {
    const gl = this.gl; const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    if (kind === 'f16') gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
    else if (kind === 'rgba8') gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    else if (kind === 'r8') gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, w, h, 0, gl.RED, gl.UNSIGNED_BYTE, data);
    const f = filter === 'nearest' ? gl.NEAREST : gl.LINEAR;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, f); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, f);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, mode === 'equirect' ? gl.REPEAT : gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    if (kind !== 'r8') { const st = gl.checkFramebufferStatus(gl.FRAMEBUFFER); if (st !== gl.FRAMEBUFFER_COMPLETE) throw new Error('framebuffer incomplete ' + st); }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { t, fb, w, h, kind, filter, mode };
  }
  free(...texs) { const gl = this.gl; for (const x of texs) if (x) { gl.deleteTexture(x.t); gl.deleteFramebuffer(x.fb); } }
  setFilter(tex, filter) { const gl = this.gl; gl.bindTexture(gl.TEXTURE_2D, tex.t); const f = filter === 'nearest' ? gl.NEAREST : gl.LINEAR; gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, f); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, f); tex.filter = filter; }
  // run one pass. inputs: {uName: tex}; uniforms: {uName: number | [n..] | {i: int} | {v4: Float32Array} | {v3: Float32Array} | {m3: Float32Array}}
  run(name, out, inputs, uniforms, { tileRows = 0 } = {}) {
    const gl = this.gl; this.lastOut = out; const P = this.progs[name]; gl.useProgram(P.p); gl.bindVertexArray(this.vao);
    const L = (k) => (k in P.loc ? P.loc[k] : (P.loc[k] = gl.getUniformLocation(P.p, k)));
    let unit = 0; for (const [k, tx] of Object.entries(inputs)) { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tx.t); gl.uniform1i(L(k), unit); unit++; }
    const all = { uSize: [out.w, out.h], ...uniforms };
    for (const [k, v] of Object.entries(all)) {
      const l = L(k); if (l === null) continue;
      if (typeof v === 'number') gl.uniform1f(l, v);
      else if (Array.isArray(v)) [gl.uniform1f, gl.uniform2f, gl.uniform3f, gl.uniform4f][v.length - 1].call(gl, l, ...v);
      else if (v.i !== undefined) gl.uniform1i(l, v.i);
      else if (v.v4) gl.uniform4fv(l, v.v4);
      else if (v.v3) gl.uniform3fv(l, v.v3);
      else if (v.m3) gl.uniformMatrix3fv(l, false, v.m3);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, out.fb); gl.viewport(0, 0, out.w, out.h);
    if (tileRows > 0 && out.h > tileRows) {
      gl.enable(gl.SCISSOR_TEST);
      for (let y = 0; y < out.h; y += tileRows) { gl.scissor(0, y, out.w, Math.min(tileRows, out.h - y)); gl.drawArrays(gl.TRIANGLES, 0, 3); if (this.sync) { this.sync(out); gl.bindFramebuffer(gl.FRAMEBUFFER, out.fb); } }
      gl.disable(gl.SCISSOR_TEST);
    } else gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  read(tex) { const gl = this.gl; const buf = new Uint8Array(tex.w * tex.h * 4); gl.bindFramebuffer(gl.FRAMEBUFFER, tex.fb); gl.readPixels(0, 0, tex.w, tex.h, gl.RGBA, gl.UNSIGNED_BYTE, buf); gl.bindFramebuffer(gl.FRAMEBUFFER, null); return buf; }

  // rgba: Uint8Array top-first; mask: Uint8Array (0..255, 255 = background) or null.
  // job: { mode, preset, tokens, mono, maskMode, preBlur, flatJitter, flatJitterScale, scale, yaw, tileRows }
  paint(rgba, w, h, mask, job) {
    const gl = this.gl, T = {}, tk = job.tokens, P = job.preset, sc = job.scale || 1, mode = job.mode || 'flat';
    const M = { uMode: { i: mode === 'equirect' ? 1 : 0 }, uYaw: job.yaw || 0 };
    const tiled = { tileRows: mode === 'equirect' ? (job.tileRows || 128) : 0 };
    // gl.finish() does not block in Chrome/ANGLE; a 1x1 readPixels from the texture just written forces the GPU work to complete
    const px = new Uint8Array(4), pxf = new Float32Array(4);
    this.sync = (tex) => { gl.bindFramebuffer(gl.FRAMEBUFFER, tex.fb); if (tex.kind === 'f16') gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, pxf); else gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); gl.bindFramebuffer(gl.FRAMEBUFFER, null); };
    let t = performance.now(), t0 = t, last = null; const lap = (k) => { last = this.lastOut; if (last) this.sync(last); const n = performance.now(); T[k] = +(n - t).toFixed(1); t = n; };
    const src = this.texture(w, h, { kind: 'rgba8', mode, data: rgba });
    const mk = this.texture(mask ? w : 1, mask ? h : 1, { kind: 'r8', mode, data: mask || new Uint8Array(1) });
    const A = this.texture(w, h, { mode }), X = this.texture(w, h, { mode }), Y = this.texture(w, h, { mode }), Z = this.texture(w, h, { mode });
    const O = this.texture(w, h, { mode, filter: 'nearest' }); const OUT = this.texture(w, h, { kind: 'rgba8', mode });
    lap('uploadMs');
    let srcTex = src;
    if (job.preBlur > 0) { this.run('blur', X, { uIn: src }, { ...M, uDir: [1, 0], uSigma: job.preBlur * sc }); this.run('blur', Y, { uIn: X }, { ...M, uDir: [0, 1], uSigma: job.preBlur * sc }); srcTex = Y; lap('preBlurMs'); }
    const pal = tk.palette, bg = tk.background;
    const field = new Float32Array(15); bg.field.forEach((h, i) => field.set(hex3(h), i * 3));
    this.run('prep', A, { uSrc: srcTex, uMask: mk }, { ...M, uMono: { i: job.mono ? 1 : 0 }, uHasMask: { i: mask ? 1 : 0 },
      uRamp: { v4: rampArr(pal.monoRamp) }, uRampN: { i: pal.monoRamp.length }, uBgRamp: { v4: rampArr(bg.bgRamp) }, uBgRampN: { i: bg.bgRamp.length }, uField: { v3: field },
      uFieldScale: bg.fieldScale * sc, uFieldDetail: bg.fieldDetailScale * sc, uFieldMix: bg.fieldMix, uMapMix: pal.colourMapMix, uSat: pal.colourSaturation, uContrast: pal.contrast,
      uShadowTint: hex3(pal.shadowTint), uShadowAmt: pal.shadowAmount, uHiTint: hex3(pal.highlightTint), uHiAmt: pal.highlightAmount,
      uLevels: job.levels || [0, 1], uFlatJitter: job.flatJitter || 0, uFlatJitterScale: (job.flatJitterScale || 24) * sc });
    lap('prepMs');
    this.run('tensor', X, { uIn: A }, M); this.run('blur', Y, { uIn: X }, { ...M, uDir: [1, 0], uSigma: P.tensorSigma * sc }); this.run('blur', X, { uIn: Y }, { ...M, uDir: [0, 1], uSigma: P.tensorSigma * sc });
    const FL = tk.flow; this.run('orient', O, { uIn: X }, { ...M, uPriorK: FL.priorStrength, uPriorAngle: (FL.priorAngleDeg * Math.PI) / 180, uPriorJitter: (FL.priorJitterDeg * Math.PI) / 180, uPriorScale: FL.priorScale * sc }); lap('flowMs');
    const kw = tk.kuwahara, r = P.radius * sc, zeta = kw.zetaPerRadius / r, env = (kw.envelopeAngleFactor * Math.PI) / 8, eta = (zeta + Math.cos(env)) / (Math.sin(env) ** 2);
    const KU = { ...M, uRadius: r, uQ: kw.q, uAlpha: kw.alpha, uZeta: zeta, uEta: eta, uGauss: kw.gaussFalloff, uHard: kw.hardness };
    let kin = A; const outs = [Y, X];
    for (let i = 0; i < P.passes; i++) { const ko = outs[i % 2]; this.run('kuwahara', ko, { uIn: kin, uTfm: O }, KU, tiled); kin = ko; }
    const K = kin; lap('kuwaharaMs');
    const freeTex = [A, X, Y].find((x) => x !== K);
    this.run('noise', Z, {}, { ...M, uBristle: P.bristleCell * sc, uStroke: P.strokeCell * sc });
    this.run('lic', freeTex, { uNoise: Z, uTfm: O }, { ...M, uLen: { i: Math.round(P.strokeLength * sc) }, uGain: P.licGain }, tiled); lap('strokeMs');
    this.run('composite', OUT, { uKuw: K, uLic: freeTex }, { ...M, uJitV: P.jitterValue, uJitT: P.jitterTemp, uImpF: P.impastoFine, uImpC: P.impastoCoarse, uBump: P.bump,
      uImpLight: P.impastoLight, uSpec: P.spec, uSpecPow: tk.light.specPower, uCanvas: P.canvas, uCanvasPeriod: P.canvasPeriod * sc, uLight: tk.light.dir, uTempAxis: pal.temperatureAxis }, tiled);
    lap('compositeMs');
    const out = this.read(OUT); lap('readbackMs');
    T.totalMs = +(performance.now() - t0).toFixed(1);
    this.free(src, mk, A, X, Y, Z, O, OUT);
    return { rgba: out, timings: T };
  }

  // perspective view of an equirect (rgba8 top-first) for checks: yaw/pitch degrees, hfov degrees
  view(eqRGBA, W, H, { yawDeg = 0, pitchDeg = 0, hfovDeg = 90, w = 1024, h = 1024 } = {}) {
    const eq = this.texture(W, H, { kind: 'rgba8', mode: 'equirect', data: eqRGBA }); const out = this.texture(w, h, { kind: 'rgba8' });
    const a = (-yawDeg * Math.PI) / 180, p = (pitchDeg * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a), cp = Math.cos(p), sp = Math.sin(p);
    // R = Ry(a) * Rx(p), column-major
    const R = [ca, 0, -sa, sa * sp, cp, ca * sp, sa * cp, -sp, ca * cp];
    const th = Math.tan((hfovDeg * Math.PI) / 360);
    this.run('view', out, { uEq: eq }, { uMode: { i: 0 }, uRot: { m3: new Float32Array(R) }, uTanHalf: [th, (th * h) / w] });
    const buf = this.read(out); this.free(eq, out); return buf;
  }
}

// merge preset defaults with a source's overrides (shallow per group)
export function resolveJob(tokens, sourceId, presetId, target) {
  const s = tokens.sources[sourceId] || {}; const tg = tokens.targets[target] || {};
  return { tokens, preset: tokens.presets[presetId], mono: !!s.mono, preBlur: s.preBlur || 0, flatJitter: s.flatJitter || 0, flatJitterScale: s.flatJitterScale || 24,
    scale: tg.scale || 1, mode: target === 'equirect' ? 'equirect' : 'flat', tileRows: tg.tileRows || 0, maskOpt: { ...tokens.mask, ...(s.mask || {}), featherPx: tokens.background.featherPx }, background: s.background || 'none' };
}
