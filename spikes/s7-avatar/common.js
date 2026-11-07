// Shared helpers for the s7 avatar prototypes. Plain WebGL2, no libraries.
export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

export function loadImage(src) {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
}

export async function loadTiming() {
  const r = await fetch('tts.json');
  return r.json();
}

const VS = `#version 300 es
in vec2 a; out vec2 vUv;
void main(){ vUv = vec2(a.x*0.5+0.5, 0.5-a.y*0.5); gl_Position = vec4(a,0.,1.); }`;

export function makeGL(canvas, fragSrc, images) {
  const gl = canvas.getContext('webgl2', { antialias: false, premultipliedAlpha: false });
  if (!gl) return null;
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o);
    if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
  const p = gl.createProgram();
  gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fragSrc));
  gl.linkProgram(p); gl.useProgram(p);
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(p, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  images.forEach(([name, img], i) => {
    const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(gl.getUniformLocation(p, name), i);
  });
  const u = {};
  const set = (name, v) => {
    const l = u[name] ?? (u[name] = gl.getUniformLocation(p, name));
    if (typeof v === 'number') gl.uniform1f(l, v); else if (v.length === 2) gl.uniform2f(l, v[0], v[1]); else gl.uniform3f(l, v[0], v[1], v[2]);
  };
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
  };
  const draw = (uniforms) => { resize(); for (const k in uniforms) set(k, uniforms[k]); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); };
  return { gl, draw };
}

// Audio + captions. The <track> is kept 'hidden' so we render cues ourselves over the portrait.
export function wireAudio(audio, captionEl, playBtn) {
  const track = audio.textTracks[0];
  if (track) {
    track.mode = 'hidden';
    track.addEventListener('cuechange', () => {
      const c = track.activeCues && track.activeCues[0];
      captionEl.textContent = c ? c.text : '';
    });
  }
  playBtn.addEventListener('click', () => { audio.paused ? audio.play() : audio.pause(); });
  audio.addEventListener('play', () => { playBtn.textContent = 'Pause voice'; });
  audio.addEventListener('pause', () => { playBtn.textContent = 'Play voice'; });
  audio.addEventListener('ended', () => { playBtn.textContent = 'Play voice again'; captionEl.textContent = ''; });
}

export function envAt(timing, t) {
  const e = timing.env50; const i = Math.floor(t * 50);
  return i >= 0 && i < e.length ? e[i] : 0;
}

// Frame-cost and load measurements, read by the screenshot harness.
export function makeStats(el) {
  const s = { frames: 0, jsMs: 0, start: performance.now() };
  window.__stats = s;
  const nav = performance.getEntriesByType('navigation')[0];
  const report = () => {
    const res = performance.getEntriesByType('resource');
    const bytes = res.reduce((a, r) => a + (r.transferSize || r.encodedBodySize || 0), 0) + (nav ? (nav.transferSize || nav.encodedBodySize || 0) : 0);
    s.bytes = bytes; s.loadMs = nav ? Math.round(nav.loadEventEnd || performance.now()) : null;
    s.fps = s.frames / ((performance.now() - s.start) / 1000);
    if (el) el.textContent = `bytes ${bytes}  load ${s.loadMs} ms  frames ${s.frames}  fps ${s.fps.toFixed(1)}  js+gl per frame ${(s.jsMs / Math.max(1, s.frames)).toFixed(2)} ms`;
  };
  setInterval(report, 1000);
  return s;
}
