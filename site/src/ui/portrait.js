// Living painted portrait: one WebGL2 quad that shifts the painting by its depth map (parallax),
// breathes (zoom +-0.6 %) and passes a warm light band over the subject. No mouth or face is
// animated. The <img class="still"> underneath is always in the page (alt text, no-JS, reduced
// motion, paused); the canvas covers it only while motion runs. Quote buttons play the AI voice
// with captions drawn from the WebVTT track. Approach and measurements: B4-A4 prototype P1.

export const MAX_SHIFT_PX = 6;
const FPS = 24;          // measured on M1 Chrome: renderer 6.1 %, GPU process 9.1 % of one core
const BREATH_S = 4.2;     // about 14 breaths a minute
const SWEEP_S = 14;       // one light pass every 14 s

// UV offset for the shader's relief lookup. Shader shift = off * (depth - 0.5) and
// |depth - 0.5| <= 0.5, so a shift of D CSS px needs off = 2 D / size.
export function driftOffset(t, ptr, cssW, cssH) {
  let dx = 4 * Math.sin(t * 0.21) + ptr[0] * 4;
  let dy = 2.5 * Math.sin(t * 0.17 + 1) + ptr[1] * 3;
  const len = Math.hypot(dx, dy);
  if (len > MAX_SHIFT_PX) { dx *= MAX_SHIFT_PX / len; dy *= MAX_SHIFT_PX / len; }
  return [2 * dx / Math.max(1, cssW), 2 * dy / Math.max(1, cssH)];
}

// Always >= 1 so the zoomed painting never exposes its own edge.
export function breathZoom(t) {
  return 1.006 + 0.006 * Math.sin(t * 2 * Math.PI / BREATH_S);
}

export function sweepPos(t) {
  return -0.3 + ((t % SWEEP_S) / SWEEP_S) * 2.2;
}

// gl: WebGL2 renderer ready. lost: the WebGL context was lost and not yet restored.
// motionOn: the viewer has not paused. reduced: prefers-reduced-motion.
export function motionState({ gl, lost = false, motionOn, reduced, inView, pageVisible }) {
  const allowed = Boolean(gl) && !lost && !reduced;
  const showCanvas = allowed && motionOn;
  return { showCanvas, run: showCanvas && inView && pageVisible, showButton: allowed };
}

const VS = `#version 300 es
in vec2 a; out vec2 vUv;
void main(){ vUv = vec2(a.x * 0.5 + 0.5, 0.5 - a.y * 0.5); gl_Position = vec4(a, 0.0, 1.0); }`;

const FS = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D uImg, uDepth;
uniform vec2 uOff;
uniform float uZoom, uSweep;
void main(){
  // Breathing: zoom anchored at the bottom centre, so the shoulders and head rise together.
  vec2 base = vec2(0.5, 1.0) + (vUv - vec2(0.5, 1.0)) / uZoom;
  // Fade the shift out near the frame so clamped edge pixels never streak.
  vec2 e = min(base, 1.0 - base);
  vec2 off = uOff * smoothstep(0.0, 0.05, min(e.x, e.y));
  // Relief lookup: near pixels (bright depth) move one way, far pixels the other.
  vec2 p = base;
  for (int i = 0; i < 3; i++) { p = base - off * (texture(uDepth, p).r - 0.5); }
  p = clamp(p, vec2(0.001), vec2(0.999));
  float d = texture(uDepth, p).r;
  vec3 c = texture(uImg, p).rgb;
  // Light sweep: a warm diagonal band, only on the near subject.
  float band = exp(-pow((vUv.x + vUv.y * 0.5 - uSweep) / 0.10, 2.0));
  c += band * 0.06 * vec3(1.0, 0.93, 0.80) * smoothstep(0.3, 0.8, d);
  o = vec4(c, 1.0);
}`;

function loadImage(src) {
  return new Promise((res, rej) => {
    const i = new Image();
    i.decoding = 'async';
    i.onload = () => res(i);
    i.onerror = () => rej(new Error(`could not load ${src}`));
    i.src = src;
  });
}

function makeRenderer(canvas, sizer, img, depth) {
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) return null;
  const sh = (type, src) => {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  [['uImg', img], ['uDepth', depth]].forEach(([name, image], i) => {
    gl.activeTexture(gl.TEXTURE0 + i);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR],
      [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
    gl.uniform1i(gl.getUniformLocation(prog, name), i);
  });
  const u = { off: gl.getUniformLocation(prog, 'uOff'), zoom: gl.getUniformLocation(prog, 'uZoom'), sweep: gl.getUniformLocation(prog, 'uSweep') };
  return {
    draw(t, ptr) {
      // Size from the still image under the canvas: a hidden canvas has no layout size, and the
      // first frame is drawn before the canvas is shown.
      const cssW = sizer.clientWidth, cssH = sizer.clientHeight;
      // Never render more pixels than the painting has: beyond that the GPU only interpolates.
      const scale = Math.min(window.devicePixelRatio || 1, 2, img.naturalWidth / Math.max(1, cssW));
      const w = Math.max(1, Math.round(cssW * scale)), h = Math.max(1, Math.round(cssH * scale));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
      const [ox, oy] = driftOffset(t, ptr, cssW, cssH);
      gl.uniform2f(u.off, ox, oy);
      gl.uniform1f(u.zoom, breathZoom(t));
      gl.uniform1f(u.sweep, sweepPos(t));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
  };
}

function wireQuotes(fig) {
  const caption = fig.querySelector('[data-caption]');
  const audios = [...fig.querySelectorAll('audio[data-audio]')];
  const show = text => { caption.textContent = text; caption.hidden = !text; };
  for (const btn of fig.querySelectorAll('button[data-quote]')) {
    const audio = fig.querySelector(`audio[data-audio="${btn.dataset.quote}"]`);
    const missing = fig.querySelector(`[data-audio-missing="${btn.dataset.quote}"]`);
    const idle = btn.textContent;
    const track = audio.textTracks[0];
    if (track) {
      track.mode = 'hidden'; // cues are drawn over the portrait, not by the browser
      track.addEventListener('cuechange', () => {
        if (audio.paused) return;
        const cue = track.activeCues && track.activeCues[0];
        show(cue ? cue.text : '');
      });
    }
    btn.addEventListener('click', () => {
      if (!audio.paused) { audio.pause(); return; }
      for (const other of audios) if (other !== audio) other.pause();
      // AbortError only means a quick second press paused it before playback began.
      audio.play().catch(e => { if (e.name !== 'AbortError') missing.hidden = false; });
    });
    audio.addEventListener('play', () => { btn.textContent = 'Pause the quote'; fig.dataset.speaking = btn.dataset.quote; });
    audio.addEventListener('pause', () => { btn.textContent = idle; show(''); delete fig.dataset.speaking; });
    audio.addEventListener('ended', () => { audio.currentTime = 0; });
    audio.addEventListener('error', () => { missing.hidden = false; btn.disabled = true; });
  }
}

export function mountPortrait(fig) {
  if (fig.dataset.mounted) return;
  fig.dataset.mounted = 'true';
  wireQuotes(fig);

  const canvas = fig.querySelector('canvas');
  const still = fig.querySelector('img.still');
  const btn = fig.querySelector('button[data-motion]');
  const rm = window.matchMedia('(prefers-reduced-motion: reduce)');
  const st = { gl: null, lost: false, motionOn: true, reduced: rm.matches, inView: false, pageVisible: !document.hidden };
  let raf = 0, last = 0, t0 = performance.now(), loading = false;
  const ptr = [0, 0];

  const frame = now => {
    raf = requestAnimationFrame(frame);
    if (now - last < 1000 / FPS - 1) return; // the motion is slow; 24 fps looks the same and keeps CPU in budget
    last = now;
    st.gl.draw((now - t0) / 1000, ptr);
  };

  const apply = () => {
    const m = motionState(st);
    // Draw a frame before showing the canvas, so it never flashes black over the painting.
    if (m.showCanvas && canvas.hidden) st.gl.draw((performance.now() - t0) / 1000, ptr);
    canvas.hidden = !m.showCanvas;
    btn.hidden = !m.showButton;
    btn.textContent = st.motionOn ? 'Pause motion' : 'Resume motion';
    fig.dataset.motion = st.lost ? 'lost' : m.run ? 'running' : 'still';
    if (m.run && !raf) raf = requestAnimationFrame(frame);
    if (!m.run && raf) { cancelAnimationFrame(raf); raf = 0; }
  };

  const init = async () => {
    if (loading || st.gl || st.lost || st.reduced) return;
    loading = true;
    try {
      const [img, depth] = await Promise.all([loadImage(still.currentSrc || still.src), loadImage(fig.dataset.depth)]);
      if (!st.lost) st.gl = makeRenderer(canvas, still, img, depth);
    } catch (e) {
      st.gl = null; // the still image stays; motion is an enhancement
      console.warn('portrait motion unavailable:', e.message);
    }
    if (st.gl) t0 = performance.now();
    fig.dataset.gl = st.gl ? 'ready' : 'none';
    loading = false;
    apply();
  };

  // GPU reset or too many contexts: fall back to the still painting, rebuild when restored.
  canvas.addEventListener('webglcontextlost', e => {
    e.preventDefault(); // allows webglcontextrestored to fire
    st.gl = null; st.lost = true;
    apply();
  });
  canvas.addEventListener('webglcontextrestored', () => {
    st.lost = false;
    if (st.inView) init();
    apply();
  });
  btn.addEventListener('click', () => { st.motionOn = !st.motionOn; apply(); });
  rm.addEventListener('change', () => { st.reduced = rm.matches; if (!st.reduced) init(); apply(); });
  document.addEventListener('visibilitychange', () => { st.pageVisible = !document.hidden; apply(); });
  fig.addEventListener('pointermove', e => {
    const r = still.getBoundingClientRect();
    ptr[0] = Math.max(-0.5, Math.min(0.5, (e.clientX - r.left) / r.width - 0.5));
    ptr[1] = Math.max(-0.5, Math.min(0.5, (e.clientY - r.top) / r.height - 0.5));
  });
  fig.addEventListener('pointerleave', () => { ptr[0] = 0; ptr[1] = 0; });
  new IntersectionObserver(entries => {
    st.inView = entries[entries.length - 1].isIntersecting;
    if (st.inView && !st.lost) init();
    apply();
  }).observe(fig);
  apply();
}

export function mountPortraits(root = document) {
  root.querySelectorAll('figure.portrait').forEach(mountPortrait);
}
