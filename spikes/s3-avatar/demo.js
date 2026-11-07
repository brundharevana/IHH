/* S3 spike: speaking avatar demo. Vanilla JS, no libraries.
   Clock = silent in-memory WAV on an <audio>. Captions = hidden WebVTT track + cuechange.
   Mouths = Rhubarb-style mouthCues in data/lines.json read against audio.currentTime. */
(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const params = new URLSearchParams(location.search);
  const clock = $('#clock'), trkEl = $('#trk'), track = trkEl.track;
  const slot = $('#avatar-slot'), caption = $('#caption'), capSpeaker = $('#cap-speaker');
  const els = {
    play: $('#play'), mute: $('#mute'), speed: $('#speed'), cc: $('#cc'), trToggle: $('#tr-toggle'), motion: $('#motion'),
    pos: $('#pos'), time: $('#time'), char: $('#char'), notice: $('#notice'), transcript: $('#transcript'), trList: $('#tr-list'),
    chip: $('#cap-chip'), tip: $('#cap-tip'), stats: $('#stats'), whoName: $('#who-name'), whoRole: $('#who-role'),
  };

  const S = {
    manifest: null, lines: [], byId: {}, cues: [], duration: 25, playing: false, raf: 0, blinkT: 0,
    shape: 'X', mouthEl: null, eyeEl: null, pfx: '', name: 'guide', level: 2,
    captionsOn: true, motionOn: true, forcedRM: params.get('rm') === '1', fallbackHits: 0,
    stats: { frames: 0, jsMs: 0, jsMax: 0, mouthSwaps: 0, cuechanges: 0, blinks: 0, started: 0 },
  };
  const rmQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => S.forcedRM || rmQuery.matches;
  const animate = () => S.motionOn && !reduced();

  // ---- helpers -------------------------------------------------------------------------
  const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
  function silentWav(seconds, rate = 8000) {
    const n = Math.ceil(seconds * rate), buf = new ArrayBuffer(44 + n), v = new DataView(buf);
    const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); v.setUint32(4, 36 + n, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true);
    v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, rate, true); v.setUint32(28, rate, true);
    v.setUint16(32, 1, true); v.setUint16(34, 8, true); w(36, 'data'); v.setUint32(40, n, true);
    new Uint8Array(buf, 44).fill(128); // 8-bit unsigned PCM silence
    return new Blob([buf], { type: 'audio/wav' });
  }
  const say = (msg) => { els.notice.textContent = msg; };

  // ---- avatar --------------------------------------------------------------------------
  async function loadAvatar(name, level) {
    const res = await fetch(`characters/${name}-L${level}.svg`);
    if (!res.ok) throw new Error('avatar fetch ' + res.status);
    slot.innerHTML = await res.text();
    const svg = slot.querySelector('svg');
    S.name = name; S.level = level; S.pfx = `${name}-L${level}`;
    S.mouthEl = svg.querySelector('use.mouth'); S.eyeEl = svg.querySelector('use.eye-state'); S.shape = 'X';
    const m = S.manifest.characters[name];
    els.whoName.textContent = m.name; els.whoRole.textContent = m.role;
    svg.removeAttribute('width'); svg.removeAttribute('height');
    applyMotionState();
    syncMouth(clock.currentTime);
  }
  function setMouth(shape) {
    if (shape === S.shape || !S.mouthEl) return;
    S.mouthEl.setAttribute('href', `#${S.pfx}-m-${shape}`);
    S.shape = shape; S.stats.mouthSwaps++;
  }
  function shapeAt(t) {
    const c = S.cues; let lo = 0, hi = c.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (t < c[mid].s) hi = mid - 1; else if (t >= c[mid].e) lo = mid + 1; else return c[mid].v;
    }
    return 'X';
  }
  function syncMouth(t) { setMouth(animate() ? shapeAt(t) : 'X'); }

  function blinkLoop() {
    clearTimeout(S.blinkT);
    if (!animate() || !S.eyeEl) return;
    S.blinkT = setTimeout(() => {
      if (!S.eyeEl || !animate()) return;
      S.eyeEl.setAttribute('href', `#${S.pfx}-e-closed`);
      setTimeout(() => { if (S.eyeEl) S.eyeEl.setAttribute('href', `#${S.pfx}-e-open`); S.stats.blinks++; blinkLoop(); }, 130);
    }, 2600 + Math.random() * 2800);
  }
  function applyMotionState() {
    document.documentElement.dataset.motion = animate() ? 'on' : 'off';
    els.motion.setAttribute('aria-pressed', String(animate()));
    if (S.eyeEl) S.eyeEl.setAttribute('href', `#${S.pfx}-e-open`);
    clearTimeout(S.blinkT);
    if (animate()) blinkLoop();
    syncMouth(clock.currentTime);
    if (S.playing) { cancelAnimationFrame(S.raf); if (animate()) S.raf = requestAnimationFrame(tick); }
  }

  // ---- clock loop ----------------------------------------------------------------------
  let lastUi = 0;
  function tick(now) {
    const t0 = performance.now();
    const t = clock.currentTime;
    setMouth(shapeAt(t));
    if (now - lastUi > 120) { lastUi = now; uiTime(t); checkCaptionFallback(t); }
    const dt = performance.now() - t0;
    const st = S.stats; st.frames++; st.jsMs += dt; if (dt > st.jsMax) st.jsMax = dt;
    if (S.playing && animate()) S.raf = requestAnimationFrame(tick);
  }
  function uiTime(t) {
    els.pos.value = t;
    els.pos.setAttribute('aria-valuetext', `${fmt(t)} of ${fmt(S.duration)}`);
    els.time.textContent = `${fmt(t)} / ${fmt(S.duration)}`;
  }

  // ---- captions from the hidden WebVTT track -------------------------------------------
  const cueText = (cue) => (cue.getCueAsHTML ? cue.getCueAsHTML().textContent : cue.text.replace(/<[^>]+>/g, ''));
  let shownCue = null;
  function showCue(cue) {
    shownCue = cue ? cue.id : null;
    const line = cue ? S.byId[cue.id] : null;
    if (!S.captionsOn) { caption.textContent = 'Captions are off. Turn on Captions or open the Transcript.'; caption.dataset.off = 'true'; }
    else if (cue) { caption.textContent = cueText(cue); caption.dataset.off = 'false'; }
    else { caption.textContent = ' '; caption.dataset.off = 'false'; }
    if (line) { els.chip.hidden = false; els.chip.textContent = line.fact; capSpeaker.textContent = line.speaker; }
    else if (!cue) els.chip.hidden = true;
    els.tip.hidden = true; els.chip.setAttribute('aria-expanded', 'false');
    document.querySelectorAll('#tr-list li').forEach((li) => li.toggleAttribute('aria-current', cue && li.dataset.id === cue.id));
    document.querySelectorAll('#tr-list li[aria-current]').forEach((li) => li.setAttribute('aria-current', 'true'));
  }
  function onCueChange() {
    S.stats.cuechanges++;
    const a = track.activeCues; showCue(a && a.length ? a[0] : null);
  }
  function checkCaptionFallback(t) { // safety net: if cuechange missed an edge, repair and count it
    const a = track.activeCues, id = a && a.length ? a[0].id : null;
    if (id !== shownCue && S.playing) { S.fallbackHits++; showCue(a && a.length ? a[0] : null); }
  }
  function buildTranscript() {
    els.trList.textContent = '';
    for (const cue of Array.from(track.cues || [])) {
      const line = S.byId[cue.id]; const li = document.createElement('li'); li.dataset.id = cue.id;
      const t = document.createElement('span'); t.className = 't'; t.textContent = fmt(cue.startTime);
      const p = document.createElement('span'); p.textContent = cueText(cue);
      const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = line ? line.fact : cue.id;
      b.setAttribute('aria-label', `Fact id ${b.textContent}, line ${cue.id.replace('l', '')}`);
      b.addEventListener('click', () => { say(`${b.textContent}: placeholder id. In production this opens the source card.`); });
      li.append(t, p, b); els.trList.append(li);
    }
  }

  // ---- controls ------------------------------------------------------------------------
  async function togglePlay() {
    if (clock.ended || clock.currentTime >= S.duration - 0.05) clock.currentTime = 0;
    if (clock.paused) {
      try { await clock.play(); say(''); } catch (e) { say('Playback was blocked: ' + e.name); }
    } else clock.pause();
  }
  clock.addEventListener('play', () => {
    S.playing = true; els.play.textContent = 'Pause'; lastUi = 0;
    if (!S.stats.started) S.stats.started = performance.now();
    if (animate()) S.raf = requestAnimationFrame(tick);
  });
  clock.addEventListener('pause', () => { S.playing = false; els.play.textContent = clock.ended ? 'Replay' : 'Play'; cancelAnimationFrame(S.raf); uiTime(clock.currentTime); setMouth('X'); });
  clock.addEventListener('ended', () => { S.playing = false; els.play.textContent = 'Replay'; cancelAnimationFrame(S.raf); setMouth('X'); uiTime(S.duration); });
  clock.addEventListener('seeked', () => { uiTime(clock.currentTime); syncMouth(clock.currentTime); });
  els.play.addEventListener('click', togglePlay);
  els.mute.addEventListener('click', () => { clock.muted = !clock.muted; els.mute.setAttribute('aria-pressed', String(clock.muted)); els.mute.textContent = clock.muted ? 'Unmute' : 'Mute'; });
  els.speed.addEventListener('change', () => { clock.playbackRate = parseFloat(els.speed.value); });
  els.cc.addEventListener('click', () => { S.captionsOn = !S.captionsOn; els.cc.setAttribute('aria-pressed', String(S.captionsOn)); showCue((track.activeCues && track.activeCues[0]) || null); });
  els.trToggle.addEventListener('click', () => {
    const open = els.transcript.hidden; els.transcript.hidden = !open; els.trToggle.setAttribute('aria-expanded', String(open));
  });
  els.motion.addEventListener('click', () => { S.motionOn = !S.motionOn; applyMotionState(); say(reduced() ? 'System asks for reduced motion; the avatar stays still.' : ''); });
  els.pos.addEventListener('input', () => { clock.currentTime = parseFloat(els.pos.value); });
  els.chip.addEventListener('click', () => { const open = els.tip.hidden; els.tip.hidden = !open; els.chip.setAttribute('aria-expanded', String(open)); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !els.tip.hidden) { els.tip.hidden = true; els.chip.setAttribute('aria-expanded', 'false'); els.chip.focus(); } });
  rmQuery.addEventListener('change', () => { S.motionOn = !rmQuery.matches; applyMotionState(); });
  els.char.addEventListener('change', () => loadAvatar(els.char.value, S.level).catch((e) => say(String(e))));
  document.querySelectorAll('input[name=lvl]').forEach((r) => r.addEventListener('change', () => { if (r.checked) loadAvatar(S.name, parseInt(r.value, 10)).catch((e) => say(String(e))); }));

  // ---- counters ------------------------------------------------------------------------
  function snapshot() {
    const st = S.stats;
    return {
      frames: st.frames, jsMsTotal: +st.jsMs.toFixed(3), jsMsPerFrame: st.frames ? +(st.jsMs / st.frames).toFixed(4) : 0, jsMsMax: +st.jsMax.toFixed(3),
      mouthSwaps: st.mouthSwaps, cuechanges: st.cuechanges, blinks: st.blinks, captionFallbackHits: S.fallbackHits,
      t: +clock.currentTime.toFixed(2), playing: S.playing, animate: animate(), reducedMotion: reduced(), rate: clock.playbackRate,
    };
  }
  function paintStats() { els.stats.textContent = JSON.stringify(snapshot(), null, 1); }
  setInterval(() => { if (document.querySelector('.dbg').open) paintStats(); }, 500);
  window.__s3 = {
    S, snapshot, reset() { Object.assign(S.stats, { frames: 0, jsMs: 0, jsMax: 0, mouthSwaps: 0, cuechanges: 0, blinks: 0 }); S.fallbackHits = 0; },
    loadAvatar, togglePlay, clock, track, setMotion(on) { S.motionOn = on; applyMotionState(); },
  };

  // ---- boot ----------------------------------------------------------------------------
  async function boot() {
    const [manifest, doc] = await Promise.all([fetch('characters/manifest.json').then((r) => r.json()), fetch('data/lines.json').then((r) => r.json())]);
    S.manifest = manifest; S.lines = doc.lines; S.duration = Math.ceil(doc.duration + 1);
    for (const l of S.lines) { S.byId[l.id] = l; for (const c of l.mouthCues) S.cues.push({ s: c.start, e: c.end, v: c.value }); }
    S.cues.sort((a, b) => a.s - b.s);
    els.pos.max = String(S.duration); uiTime(0);
    clock.src = URL.createObjectURL(silentWav(S.duration + 0.5));
    for (const [id, c] of Object.entries(manifest.characters)) {
      const o = document.createElement('option'); o.value = id; o.textContent = id === 'guide' ? `${c.name} (fictional)` : c.name; els.char.append(o);
    }
    S.motionOn = !reduced();
    document.documentElement.dataset.motion = animate() ? 'on' : 'off';
    track.mode = 'hidden';
    track.addEventListener('cuechange', onCueChange);
    const ready = new Promise((res) => { if (track.cues && track.cues.length) res(); else trkEl.addEventListener('load', res, { once: true }); setTimeout(res, 2500); });
    const want = manifest.characters[params.get('char')] ? params.get('char') : 'guide';
    const lvl = params.get('lvl') === '1' ? 1 : 2;
    els.char.value = want; document.querySelector(`input[name=lvl][value="${lvl}"]`).checked = true;
    await loadAvatar(want, lvl);
    await ready; buildTranscript();
    // spike-only debug params used for screenshots: ?t=seconds  &tr=1 (open transcript)  &rm=1 (force reduced motion)
    if (params.get('tr') === '1') { els.transcript.hidden = false; els.trToggle.setAttribute('aria-expanded', 'true'); }
    const seek = parseFloat(params.get('t'));
    if (!Number.isNaN(seek)) { const go = () => { clock.currentTime = seek; }; if (clock.readyState >= 1) go(); else clock.addEventListener('loadedmetadata', go, { once: true }); }
    if (reduced()) say(S.forcedRM ? 'Reduced motion forced by ?rm=1: static portrait, captions only.' : 'Your system asks for reduced motion: the avatar stays still; captions still play.');
    document.documentElement.dataset.ready = 'true';
  }
  boot().catch((e) => { say('Boot failed: ' + e); console.error(e); });
})();
