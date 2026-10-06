(() => {
'use strict';
const SPRITE = /*SPRITE*/null;
const PORTRAIT = '/*PORTRAIT*/';
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = s => document.querySelector(s);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t * t * (3 - 2 * t);
const rnd = (a, b) => a + Math.random() * (b - a);
function mulberry(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hex(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function mix(a, b, t) { const A = hex(a), B = hex(b); return `rgb(${Math.round(lerp(A[0], B[0], t))},${Math.round(lerp(A[1], B[1], t))},${Math.round(lerp(A[2], B[2], t))})`; }
function keyed(keys, x) { // keys: [[x, value]] numeric
  if (x <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (x <= keys[i][0]) { const t = ease((x - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0])); return lerp(keys[i - 1][1], keys[i][1], t); }
  return keys[keys.length - 1][1];
}
function keyedCol(keys, x) {
  if (x <= keys[0][0]) return keys[0].slice(1);
  for (let i = 1; i < keys.length; i++) if (x <= keys[i][0]) { const t = ease((x - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0])); return keys[i].slice(1).map((c, j) => mix(keys[i - 1][j + 1], c, t)); }
  return keys[keys.length - 1].slice(1);
}
function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return [c, x]; }

/* ================= SPRITES ================= */
const FR = {};
let FOOT = 26;
(function buildSprites() {
  const { w, h, pal, frames } = SPRITE;
  // blink frame
  frames.blink = frames.idle0.map(r => r.replace(/W/g, 's').replace(/E/g, 'K'));
  let foot = 0;
  frames.idle0.forEach((r, y) => { if (/[^.]/.test(r)) foot = y; });
  FOOT = foot + 1;
  for (const name in frames) {
    const rows = frames[name];
    const variants = {};
    for (const tint of ['n', 'ghost', 'white']) {
      const [c, x] = mk(w, h);
      rows.forEach((r, y) => { for (let i = 0; i < r.length; i++) { const ch = r[i]; if (ch === '.') continue; x.fillStyle = tint === 'n' ? pal[ch] : tint === 'white' ? '#ffffff' : (ch === 'K' ? '#2a8fb0' : '#8fe6f5'); x.fillRect(i, y, 1, 1); } });
      const [f, fx] = mk(w, h); fx.translate(w, 0); fx.scale(-1, 1); fx.drawImage(c, 0, 0);
      variants[tint] = { r: c, l: f };
    }
    FR[name] = variants;
  }
})();

/* ================= SHARED ART HELPERS ================= */
const GLOWS = {};
function glow(rgbaPrefix) { // e.g. 'rgba(255,200,120,'
  if (GLOWS[rgbaPrefix]) return GLOWS[rgbaPrefix];
  const [c, x] = mk(64, 64); const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, rgbaPrefix + '0.9)'); g.addColorStop(0.35, rgbaPrefix + '0.35)'); g.addColorStop(1, rgbaPrefix + '0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64); return GLOWS[rgbaPrefix] = c;
}
const HOLE = (() => { const [c, x] = mk(64, 64); const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.5, 'rgba(0,0,0,.6)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return c; })();
const CLOUD_TINTS = { day: ['#ffffff', '#e6f7ff', '#b4e0fa'], sunset: ['#fff3de', '#ffd0b4', '#f48fa8'], night: ['#5866bd', '#46529f', '#353f86'], dawn: ['#fff5e8', '#ffcdb8', '#f28fae'] };
const CLOUDS = {};
function cloudSet(tint) {
  if (CLOUDS[tint]) return CLOUDS[tint];
  const pal = CLOUD_TINTS[tint], out = [];
  for (let k = 0; k < 6; k++) {
    const r = mulberry(40 + k), w = 46 + Math.floor(r() * 40), h = 30;
    const grid = Array.from({ length: h }, () => new Array(w).fill(0));
    const fill = (cx, cy, rx, ry) => { for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1) grid[y][x] = 1; };
    fill(w / 2, h - 7, w * 0.47, 6);
    const n = 3 + Math.floor(r() * 2);
    for (let i = 0; i < n; i++) { const t = (i + 0.5) / n, rad = 7 + r() * 6 + (Math.abs(t - 0.5) < 0.2 ? 4 : 0); fill(w * (0.18 + t * 0.64), h - 8 - rad * 0.55, rad, rad); }
    const [c, cx2] = mk(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (!grid[y][x]) continue;
      const bottom = y + 2 >= h || !grid[y + 2][x], low = y + 5 >= h || !grid[y + 5][x];
      cx2.fillStyle = bottom ? pal[2] : low ? pal[1] : pal[0];
      cx2.fillRect(x, y, 1, 1);
    }
    out.push(c);
  }
  return CLOUDS[tint] = out;
}
const SUNP = { day: ['#fffbe0', '#ffe14d', 'rgba(255,236,140,'], set: ['#fff3b8', '#ffa53d', 'rgba(255,170,90,'], dawn: ['#fff8d8', '#ffc94d', 'rgba(255,186,120,'] };
function pixelSun(c, x, y, r, t, kind, a = 1) {
  if (a < 0.02) return; const P = SUNP[kind];
  x = Math.round(x); y = Math.round(y);
  c.globalAlpha = a; c.globalCompositeOperation = 'lighter';
  c.globalAlpha = a * (kind === 'day' ? 0.6 : 1); c.drawImage(glow(P[2]), x - r * 4.5, y - r * 4.5, r * 9, r * 9); c.globalAlpha = a;
  c.save(); c.translate(x, y); c.rotate(t * 0.04); c.fillStyle = P[2] + (kind === 'day' ? '0.09)' : '0.2)');
  for (let i = 0; i < 12; i++) { c.rotate(Math.PI / 6); c.beginPath(); c.moveTo(-3, r + 3); c.lineTo(3, r + 3); c.lineTo(0, r * (kind === 'day' ? (i % 2 ? 1.8 : 2.4) : (i % 2 ? 2.4 : 3.4))); c.fill(); }
  c.restore(); c.globalCompositeOperation = 'source-over';
  c.fillStyle = P[1]; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  c.fillStyle = P[0]; c.beginPath(); c.arc(x - 1, y - 1, r - 3, 0, 7); c.fill();
  c.fillStyle = '#ffffff'; c.fillRect(x - Math.round(r * 0.45), y - Math.round(r * 0.55), 3, 2);
  c.globalAlpha = 1;
}

/* ================= TITLE SCREEN ================= */
function startTitle() {
  const cvT = $('#titleCv'), tx = cvT.getContext('2d'), sec = $('#intro'), hit = $('#heroHit');
  let TW = 480, TH = 270, TR = 2, vis = true, waveUntil = 0, jumpT = -1, bubble = 0, bubbleT = 0;
  const CL = cloudSet('day');
  const clouds = Array.from({ length: 9 }, (_, i) => ({ x: (i * 113) % 640, y: 10 + (i * 29) % 80, s: 0.5 + (i % 3) * 0.4, k: i % CL.length }));
  const ICONS = {
    smile: ['.........', '..K...K..', '..K...K..', '.........', '.K.....K.', '..KKKKK..', '.........'],
    heart: ['.RR...RR.', 'RRRR.RRRR', 'RRRRRRRRR', '.RRRRRRR.', '..RRRRR..', '...RRR...', '....R....'],
    bang: ['....K....', '...KKK...', '...KKK...', '....K....', '....K....', '.........', '....K....'],
    code: ['.........', '..K...K..', '.K...K.K.', 'K...K...K', '.K.K...K.', '..K...K..', '.........'],
  };
  const ICON_ORDER = ['smile', 'code', 'bang', 'smile'];
  function drawBubble(c, x, y, icon) {
    x = Math.round(x); y = Math.round(y);
    c.fillStyle = '#1e1633'; c.fillRect(x + 1, y, 18, 1); c.fillRect(x + 1, y + 13, 18, 1); c.fillRect(x, y + 1, 1, 12); c.fillRect(x + 19, y + 1, 1, 12);
    c.fillStyle = '#fff1a6'; c.fillRect(x + 1, y + 1, 18, 12); c.fillStyle = '#ffffff'; c.fillRect(x + 2, y + 2, 3, 1);
    c.fillStyle = '#1e1633'; c.fillRect(x + 3, y + 14, 3, 1); c.fillRect(x + 3, y + 15, 2, 1); c.fillRect(x + 3, y + 16, 1, 1); c.fillStyle = '#fff1a6'; c.fillRect(x + 4, y + 13, 2, 1); c.fillRect(x + 4, y + 14, 1, 1);
    ICONS[icon].forEach((r, yy) => { for (let i = 0; i < r.length; i++) { if (r[i] === '.') continue; c.fillStyle = r[i] === 'R' ? '#ff4a5e' : '#1e1633'; c.fillRect(x + 5 + i, y + 3 + yy, 1, 1); } });
  }
  function size() {
    const r = sec.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2), a = r.width / Math.max(1, r.height);
    if (a >= 1) { TH = 270; TW = Math.round(270 * a); } else { TW = 300; TH = Math.round(300 / a); }
    TR = clamp(Math.round(r.height * dpr / TH), 1, 3);
    cvT.width = TW * TR; cvT.height = TH * TR; tx.imageSmoothingEnabled = false;
    const k = r.height / TH, gy = TH - 30;
    hit.style.left = '50%'; hit.style.top = (gy / TH * 100) + '%'; hit.style.width = (34 * k) + 'px'; hit.style.height = (46 * k) + 'px';
  }
  function draw(now) {
    requestAnimationFrame(draw); if (!vis) return;
    const t = now / 1000; tx.setTransform(TR, 0, 0, TR, 0, 0); tx.imageSmoothingEnabled = false;
    const g = tx.createLinearGradient(0, 0, 0, TH); g.addColorStop(0, '#2f9cff'); g.addColorStop(0.6, '#86d4ff'); g.addColorStop(1, '#e2f8ff'); tx.fillStyle = g; tx.fillRect(0, 0, TW, TH);
    pixelSun(tx, TW * 0.86, Math.min(48, TH * 0.16), 15, t, 'day');
    for (const c of clouds) { const img = CL[c.k]; const x = ((c.x + t * 5 * c.s) % (TW + 140)) - 100; tx.drawImage(img, Math.round(x), Math.round(c.y)); }
    const gy = TH - 30;
    for (let x = -((t * 1.5) % TILE); x < TW; x += TILE) tx.drawImage(LAYERS.far.delhi, Math.round(x), gy - 212);
    drawKitesOn(tx, t, TW, gy, 0, true);
    for (let x = -((t * 4) % TILE); x < TW; x += TILE) tx.drawImage(LAYERS.mid.dawn, Math.round(x), gy - 226);
    // ground
    tx.fillStyle = '#b06a3e'; tx.fillRect(0, gy, TW, TH - gy);
    tx.fillStyle = '#3faa4a'; tx.fillRect(0, gy, TW, 6); tx.fillStyle = '#7ee06a'; tx.fillRect(0, gy, TW, 4); tx.fillStyle = '#c2ff8a'; tx.fillRect(0, gy, TW, 1);
    for (let x = 0; x < TW; x += 6) { tx.fillStyle = '#7ee06a'; tx.fillRect(x + ((x * 7) % 5), gy - 1 - ((x * 13) % 3), 1, 2); }
    for (let i = 0; i < TW / 14; i++) { const sx = (i * 37) % TW, sy = gy + 10 + (i * 11) % Math.max(8, TH - gy - 14); tx.fillStyle = i % 2 ? '#8a4f30' : '#d08a5a'; tx.fillRect(sx, sy, 3, 2); }
    for (let i = 0; i < TW / 24; i++) { const fx = (i * 53 + 11) % TW; tx.fillStyle = ['#ff5e7a', '#ffd23d', '#ffffff', '#b9a6ff'][i % 4]; tx.fillRect(fx, gy - 3, 2, 2); tx.fillStyle = '#2f9a4a'; tx.fillRect(fx, gy - 1, 1, 1); }
    // hero
    const cx = TW / 2; let name = Math.floor(t / 0.6) % 2 ? 'idle1' : 'idle0';
    if ((t % 3.4) < 0.14) name = 'blink';
    const nowMs = performance.now(); if (nowMs < waveUntil) name = Math.floor(t / 0.16) % 2 ? 'wave0' : 'wave1';
    let dy = 0; if (jumpT >= 0) { const k = (nowMs - jumpT) / 460; if (k >= 1) jumpT = -1; else dy = -Math.sin(k * Math.PI) * 22; }
    tx.fillStyle = 'rgba(30,22,51,.28)'; const sw = 16 + dy * 0.25; tx.fillRect(Math.round(cx - sw / 2), gy, Math.round(sw), 2); tx.fillRect(Math.round(cx - sw / 2 + 2), gy + 2, Math.round(sw - 4), 1);
    const f = FR[name].n.r; tx.drawImage(f, Math.round(cx - SPRITE.w / 2), Math.round(gy - FOOT + dy));
    if (nowMs > bubbleT) { bubble = (bubble + 1) % ICON_ORDER.length; bubbleT = nowMs + 2600; }
    drawBubble(tx, cx + 6, gy - FOOT - 8 + dy + Math.round(Math.sin(t * 3)), nowMs < waveUntil + 800 ? 'heart' : ICON_ORDER[bubble]);
  }
  size(); addEventListener('resize', size);
  new IntersectionObserver(es => es.forEach(e => vis = e.isIntersecting), { threshold: 0 }).observe(sec);
  hit.addEventListener('click', () => { AE.unlock(); waveUntil = performance.now() + 1400; jumpT = performance.now(); AE.sfx('jump'); setTimeout(() => AE.sfx('coin', 4), 180); });
  requestAnimationFrame(draw);
}
function drawKitesOn(c, t, W, gy, camX, edges) {
  for (const k of KITES) {
    let x = (k.x - camX * 0.25) % (W + 160); if (x < -40) x += W + 160;
    if (edges && x > W * 0.26 && x < W * 0.74) continue;
    const y = k.y + Math.sin(t * 0.9 + k.p) * 6, sw = Math.sin(t * 1.3 + k.p) * 0.25;
    c.strokeStyle = 'rgba(30,22,51,.35)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(x, y + 7); c.quadraticCurveTo(x + 30, y + 80, x + 10 + sw * 40, gy); c.stroke();
    c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(sw);
    c.fillStyle = '#1e1633'; c.beginPath(); c.moveTo(0, -8); c.lineTo(6, 0); c.lineTo(0, 8); c.lineTo(-6, 0); c.fill();
    c.fillStyle = k.c; c.beginPath(); c.moveTo(0, -7); c.lineTo(5, 0); c.lineTo(0, 7); c.lineTo(-5, 0); c.fill();
    c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.moveTo(0, -7); c.lineTo(-5, 0); c.lineTo(0, 0); c.fill();
    c.fillStyle = k.c; c.fillRect(-1, 8, 2, 3); c.restore();
  }
}

/* ================= AUDIO ================= */
const VOICE_IDS = ['intro', 'arc_overview', 'arc_impact', 'arc_use', 'vayu_overview', 'vayu_impact', 'vayu_use', 'outro'];
const BPM = 78, SIX = 60 / BPM / 4;
const m2f = m => 440 * Math.pow(2, (m - 69) / 12);
const PROG = [[50, 57, 61, 64, 66], [47, 54, 57, 62, 66], [43, 50, 54, 59, 62], [45, 52, 59, 61, 64]];
const ROOT = [38, 35, 31, 33];
const PENTA = [62, 64, 66, 69, 71, 74, 76, 78, 81, 83];
const MOTIF_A = [4, 3, 2, 4, 5, 4, 2, -1], MOTIF_B = [2, 3, 4, 7, 6, 4, 3, -1];
const AE = {
  ctx: null, on: { music: true, voice: true }, active: false, voiceBuf: {}, voiceLoad: null, cur: null, night: 0, day: 1, duck: 1,
  unlock() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    const c = this.ctx = new AC();
    this.master = c.createGain(); this.master.gain.value = 0.9;
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -12; comp.ratio.value = 3;
    this.master.connect(comp); comp.connect(c.destination);
    this.music = c.createGain(); this.music.gain.value = 0; this.music.connect(this.master);
    this.sfxBus = c.createGain(); this.sfxBus.gain.value = 0.5; this.sfxBus.connect(this.master);
    this.voice = c.createGain(); this.voice.gain.value = 1.15;
    this.an = c.createAnalyser(); this.an.fftSize = 512; this.voice.connect(this.an); this.an.connect(this.master);
    this.anBuf = new Float32Array(512);
    // noise + reverb
    this.noise = c.createBuffer(1, c.sampleRate * 2, c.sampleRate); const nd = this.noise.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    const ir = c.createBuffer(2, c.sampleRate * 2.6, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.4); }
    this.rev = c.createConvolver(); this.rev.buffer = ir; const rg = c.createGain(); rg.gain.value = 0.55; this.rev.connect(rg); rg.connect(this.music);
    this.padF = c.createBiquadFilter(); this.padF.type = 'lowpass'; this.padF.frequency.value = 1500; this.padF.connect(this.music); this.padF.connect(this.rev);
    this.dly = c.createDelay(1.5); this.dly.delayTime.value = SIX * 3; const fb = c.createGain(); fb.gain.value = 0.34; const dl = c.createBiquadFilter(); dl.type = 'lowpass'; dl.frequency.value = 2600;
    this.dly.connect(fb); fb.connect(dl); dl.connect(this.dly); this.dly.connect(this.music); this.dly.connect(this.rev);
    this.pluck = c.createGain(); this.pluck.gain.value = 1; this.pluck.connect(this.music); this.pluck.connect(this.dly); this.pluck.connect(this.rev);
    this.drums = c.createGain(); this.drums.gain.value = 1; this.drums.connect(this.music);
    // nature bed
    this.nat = c.createGain(); this.nat.gain.value = 0; this.nat.connect(this.master);
    const wn = c.createBufferSource(); wn.buffer = this.noise; wn.loop = true; const wb = c.createBiquadFilter(); wb.type = 'bandpass'; wb.frequency.value = 420; wb.Q.value = 0.6;
    this.windG = c.createGain(); this.windG.gain.value = 0.05; wn.connect(wb); wb.connect(this.windG); this.windG.connect(this.nat); wn.start();
    const lfo = c.createOscillator(); lfo.frequency.value = 0.07; const lg = c.createGain(); lg.gain.value = 0.035; lfo.connect(lg); lg.connect(this.windG.gain); lfo.start();
    this.step = 0; this.nextT = c.currentTime + 0.12; this.lastWalk = 4; this.birdT = 0; this.crickT = 0;
    this.timer = setInterval(() => this.tick(), 25);
    this.loadVoices();
    this.setActive(this.active);
  },
  loadVoices() {
    if (this.voiceLoad) return this.voiceLoad;
    this.voiceLoad = Promise.all(VOICE_IDS.map(id => fetch(`audio/${id}.mp3`).then(r => { if (!r.ok) throw 0; return r.arrayBuffer(); })
      .then(b => new Promise((res, rej) => this.ctx.decodeAudioData(b, res, rej))).then(buf => { this.voiceBuf[id] = buf; }).catch(() => { })));
    return this.voiceLoad;
  },
  setActive(a) { this.active = a; if (!this.ctx) return; const t = this.ctx.currentTime; this.music.gain.cancelScheduledValues(t); this.music.gain.setTargetAtTime(a && this.on.music ? 0.42 * this.duck : 0, t, 0.6); this.nat.gain.setTargetAtTime(a ? 1 : 0, t, 0.8); },
  setDuck(d) { this.duck = d; this.setActive(this.active); },
  setZone(night, day) { this.night = night; this.day = day; if (this.ctx) this.padF.frequency.setTargetAtTime(lerp(1700, 900, night), this.ctx.currentTime, 1); },
  tick() {
    const c = this.ctx; if (!c || c.state !== 'running') return;
    while (this.nextT < c.currentTime + 0.14) {
      this.playStep(this.step, this.nextT);
      this.nextT += SIX * (this.step % 2 === 0 ? 1.12 : 0.88); this.step++;
    }
    if (!this.active) return;
    const now = c.currentTime;
    if (now > this.birdT) { this.birdT = now + rnd(2.5, 7); if (Math.random() < this.day) this.bird(now + 0.05); }
    if (now > this.crickT) { this.crickT = now + rnd(0.9, 1.8); if (this.night > 0.45) this.cricket(now + 0.02); }
  },
  env(g, t, a, peak, dec) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); },
  playStep(s, t) {
    if (!this.active || !this.on.music) return;
    const c = this.ctx, bar = Math.floor(s / 16), pos = s % 16, ci = Math.floor(bar / 2) % 4;
    const breath = bar % 16 >= 14; // two bars of air every 16
    if (pos === 0 && bar % 2 === 0) this.pad(PROG[ci], t, SIX * 32);
    if (!breath) {
      if (pos === 0 || pos === 10) this.kick(t, pos ? 0.32 : 0.5);
      if (pos === 4 || pos === 12) this.snap(t);
      if (pos % 4 === 2) this.hat(t, 0.05 + Math.random() * 0.02);
      if (pos === 0 || pos === 7 || pos === 10) this.bass(m2f(ROOT[ci] + (pos === 10 ? 7 : 0)), t, SIX * (pos === 7 ? 2 : 3));
    }
    if (pos % 2 === 0) {
      const e = pos / 2, phrase = bar % 4; let idx = -1;
      if (phrase === 0) idx = MOTIF_A[e];
      else if (phrase === 2) idx = MOTIF_B[e];
      else if (Math.random() < 0.38) { this.lastWalk = clamp(this.lastWalk + Math.floor(rnd(-2, 3)), 0, PENTA.length - 1); idx = this.lastWalk; }
      if (idx >= 0) this.kalimba(m2f(PENTA[idx]), t, phrase % 2 ? 0.1 : 0.14);
    }
  },
  pad(notes, t, dur) {
    const c = this.ctx;
    notes.forEach((n, i) => {
      for (const det of [-7, 7]) {
        const o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = m2f(n); o.detune.value = det + (i === 0 ? 0 : 3);
        const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.022, t + 1.4); g.gain.setValueAtTime(0.022, t + dur - 1.2); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.6);
        o.connect(g); g.connect(this.padF); o.start(t); o.stop(t + dur + 0.7);
      }
    });
  },
  kalimba(f, t, v) {
    const c = this.ctx;
    const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = f; const g = c.createGain(); this.env(g, t, 0.004, v, 1.1);
    const o2 = c.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 4.02; const g2 = c.createGain(); this.env(g2, t, 0.002, v * 0.18, 0.18);
    o.connect(g); o2.connect(g2); g.connect(this.pluck); g2.connect(this.pluck); o.start(t); o2.start(t); o.stop(t + 1.3); o2.stop(t + 0.3);
  },
  bass(f, t, d) {
    const c = this.ctx, o = c.createOscillator(); o.type = 'sine'; o.frequency.value = f; const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(this.drums); o.start(t); o.stop(t + d + 0.05);
  },
  kick(t, v) {
    const c = this.ctx, o = c.createOscillator(); o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.16);
    const g = c.createGain(); this.env(g, t, 0.003, v * 0.5, 0.22); o.connect(g); g.connect(this.drums); o.start(t); o.stop(t + 0.3);
  },
  noiseHit(t, type, f, q, v, d, bus) {
    const c = this.ctx, s = c.createBufferSource(); s.buffer = this.noise; const b = c.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q;
    const g = c.createGain(); this.env(g, t, 0.002, v, d); s.connect(b); b.connect(g); g.connect(bus || this.drums); s.start(t, Math.random()); s.stop(t + d + 0.05); return b;
  },
  hat(t, v) { this.noiseHit(t, 'highpass', 7000, 0.7, v, 0.04); },
  snap(t) { this.noiseHit(t, 'bandpass', 1800, 1.2, 0.07, 0.09); },
  bird(t) {
    const c = this.ctx, n = 2 + Math.floor(Math.random() * 3), base = rnd(2600, 3800), p = c.createStereoPanner ? c.createStereoPanner() : null;
    if (p) { p.pan.value = rnd(-0.8, 0.8); p.connect(this.nat); }
    for (let i = 0; i < n; i++) {
      const tt = t + i * rnd(0.09, 0.14), o = c.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(base, tt); o.frequency.exponentialRampToValueAtTime(base * rnd(1.2, 1.5), tt + 0.06);
      const g = c.createGain(); this.env(g, tt, 0.01, 0.018, 0.07); o.connect(g); g.connect(p || this.nat); o.start(tt); o.stop(tt + 0.1);
    }
  },
  cricket(t) {
    const c = this.ctx;
    for (let i = 0; i < 3; i++) { const tt = t + i * 0.045, o = c.createOscillator(); o.frequency.value = 4600 + rnd(-80, 80); const g = c.createGain(); this.env(g, tt, 0.004, 0.012 * this.night, 0.025); o.connect(g); g.connect(this.nat); o.start(tt); o.stop(tt + 0.04); }
  },
  tone(type, f0, f1, d, v, t) {
    const c = this.ctx; t = t || c.currentTime; const o = c.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, t); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + d);
    const g = c.createGain(); this.env(g, t, 0.004, v, d); o.connect(g); g.connect(this.sfxBus); o.start(t); o.stop(t + d + 0.05);
  },
  sfx(name, k = 0) {
    const c = this.ctx; if (!c || c.state !== 'running') return; const t = c.currentTime;
    switch (name) {
      case 'jump': this.tone('square', 260, 520, 0.11, 0.06); break;
      case 'djump': this.tone('square', 420, 900, 0.12, 0.05); this.tone('sine', 1300, 1900, 0.15, 0.04, t + 0.03); break;
      case 'land': this.noiseHit(t, 'lowpass', 500, 0.8, 0.12, 0.06, this.sfxBus); break;
      case 'dash': { const b = this.noiseHit(t, 'bandpass', 900, 1.4, 0.22, 0.2, this.sfxBus); b.frequency.exponentialRampToValueAtTime(3000, t + 0.18); break; }
      case 'slash': { const b = this.noiseHit(t, 'bandpass', 2400 + k * 500, 2, 0.2, 0.09, this.sfxBus); b.frequency.exponentialRampToValueAtTime(6000, t + 0.08); this.tone('triangle', 700 + k * 120, 300, 0.07, 0.04); break; }
      case 'hit': this.tone('square', 180, 60, 0.12, 0.09); this.noiseHit(t, 'lowpass', 1500, 0.7, 0.2, 0.08, this.sfxBus); break;
      case 'pop': this.tone('square', 620, 140, 0.18, 0.07); this.noiseHit(t, 'bandpass', 1200, 1, 0.18, 0.15, this.sfxBus); break;
      case 'hurt': this.tone('sawtooth', 300, 90, 0.25, 0.06); break;
      case 'coin': { const f = m2f(PENTA[Math.min(k, PENTA.length - 1)] + 12); this.tone('triangle', f, 0, 0.08, 0.06); this.tone('triangle', f * 1.5, 0, 0.16, 0.05, t + 0.05); break; }
      case 'orb': [0, 2, 4, 7, 9].forEach((s, i) => this.tone('triangle', m2f(PENTA[s] + 12), 0, 0.3, 0.055, t + i * 0.06)); this.tone('sine', m2f(86), 0, 0.8, 0.04, t + 0.3); break;
      case 'chest': [0, 4, 7, 12].forEach((s, i) => this.tone('square', m2f(62 + s), 0, 0.18, 0.04, t + i * 0.08)); this.tone('triangle', m2f(86), 0, 0.6, 0.05, t + 0.34); break;
      case 'station': [0, 3, 5, 7, 9].forEach((s, i) => this.tone('sine', m2f(PENTA[s] + 12), 0, 0.6, 0.05, t + i * 0.09)); break;
      case 'gate': PROG[0].forEach((n, i) => this.tone('triangle', m2f(n + 12), 0, 1.6, 0.05, t + i * 0.05)); [7, 8, 9].forEach((s, i) => this.tone('square', m2f(PENTA[s] + 12), 0, 0.25, 0.03, t + 0.4 + i * 0.1)); break;
      case 'ui': this.tone('square', 880, 0, 0.04, 0.03); break;
    }
  },
  async playVoice(id) {
    this.stopVoice();
    if (!this.ctx || !this.on.voice) return null;
    if (!this.voiceBuf[id]) await Promise.race([this.loadVoices(), new Promise(r => setTimeout(r, 2500))]);
    const b = this.voiceBuf[id]; if (!b) return null;
    const s = this.ctx.createBufferSource(); s.buffer = b; s.connect(this.voice); s.start();
    this.cur = s; this.setDuck(0.35);
    const ended = new Promise(res => { s.onended = () => { if (this.cur === s) { this.cur = null; this.setDuck(1); } res(); }; });
    return { dur: b.duration, ended, src: s };
  },
  stopVoice() { if (this.cur) { const s = this.cur; this.cur = null; try { s.onended && s.onended(); s.stop(); } catch (e) { } this.setDuck(1); } },
  level() { if (!this.an || !this.cur) return 0; this.an.getFloatTimeDomainData(this.anBuf); let s = 0; for (const v of this.anBuf) s += v * v; return Math.sqrt(s / this.anBuf.length); },
};

/* ================= WORLD ================= */
const LH = 270, WORLD_W = 4900;
const ZONES = [
  { id: 'delhi', x0: -400, x1: 1150, name: 'Delhi Rooftops', num: 'ZONE 1 · WHERE IT STARTS' },
  { id: 'arc', x0: 1150, x1: 2450, name: 'The Paper Archive', num: 'ZONE 2 · ARCVISUAL' },
  { id: 'vayu', x0: 2450, x1: 3960, name: 'Landfill Frontier', num: 'ZONE 3 · VAYUNETRA' },
  { id: 'dawn', x0: 3960, x1: 5400, name: 'Sunrise Gate', num: 'ZONE 4 · LOOT + HIRE' },
];
const zoneAt = x => ZONES.find(z => x >= z.x0 && x < z.x1) || ZONES[3];
function zoneWeights(x) { return ZONES.map(z => clamp(Math.min((x - z.x0 + 160) / 320, (z.x1 - x + 160) / 320), 0, 1)); }
const SKY = [[0, '#2f9cff', '#7fd0ff', '#d8f6ff'], [1000, '#2f9cff', '#86d4ff', '#e2f8ff'], [1500, '#5b5ff0', '#ff9cb8', '#ffd98a'], [2300, '#4a46c4', '#ff7f9f', '#ffb36b'], [2700, '#0f1a52', '#26338a', '#4c3c96'], [3800, '#0f1a52', '#273489', '#503e98'], [4150, '#2f3fa6', '#ff8fa8', '#ffcf6b'], [4900, '#4a86e8', '#ffb3a6', '#ffe7a6']];
const DARK = [[0, 0], [1100, 0], [1500, 0.05], [2300, 0.1], [2700, 0.34], [3850, 0.34], [4150, 0.06], [4500, 0]];

const solids = [], tokens = [], orbs = [], enemies = [], chests = [], stations = [], movers = [];
const G = (x0, x1, y) => solids.push({ x: x0, y, w: x1 - x0, h: LH + 60 - y, k: 'ground' });
const B = (x, y, w, h, look) => solids.push({ x, y, w, h, k: 'block', look });
const P = (x, y, w) => solids.push({ x, y, w, h: 6, k: 'oneway' });
function arc(x0, y0, x1, y1, n, hgt) { for (let i = 0; i < n; i++) { const t = n === 1 ? 0.5 : i / (n - 1); tokens.push({ x: lerp(x0, x1, t), y: lerp(y0, y1, t) - Math.sin(t * Math.PI) * hgt, got: false, ph: i * 0.5 }); } }
const SKILLS = [['Python', 'Py'], ['C++', 'C+'], ['TypeScript', 'TS'], ['Go', 'Go'], ['LangGraph', 'LG'], ['LlamaIndex', 'LI'], ['Hugging Face', 'HF'], ['FastAPI', 'API'], ['PyTorch', 'PT'], ['ONNX', 'OX'], ['Docker', 'DK'], ['PostgreSQL', 'PG']];
const O = (x, y, i) => orbs.push({ x, y, name: SKILLS[i][0], short: SKILLS[i][1], got: false, ph: i });
const bug = (x0, x1, y) => enemies.push({ t: 'bug', x: (x0 + x1) / 2, y, x0, x1, dir: 1, hp: 2, fl: 0, kb: 0, ph: Math.random() * 9 });
const ghost = (x, y) => enemies.push({ t: 'ghost', x, y, by: y, bx: x, hp: 1, fl: 0, kb: 0, ph: Math.random() * 9 });

// Zone 1: Delhi rooftops
G(-400, 560, 214); G(612, 900, 214); G(952, 1160, 200);
B(370, 190, 26, 24, 'tank'); B(842, 186, 28, 28, 'tank'); B(1090, 176, 24, 24, 'tank');
P(196, 172, 58); P(462, 150, 52); P(668, 168, 62); P(752, 126, 48); P(1010, 158, 60);
O(488, 128, 0); O(699, 146, 1); O(776, 104, 2); O(1040, 136, 3);
arc(130, 205, 250, 160, 5, 18); arc(290, 205, 360, 205, 4, 0); arc(560, 200, 612, 200, 3, 30); arc(905, 195, 950, 185, 3, 26);
bug(640, 880, 214); bug(970, 1080, 200);
// Zone 2: Paper archive
G(1200, 1480, 206); G(1540, 1770, 206); G(1832, 2470, 206);
B(1160, 182, 40, 18, 'books'); B(1440, 178, 30, 28, 'books'); B(1720, 172, 34, 34, 'books');
P(1280, 160, 54); P(1376, 120, 48); P(1590, 158, 54); P(1682, 116, 50); P(1890, 164, 60);
O(1307, 138, 4); O(1617, 136, 5); O(1707, 94, 6); O(1920, 142, 7);
arc(1375, 108, 1425, 108, 3, 0); arc(1482, 196, 1538, 196, 3, 30); arc(1772, 196, 1830, 196, 3, 30); arc(1990, 200, 2100, 200, 5, 0);
bug(1220, 1430, 206); ghost(1650, 150); bug(1850, 2000, 206); ghost(1960, 120);
stations.push({ id: 'arc', x: 2210, y: 206, visited: false, name: 'ArcVisual' });
// Zone 3: Landfill
G(2530, 2800, 210); G(2862, 3080, 198); G(3262, 3470, 210); G(3530, 3970, 210);
B(2650, 186, 24, 24, 'bale'); B(3340, 182, 30, 28, 'bale'); B(3000, 174, 26, 24, 'bale');
P(2578, 164, 56); P(2920, 140, 52); P(3384, 140, 50); P(3600, 160, 56);
movers.push({ x: 3100, y: 188, w: 54, h: 6, k: 'oneway', mover: true, ax: 3096, bx: 3206, t: 0, dx: 0 });
O(2606, 142, 8); O(2946, 118, 9); O(3409, 118, 10); O(3628, 138, 11);
arc(2470, 196, 2528, 200, 3, 30); arc(2800, 200, 2860, 188, 3, 28); arc(3110, 170, 3230, 170, 5, 10); arc(3475, 200, 3528, 200, 3, 28);
bug(2550, 2780, 210); ghost(2980, 120); bug(3545, 3700, 210); ghost(3460, 120); bug(3270, 3330, 210);
stations.push({ id: 'vayu', x: 3830, y: 210, visited: false, name: 'VayuNetra' });
// Zone 4: Dawn
G(3970, 5300, 210);
const ACH = [
  ['Punjab & Sind Bank Hackathon 2026', 'Winner. FINIX: a wealth app with hybrid post-quantum encryption and AI fraud checks.'],
  ['Amazon ML Challenge 2026', 'Rank 249 of about 90K teams. 98.5 F0.5 on business entity matching.'],
  ['Panjika for ISRO (SIH 2026)', 'Lunar image registration across sun angles: 1.10 px median error, 73% convergence.'],
  ['ChotiVaani', 'Wake-word model on an ESP32: INT8, under 200 KB of memory, under 7% CPU at idle.'],
  ['NVIDIA certification', 'Fundamentals of Deep Learning, October 2025.'],
];
ACH.forEach((a, i) => chests.push({ x: 4060 + i * 128, y: 210, open: false, a, fl: 0 }));
arc(4000, 196, 4600, 196, 14, 0);
const GATE = { x: 4790, y: 210 };
solids.push(...movers);

/* ================= GAME STATE ================= */
const cv = $('#cv'), ctx = cv.getContext('2d');
let VW = 480, R = 2;
const P1 = { x: 70, y: -40, vx: 0, vy: 0, w: 10, h: 28, face: 1, ground: null, coyote: 0, buf: 0, jumps: 0, dash: 0, dashCd: 0, atk: 0, atkN: 0, atkHit: new Set(), inv: 0, sx: 1, sy: 1, anim: 0, safe: { x: 70, y: 214 }, wasGround: false, trail: 0 };
const S = { mode: 'idle', started: false, t: 0, hit: 0, shake: 0, camX: 0, camY: 0, tokens: 0, bugs: 0, skills: 0, projects: 0, startT: 0, endT: 0, streak: 0, streakT: 0, zone: null, moved: false, visible: false, introPlayed: false };
const parts = [], texts = [], ghosts = [], slashes = [];
const keys = {}, pressed = {};
const KEYMAP = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', Space: 'jump', ArrowUp: 'jump', KeyW: 'jump', KeyK: 'jump', ShiftLeft: 'dash', ShiftRight: 'dash', KeyL: 'dash', KeyC: 'dash', KeyZ: 'attack', KeyJ: 'attack', KeyX: 'attack', KeyE: 'talk', ArrowDown: 'talk', KeyS: 'talk', Escape: 'pause', KeyP: 'pause', Enter: 'enter', KeyM: 'music', KeyV: 'voice' };

function resize() {
  const r = $('#game').getBoundingClientRect(); const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const aspect = r.width / r.height;
  VW = Math.round(clamp(LH * aspect, 300, 600));
  let dispW = r.width, dispH = dispW * LH / VW;
  if (dispH > r.height) { dispH = r.height; dispW = dispH * VW / LH; }
  R = clamp(Math.round(dispH * dpr / LH), 1, 3);
  cv.width = VW * R; cv.height = LH * R; cv.style.width = dispW + 'px'; cv.style.height = dispH + 'px';
  ctx.imageSmoothingEnabled = false;
  lightC.width = VW; lightC.height = LH; buildVignette();
}
const [lightC, lx] = mk(480, LH);

/* ================= LAYER ART (pre-rendered) ================= */
const TILE = 640;
const LAYERS = {};
function rectFill(x, c, X, Y, W, H) { x.fillStyle = c; x.fillRect(Math.round(X), Math.round(Y), Math.round(W), Math.round(H)); }
function shade(c, k) { return mix(c, '#1e1633', k); }
function buildLayers() {
  const R0 = mulberry(7);
  const far = {}, mid = {};
  // ---- Delhi far: day haze skyline
  { const [c, x] = mk(TILE, LH); const col = '#8cc6ee', col2 = '#a6d6f4', lit = '#c6e8fb';
    for (let i = 0; i < 34; i++) { const w = 10 + R0() * 22, h = 6 + R0() * 26, X = R0() * TILE; rectFill(x, col2, X, 206 - h, w, h + 70); for (let k = 0; k < 3; k++) rectFill(x, lit, X + 2 + k * 5, 206 - h + 4, 2, 2); }
    rectFill(x, col, 100, 160, 34, 50); rectFill(x, col, 97, 156, 40, 4); rectFill(x, col, 105, 148, 24, 8); rectFill(x, col, 111, 143, 12, 5);
    x.clearRect(110, 178, 14, 32); x.fillStyle = col; x.beginPath(); x.arc(117, 178, 7, Math.PI, 0); x.fill(); x.clearRect(110, 178, 14, 32);
    rectFill(x, col2, 110, 186, 14, 24);
    for (let y = 0; y < 78; y++) { const w = lerp(11, 5, y / 78); rectFill(x, (y % 16 < 1) ? lit : col, 420 - w / 2, 208 - y, w, 1); }
    rectFill(x, col, 417, 126, 6, 4);
    rectFill(x, col, 240, 180, 54, 30); x.fillStyle = col; x.beginPath(); x.arc(267, 180, 15, Math.PI, 0); x.fill(); rectFill(x, col, 266, 160, 2, 6);
    for (const dx of [246, 284]) { x.beginPath(); x.arc(dx + 2, 180, 5, Math.PI, 0); x.fill(); }
    for (let i = 0; i < 4; i++) rectFill(x, lit, 248 + i * 11, 192, 5, 9);
    x.fillStyle = col; for (let i = -3; i <= 3; i++) { x.beginPath(); x.ellipse(520 + i * 7, 196, 5, 14, i * 0.28, 0, 7); x.fill(); } rectFill(x, col, 494, 196, 52, 14);
    rectFill(x, col, 590, 140, 2, 70); for (let i = 0; i < 4; i++) rectFill(x, col, 587, 150 + i * 12, 8, 1);
    rectFill(x, col, 0, 206, TILE, 64);
    far.delhi = c; }
  // ---- Delhi mid: colourful rooftops
  { const [c, x] = mk(TILE, LH); const walls = ['#ffb38a', '#ffd27a', '#8fe0c0', '#f7a1b5', '#b9a6ff', '#7fd0ff', '#ffe9a8'];
    let X = 0; while (X < TILE) { const w = 40 + R0() * 56, h = 34 + R0() * 50, top = 238 - h, col = walls[Math.floor(R0() * walls.length)];
      rectFill(x, shade(col, 0.55), X - 1, top - 1, w + 2, LH); rectFill(x, col, X, top, w, LH); rectFill(x, shade(col, 0.18), X + w - 6, top, 6, LH); rectFill(x, mix(col, '#ffffff', 0.4), X, top, w, 2); rectFill(x, shade(col, 0.3), X, top + 2, w, 1);
      for (let wy = top + 9; wy < 228; wy += 13) for (let wx = X + 6; wx < X + w - 12; wx += 11) if (R0() < 0.55) { rectFill(x, '#3d5bd6', wx, wy, 6, 7); rectFill(x, '#9fc0ff', wx, wy, 2, 3); rectFill(x, shade(col, 0.3), wx - 1, wy + 7, 8, 1); }
      if (R0() < 0.85) { const tx = X + 6 + R0() * (w - 24); rectFill(x, '#1e1633', tx - 1, top - 16, 15, 16); rectFill(x, '#2a2f4a', tx, top - 15, 13, 15); rectFill(x, '#2a2f4a', tx + 2, top - 17, 9, 2); rectFill(x, '#5a6a9a', tx + 2, top - 13, 2, 11); rectFill(x, '#3d4466', tx, top - 10, 13, 1); rectFill(x, '#3d4466', tx, top - 5, 13, 1); }
      if (R0() < 0.4) { const dx = X + w - 14; x.fillStyle = '#f4f4ff'; x.beginPath(); x.ellipse(dx, top - 6, 6, 4, -0.5, 0, 7); x.fill(); rectFill(x, '#9aa0c0', dx - 1, top - 4, 2, 4); }
      if (R0() < 0.45) { const lx0 = X + 4, ly = top - 9; x.strokeStyle = '#1e1633'; x.lineWidth = 0.6; x.beginPath(); x.moveTo(lx0, ly); x.quadraticCurveTo(lx0 + w / 2, ly + 6, lx0 + w - 8, ly); x.stroke(); for (let k = 0; k < 4; k++) rectFill(x, ['#ff5e7a', '#ffd23d', '#2fd6b0', '#ffffff'][k], lx0 + 7 + k * (w / 6), ly + 3, 4, 6); }
      X += w + 3 + R0() * 8; }
    mid.delhi = c; }
  // ---- Archive far: bookshelf towers at sunset
  { const [c, x] = mk(TILE, LH); const col = '#b07fd8';
    for (let i = 0; i < 9; i++) { const X = i * 72 + R0() * 10, h = 90 + R0() * 80, w = 54; rectFill(x, shade(col, 0.2), X - 1, 219 - h, w + 2, h + 52); rectFill(x, col, X, 220 - h, w, h + 50);
      for (let sy = 220 - h + 8; sy < 220; sy += 14) { rectFill(x, shade(col, 0.25), X + 3, sy + 10, w - 6, 2); let bx = X + 4; while (bx < X + w - 6) { const bw = 2 + Math.floor(R0() * 3); if (R0() < 0.75) rectFill(x, ['#ffd27a', '#ff9cb8', '#8fe0c0', '#7fd0ff', '#fff1d0'][Math.floor(R0() * 5)], bx, sy + 10 - (6 + R0() * 3), bw, 9); bx += bw + 1; } } }
    rectFill(x, col, 0, 212, TILE, 60); far.arc = c; }
  { const [c, x] = mk(TILE, LH);
    for (let i = 0; i < 6; i++) { const X = 40 + i * 100 + R0() * 40, Y = 40 + R0() * 70, w = 16 + R0() * 10, h = w * 1.3; x.save(); x.translate(X, Y); x.rotate((R0() - 0.5) * 0.5); x.fillStyle = '#1e1633'; x.fillRect(-w / 2 - 1, -h / 2 - 1, w + 2, h + 2); x.fillStyle = '#fffaf0'; x.fillRect(-w / 2, -h / 2, w, h); x.fillStyle = '#c9b8e8'; for (let l = 0; l < 5; l++) x.fillRect(-w / 2 + 3, -h / 2 + 4 + l * 4, w - 6 - (l === 4 ? 6 : 0), 1); x.fillStyle = '#ff5e7a'; x.fillRect(-w / 2 + 3, -h / 2 + 2, 6, 1); x.restore(); }
    x.font = '8px "Pixelify Sans", monospace'; x.fillStyle = 'rgba(255,255,255,.75)';
    ['softmax(QKᵀ/√d)V', '∇·E = ρ/ε₀', 'ELBO = E[log p(x|z)] − KL', '∫ f(x) dx', 'σ(Wx + b)', 'p(z|x) ∝ p(x|z)p(z)', 'L = −Σ y log ŷ'].forEach((s, i) => x.fillText(s, 20 + (i * 97) % (TILE - 120), 30 + (i * 37) % 120));
    let X = 0; while (X < TILE) { const n = 3 + Math.floor(R0() * 6), w = 26 + R0() * 18; let y = 238; for (let k = 0; k < n; k++) { const bw = Math.round(w - R0() * 6), bx = Math.round(X + (w - bw) / 2), col = ['#ff5e7a', '#ffd23d', '#2fd6b0', '#7fd0ff', '#b9a6ff'][Math.floor(R0() * 5)]; rectFill(x, '#1e1633', bx - 1, y - 7, bw + 2, 8); rectFill(x, col, bx, y - 6, bw, 6); rectFill(x, '#fff6e0', bx + 2, y - 5, bw - 4, 1); y -= 7; } X += w + 10 + R0() * 40; }
    mid.arc = c; }
  // ---- Landfill far: night hills + city lights
  { const [c, x] = mk(TILE, LH); const col = '#283886';
    x.fillStyle = col; x.beginPath(); x.moveTo(0, 200); for (let X = 0; X <= TILE; X += 8) x.lineTo(X, 196 - Math.sin(X / 90) * 10 - Math.sin(X / 33) * 3); x.lineTo(TILE, LH); x.lineTo(0, LH); x.fill();
    for (let i = 0; i < 40; i++) { const X = R0() * TILE, w = 8 + R0() * 16, h = 8 + R0() * 26; rectFill(x, '#31439a', X, 200 - h, w, h); for (let k = 0; k < 3; k++) if (R0() < 0.65) rectFill(x, '#ffd36b', X + 2 + R0() * (w - 4), 200 - h + 3 + R0() * (h - 6), 1, 1); }
    for (let i = 0; i < 5; i++) { const X = 40 + i * 130; x.strokeStyle = '#4a5cb8'; x.lineWidth = 1; x.beginPath(); x.moveTo(X, 200); x.lineTo(X + 6, 120); x.lineTo(X + 12, 200); x.moveTo(X + 1, 160); x.lineTo(X + 11, 160); x.moveTo(X + 3, 135); x.lineTo(X + 9, 135); x.stroke(); rectFill(x, '#ff5e7a', X + 5, 118, 2, 2); if (i < 4) { x.beginPath(); x.moveTo(X + 6, 122); x.quadraticCurveTo(X + 71, 140, X + 136, 122); x.stroke(); } }
    far.vayu = c; }
  { const [c, x] = mk(TILE, LH);
    const mounds = [[150, 120, 70], [480, 150, 60]];
    for (const [mx, mw, mh] of mounds) { x.fillStyle = '#1e1633'; x.beginPath(); x.moveTo(mx - mw, 241); for (let k = 0; k <= 30; k++) { const t = k / 30; x.lineTo(mx - mw + t * mw * 2, 239 - Math.sin(t * Math.PI) * mh); } x.lineTo(mx + mw, LH); x.lineTo(mx - mw, LH); x.fill();
      x.fillStyle = '#3e43a0'; x.beginPath(); x.moveTo(mx - mw + 1, 241); for (let k = 0; k <= 30; k++) { const t = k / 30; x.lineTo(mx - mw + t * mw * 2, 240 - Math.sin(t * Math.PI) * mh + 1 - (R0() - 0.5) * 4); } x.lineTo(mx + mw, LH); x.lineTo(mx - mw, LH); x.fill();
      for (let k = 0; k < 160; k++) { const t = R0(), X = mx - mw + t * mw * 2, top = 240 - Math.sin(t * Math.PI) * mh; rectFill(x, ['#5fa0ff', '#ff6b8a', '#fff1d0', '#5fe08a', '#ffd23d', '#8f7fff'][Math.floor(R0() * 6)], X, top + 3 + R0() * (240 - top), 1 + Math.floor(R0() * 2), 1); } }
    rectFill(x, '#1e1633', 299, 205, 36, 22); rectFill(x, '#ffb347', 300, 214, 34, 11); rectFill(x, '#ffb347', 312, 206, 14, 9); rectFill(x, '#7fd0ff', 315, 208, 8, 4); x.fillStyle = '#1e1633'; x.beginPath(); x.arc(306, 228, 5, 0, 7); x.arc(326, 228, 5, 0, 7); x.fill(); x.strokeStyle = '#ffb347'; x.lineWidth = 2; x.beginPath(); x.moveTo(300, 216); x.lineTo(288, 222); x.lineTo(286, 230); x.stroke();
    rectFill(x, '#2c3482', 0, 236, TILE, 40);
    mid.vayu = c; mid.vayuPlumes = mounds.map(m => ({ x: m[0], top: 240 - m[2] })); }
  // ---- Dawn far: morning hills
  { const [c, x] = mk(TILE, LH);
    for (const [base, amp, col, f, rim] of [[168, 18, '#9a8ae0', 140, '#ffc2b4'], [190, 14, '#7a7fd8', 90, '#ffb3c8']]) { x.fillStyle = col; x.beginPath(); x.moveTo(0, LH); const pts = []; for (let X = 0; X <= TILE; X += 4) { const y = base - Math.sin(X / f) * amp - Math.sin(X / (f / 3)) * amp / 4; pts.push([X, y]); x.lineTo(X, y); } x.lineTo(TILE, LH); x.fill(); for (const [X, y] of pts) rectFill(x, rim, X, y, 4, 1); }
    far.dawn = c; }
  { const [c, x] = mk(TILE, LH);
    x.fillStyle = '#1e1633'; x.beginPath(); x.moveTo(0, LH); for (let X = 0; X <= TILE; X += 4) x.lineTo(X, 221 - Math.sin(X / 70) * 6); x.lineTo(TILE, LH); x.fill();
    x.fillStyle = '#4fbf6a'; x.beginPath(); x.moveTo(0, LH); for (let X = 0; X <= TILE; X += 4) x.lineTo(X, 222 - Math.sin(X / 70) * 6); x.lineTo(TILE, LH); x.fill();
    for (let X = 0; X <= TILE; X += 4) rectFill(x, '#8fe07a', X, 223 - Math.sin(X / 70) * 6, 4, 2);
    for (let i = 0; i < 9; i++) { const X = 30 + i * 70 + R0() * 20, h = 22 + R0() * 22, base = 222 - Math.sin(X / 70) * 6; rectFill(x, '#1e1633', X - 2, base - h, 5, h); rectFill(x, '#8a5530', X - 1, base - h, 3, h);
      const blobs = Array.from({ length: 5 }, () => [X + (R0() - 0.5) * 18, base - h - R0() * 12, 8 + R0() * 6]);
      x.fillStyle = '#1e1633'; for (const [bx, by, br] of blobs) { x.beginPath(); x.arc(bx, by, br + 1, 0, 7); x.fill(); }
      x.fillStyle = '#2f9a5a'; for (const [bx, by, br] of blobs) { x.beginPath(); x.arc(bx, by, br, 0, 7); x.fill(); }
      x.fillStyle = '#5fd36b'; for (const [bx, by, br] of blobs) { x.beginPath(); x.arc(bx - 2, by - 2, br * 0.6, 0, 7); x.fill(); } }
    for (let i = 0; i < 70; i++) rectFill(x, ['#ffd23d', '#ff5e7a', '#ffffff', '#b9a6ff'][i % 4], R0() * TILE, 228 + R0() * 30, 2, 2);
    mid.dawn = c; }
  { const [c, x] = mk(TILE, LH); x.fillStyle = '#1e1633';
    for (let i = 0; i < 16; i++) { const X = R0() * TILE; if (R0() < 0.6) { for (let k = 0; k < 6; k++) x.fillRect(X + k * 2, LH - 4 - R0() * 12, 1, 20); } else { x.beginPath(); x.ellipse(X, LH, 10 + R0() * 12, 5 + R0() * 5, 0, Math.PI, 0); x.fill(); } }
    LAYERS.fg = c; }
  LAYERS.far = far; LAYERS.mid = mid;
  for (const s of solids) if (!s.mover) s.tex = groundTex(s);
}
function groundTex(s) {
  const z = zoneAt(s.x + s.w / 2).id, R1 = mulberry(Math.floor(s.x) + 3);
  const w = Math.ceil(s.w), h = Math.min(Math.ceil(s.h), 120);
  const [c, x] = mk(w, h);
  if (s.k === 'oneway') {
    const look = { delhi: ['#c98a4a', '#ffd08a', '#8a5530'], arc: ['#fff6e0', '#ffffff', '#ff5e7a'], vayu: ['#7d86c8', '#c8d0ff', '#4b5296'], dawn: ['#9a6a3a', '#8fe07a', '#6a4426'] }[z];
    rectFill(x, '#1e1633', 0, 0, w, h); rectFill(x, look[0], 1, 1, w - 2, h - 2); rectFill(x, look[1], 1, 1, w - 2, 2); rectFill(x, look[2], 1, h - 2, w - 2, 1);
    if (z === 'delhi') for (let i = 6; i < w - 2; i += 10) { rectFill(x, look[2], i, 3, 1, h - 4); rectFill(x, '#ffe6b0', i - 3, 4, 1, 1); }
    if (z === 'arc') for (let i = 4; i < w - 4; i += 5) rectFill(x, '#c9b8e8', i, 3, 3, 1);
    if (z === 'vayu') for (let i = 4; i < w - 2; i += 8) rectFill(x, '#e8ecff', i, 3, 1, 1);
    return c;
  }
  if (s.k === 'block') {
    rectFill(x, '#1e1633', 0, 0, w, h);
    if (s.look === 'tank') { rectFill(x, '#2a2f4a', 1, 2, w - 2, h - 2); rectFill(x, '#2a2f4a', 3, 1, w - 6, 2); for (let y = 6; y < h; y += 5) rectFill(x, '#3d4466', 1, y, w - 2, 1); rectFill(x, '#6a78b0', 3, 3, 2, h - 5); rectFill(x, '#ffb38a', w - 2, 3, 1, h - 5); }
    else if (s.look === 'books') { let y = h - 1; let k = 0; while (y > 1) { const bh = 5 + Math.floor(R1() * 3), inset = 1 + Math.floor(R1() * 3); rectFill(x, ['#ff5e7a', '#7fd0ff', '#ffd23d', '#2fd6b0', '#b9a6ff'][k++ % 5], inset, y - bh, w - inset * 2, bh - 1); rectFill(x, '#fff6e0', inset + 2, y - bh + 1, w - inset * 2 - 4, 1); y -= bh; } }
    else { rectFill(x, '#8a7aa8', 1, 1, w - 2, h - 2); for (let i = 0; i < 40; i++) rectFill(x, ['#5fa0ff', '#ff6b8a', '#fff1d0', '#5fe08a', '#ffd23d'][i % 5], 1 + R1() * (w - 3), 1 + R1() * (h - 3), 2, 1); rectFill(x, '#4b3f6a', 1, Math.floor(h / 3), w - 2, 1); rectFill(x, '#4b3f6a', 1, Math.floor(2 * h / 3), w - 2, 1); rectFill(x, '#b8a8d8', 1, 1, w - 2, 1); }
    return c;
  }
  const L = { delhi: { body: '#d0643f', top: '#ffd08a', top2: '#ff9a5a', line: '#a9472c' }, arc: { body: '#6a4bb0', top: '#ffffff', top2: '#fff6e0', line: '#5a3c9a' }, vayu: { body: '#343a7a', top: '#a4aee8', top2: '#5c64a8', line: '#2a2f66' }, dawn: { body: '#b06a3e', top: '#c2ff8a', top2: '#7ee06a', line: '#8a4f30' } }[z];
  rectFill(x, L.body, 0, 0, w, h);
  if (z === 'delhi') { for (let y = 8; y < h; y += 6) { rectFill(x, L.line, 0, y, w, 1); for (let X = ((y / 6) % 2) * 6; X < w; X += 12) rectFill(x, L.line, X, y, 1, 6); } rectFill(x, L.top2, 0, 0, w, 6); rectFill(x, L.top, 0, 0, w, 2); rectFill(x, '#a9472c', 0, 6, w, 1); }
  else if (z === 'arc') { let X = 0; while (X < w) { const bw = 3 + Math.floor(R1() * 4); rectFill(x, ['#ff5e7a', '#ffd23d', '#2fd6b0', '#7fd0ff', '#b9a6ff'][Math.floor(R1() * 5)], X, 2, bw - 1, 7); rectFill(x, 'rgba(255,255,255,.5)', X, 3, 1, 5); X += bw; } rectFill(x, L.top, 0, 0, w, 2); rectFill(x, '#1e1633', 0, 9, w, 1); for (let y = 16; y < h; y += 10) for (let X2 = 0; X2 < w; X2 += 20) rectFill(x, L.line, X2 + (y % 20), y, 14, 2); }
  else if (z === 'vayu') { rectFill(x, L.top2, 0, 0, w, 6); rectFill(x, L.top, 0, 0, w, 2); rectFill(x, '#1e1633', 0, 6, w, 1); for (let i = 0; i < w * h / 160; i++) rectFill(x, ['#5fa0ff', '#ff6b8a', '#fff1d0', '#5fe08a', '#ffd23d', '#4b5296'][Math.floor(R1() * 6)], R1() * w, 8 + R1() * h, 2, 1); }
  else { rectFill(x, L.top2, 0, 0, w, 6); rectFill(x, L.top, 0, 0, w, 2); rectFill(x, '#3faa4a', 0, 6, w, 2); for (let X = 0; X < w; X += 3) if (R1() < 0.5) rectFill(x, L.top2, X, 8, 1, 1 + R1() * 3); for (let i = 0; i < w * h / 70; i++) rectFill(x, R1() < 0.5 ? '#8a4f30' : '#d08a5a', R1() * w, 12 + R1() * h, 3, 2); }
  return c;
}

/* ================= PARTICLES / FX ================= */
function burst(x, y, n, cols, sp = 80, life = 0.5, grav = 300, size = 2) { if (RM) n = Math.ceil(n / 3); for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = sp * (0.3 + Math.random()); parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - sp * 0.3, life, max: life, c: cols[i % cols.length], s: size, g: grav }); } }
function dust(x, y, dir, n = 5) { for (let i = 0; i < n; i++) parts.push({ x: x + rnd(-4, 4), y: y - 1, vx: -dir * rnd(10, 50) + rnd(-15, 15), vy: rnd(-30, -5), life: 0.35, max: 0.35, c: 'rgba(230,220,240,.75)', s: rnd(1, 3), g: 60 }); }
function ftext(x, y, s, c = '#fbf3df') { texts.push({ x, y, s, c, life: 1, max: 1 }); }
function shake(v) { if (!RM) S.shake = Math.max(S.shake, v); }

/* ================= UI ================= */
const toastsEl = $('#toasts');
function toast(html, cls = '', ms = 2200) { const d = document.createElement('div'); d.className = 'toast ' + cls; d.innerHTML = html; toastsEl.appendChild(d); while (toastsEl.children.length > 3) toastsEl.firstChild.remove(); setTimeout(() => { d.classList.add('out'); setTimeout(() => d.remove(), 320); }, ms); }
const HL = { v: '', k: -1 };
function hud() {
  const v = `${S.skills}|${S.projects}|${S.tokens}|${S.bugs}`;
  if (v !== HL.v) { HL.v = v; $('#cSk').textContent = `${S.skills}/12`; $('#cPr').textContent = `${S.projects}/2`; $('#cTk').textContent = S.tokens; $('#cBg').textContent = S.bugs; }
  const k = clamp(P1.x / GATE.x, 0, 1); if (Math.abs(k - HL.k) > 0.0015) { HL.k = k; $('#trFill').style.width = k * 100 + '%'; $('#trMe').style.left = k * 100 + '%'; }
}
(function track() {
  const tr = $('#track');
  [['ArcVisual', stations[0].x, 'mk-arc'], ['VayuNetra', stations[1].x, 'mk-vayu'], ['Hire', GATE.x, 'mk-gate']].forEach(([n, x, id]) => { const m = document.createElement('div'); m.className = 'mk'; m.id = id; m.style.left = (x / GATE.x * 100) + '%'; m.innerHTML = `<span>${n}</span>`; tr.appendChild(m); });
  $('#hudFace').src = PORTRAIT;
})();
let zoneCardT = 0;
function showZone(z) { $('#zoneNum').textContent = z.num; $('#zoneName').textContent = z.name; const el = $('#zoneCard'); el.classList.add('show'); clearTimeout(zoneCardT); zoneCardT = setTimeout(() => el.classList.remove('show'), 2200); }

/* ---------- narration panels ---------- */
const NARR = {
  arc: {
    title: 'ArcVisual', where: 'STATION 1 OF 2 · THE PAPER ARCHIVE', tag: 'See the idea behind any paper. Animated, grounded explainers for arXiv papers.', url: 'https://arcvisual.vercel.app', cta: 'Open ArcVisual ↗',
    secs: [
      { tab: 'Overview', clip: 'arc_overview', cap: "This is ArcVisual. Paste any arXiv link, and it reads the paper's LaTeX source, finds the ideas that are hardest to understand, and turns them into animated explainers right beside the original text.",
        html: `<p>Research papers hide their best ideas behind dense notation. ArcVisual takes an arXiv link and returns an interactive article where the hard parts are carried by Manim animations you can play, pause and scrub.</p>
        <div class="flow"><span>arXiv link</span><em>→</em><span>LaTeX source</span><em>→</em><span>hard ideas ranked</span><em>→</em><span>animations + text</span></div>` },
      { tab: 'Impact matrix', clip: 'arc_impact', cap: "Under the hood it's a four-stage pipeline: ingest, analyze, generate, validate. Every animation passes three gates (a security lint, a draft render, a layout check) before anyone sees it. Up to seven visuals per paper, and every claim cites back to the source.",
        html: `<div class="matrix">
          <div class="cell"><b>4</b><span>pipeline stages: ingest → analyze → generate → validate, sharing one storyboard</span></div>
          <div class="cell"><b>3</b><span>validation gates: security lint, draft render, spatial layout check</span></div>
          <div class="cell"><b>≤7</b><span>animated visuals per paper</span></div>
          <div class="cell"><b>100%</b><span>of claims cite back to the source paper</span></div>
          <div class="cell"><b>3</b><span>visual kinds: derivations, results, systems</span></div>
          <div class="cell"><b>5</b><span>fields: CS, math, physics, statistics, biology</span></div></div>` },
      { tab: 'Usefulness', clip: 'arc_use', cap: "It's built for students, researchers and teachers who have ever stared at an equation and given up. It's live and free during beta. Hit the link and try a paper.",
        html: `<ul class="use">
          <li><strong>Students:</strong> watch a derivation unfold step by step instead of decoding notation alone.</li>
          <li><strong>Researchers:</strong> get the core idea of a new paper before committing to a full read.</li>
          <li><strong>Teachers:</strong> share a public explainer link with a class; explainers persist once created.</li></ul>
          <div class="stack"><span>Python</span><span>Manim CE</span><span>FastAPI</span><span>Next.js</span><span>SQLite / PostgreSQL</span><span>Alembic</span></div>` },
    ]
  },
  vayu: {
    title: 'VayuNetra', where: 'STATION 2 OF 2 · LANDFILL FRONTIER', tag: 'Methane is invisible. VayuNetra makes it visible.', url: 'https://vayunetra-india.vercel.app', cta: 'Open VayuNetra ↗',
    secs: [
      { tab: 'Overview', clip: 'vayu_overview', cap: 'This is VayuNetra. Methane is invisible, so I built a satellite AI that makes it visible. It scans free Sentinel-2 images over Indian landfills, detects methane plumes, and estimates how much is leaking.',
        html: `<p>An end-to-end satellite AI pipeline that detects, verifies and quantifies methane plumes from Indian landfills using free Sentinel-2 imagery, which arrives about every five days.</p>
        <div class="flow"><span>Sentinel-2 pass</span><em>→</em><span>U-Net detects plume</span><em>→</em><span>spectral + wind check</span><em>→</em><span>emission rate</span><em>→</em><span>action dossier</span></div>` },
      { tab: 'Impact matrix', clip: 'vayu_impact', cap: 'I fine-tuned a U-Net with a satellite-pretrained ResNet-50 encoder on 3,552 real plumes. It reaches 0.76 ROC AUC against 0.51 for the classic baseline: 2.3× the recall and 4× better pixel IoU. Across 674 scenes from five landfills, it raised zero false alarms on 334 control scenes.',
        html: `<div class="matrix">
          <div class="cell wide"><b>0.76</b><span>ROC AUC on held-out sites</span><div class="vs"><div><span>VayuNetra</span><i style="width:76%"></i><span>0.76</span></div><div class="base"><span>Classic MBMP</span><i style="width:51%"></i><span>0.51</span></div></div></div>
          <div class="cell"><b>0/334</b><span>false alarms on control scenes (p &lt; 0.001)</span></div>
          <div class="cell"><b>2.3×</b><span>recall at a 10% false-alarm rate</span></div>
          <div class="cell"><b>4×</b><span>better pixel IoU than the baseline</span></div>
          <div class="cell"><b>674</b><span>clear scenes, 5 landfills, 2 years in the field</span></div>
          <div class="cell wide"><b>3,552</b><span>real plumes for fine-tuning, plus synthetic plume injection, trained on an A100</span></div></div>` },
      { tab: 'Usefulness', clip: 'vayu_use', cap: "Every detection becomes an action dossier for municipal bodies and pollution control boards: where the leak is, how big it is, and what to do next. It's deployed and live.",
        html: `<ul class="use">
          <li><strong>Municipal corporations:</strong> know which landfill is leaking and roughly how much, in kg/h with an uncertainty range.</li>
          <li><strong>Pollution control boards:</strong> evidence-backed dossiers with remediation steps, ready for Tier 2 drone or hyperspectral confirmation.</li>
          <li><strong>Climate:</strong> methane has over 80× the warming power of CO₂ across 20 years, so fixing a leak pays off fast.</li></ul>
          <div class="stack"><span>PyTorch</span><span>U-Net + ResNet-50 (SSL4EO-S12)</span><span>Sentinel-2</span><span>Google Earth Engine</span><span>ERA5-Land wind</span><span>Next.js</span><span>Vercel</span></div>` },
    ]
  }
};
let panel = null;
function openPanel(id) {
  const N = NARR[id]; S.mode = 'panel'; AE.sfx('station'); keysClear();
  const host = $('#panelHost');
  host.innerHTML = `<div class="panel px" role="dialog" aria-label="${N.title}">
    <div class="face"><img src="${PORTRAIT}" alt="Pixel portrait of Jiyad"><div><div class="wave" id="wave">${'<i></i>'.repeat(9)}</div><div class="lbl">JIYAD<br>NARRATING</div></div></div>
    <div><div class="p-head"><h2>${N.title}</h2><span class="where">${N.where}</span></div>
    <p class="tagline">${N.tag}</p>
    <div class="tabs" role="tablist">${N.secs.map((s, i) => `<button class="tab" role="tab" data-i="${i}" aria-selected="false">${s.tab}<span class="bar"></span></button>`).join('')}</div>
    <div class="sec" id="sec"></div>
    <div class="caption" id="cap"></div>
    <div class="p-actions"><a class="pbtn gold" href="${N.url}" target="_blank" rel="noopener">${N.cta.toUpperCase()}</a><button class="pbtn small" id="pReplay">REPLAY VOICE</button><button class="pbtn small rose" id="pGo">CONTINUE ▶</button><span class="hint">← → SECTIONS · ENTER CONTINUE</span></div></div></div>`;
  panel = { id, N, i: -1, token: 0 };
  host.querySelectorAll('.tab').forEach(b => b.onclick = () => playSec(+b.dataset.i, false));
  $('#pReplay').onclick = () => playSec(panel.i, false);
  $('#pGo').onclick = closePanel;
  playSec(0, true);
}
async function playSec(i, chain) {
  if (!panel) return; const N = panel.N; i = clamp(i, 0, N.secs.length - 1); panel.i = i; const tk = ++panel.token; const sec = N.secs[i];
  document.querySelectorAll('.tab').forEach((b, k) => { b.setAttribute('aria-selected', k === i); b.querySelector('.bar').style.width = k < i ? '100%' : '0'; });
  $('#sec').innerHTML = sec.html; const cap = $('#cap'); cap.textContent = '';
  const v = await AE.playVoice(sec.clip);
  if (!panel || tk !== panel.token) return;
  const dur = v ? v.dur : Math.max(5, sec.cap.length / 15);
  const t0 = performance.now(); const bar = document.querySelectorAll('.tab .bar')[i];
  const step = () => {
    if (!panel || tk !== panel.token) return;
    const k = clamp((performance.now() - t0) / 1000 / dur, 0, 1);
    cap.textContent = sec.cap.slice(0, Math.ceil(sec.cap.length * Math.min(1, k * 1.08)));
    bar.style.width = k * 100 + '%';
    const lv = AE.level(); document.querySelectorAll('#wave i').forEach((e, j) => e.style.height = (3 + (v ? Math.min(19, lv * 90 * (0.5 + Math.abs(Math.sin(performance.now() / 90 + j * 1.7)))) : 0)) + 'px');
    if (k < 1) requestAnimationFrame(step);
    else if (i < N.secs.length - 1 && (chain || true)) setTimeout(() => { if (panel && tk === panel.token) playSec(i + 1, true); }, 700);
    else $('#pGo').classList.add('gold'); $('#pGo').classList.remove('rose');
  };
  requestAnimationFrame(step);
}
function closePanel() {
  if (!panel) return; const st = stations.find(s => s.id === panel.id);
  AE.stopVoice(); panel = null; $('#panelHost').innerHTML = ''; S.mode = 'play'; keysClear();
  if (!st.visited) { st.visited = true; S.projects++; $('#mk-' + st.id).classList.add('done'); toast(`PROJECT LOGGED ${S.projects}/2`); AE.sfx('orb'); burst(st.x, st.y - 40, 30, ['#8fe6f5', '#f0a33a', '#fbf3df'], 120, 0.9); }
  hud();
}

/* ---------- overlays ---------- */
function fmtT(s) { const m = Math.floor(s / 60), r = Math.floor(s % 60); return `${m}:${String(r).padStart(2, '0')}`; }
function showPause() {
  if (S.mode !== 'play') return; S.mode = 'pause'; AE.sfx('ui');
  $('#overlayHost').innerHTML = `<div class="overlay"><div class="card2 px" role="dialog" aria-label="Paused"><span class="k">PAUSED</span><h2>Controls</h2>
  <div class="keys"><kbd>← → / A D</kbd><span>Run</span><kbd>SPACE / ↑</kbd><span>Jump, press again in the air to double jump</span><kbd>SHIFT</kbd><span>Dash (works in the air too)</span><kbd>Z / J</kbd><span>Attack: hit bugs and open chests, chain three for a combo</span><kbd>E / ↓</kbd><span>Talk at a project station</span><kbd>M / V</kbd><span>Music / voice on or off</span></div>
  <div class="row"><button class="pbtn gold" id="oResume">RESUME</button><button class="pbtn" id="oRestart">RESTART RUN</button><a class="pbtn" href="#inventory" id="oQuick">QUICK VIEW</a></div></div></div>`;
  $('#oResume').onclick = resume; $('#oRestart').onclick = () => { resume(); restart(); }; $('#oQuick').onclick = resume; $('#oResume').focus();
}
function resume() { $('#overlayHost').innerHTML = ''; if (S.mode === 'pause') S.mode = 'play'; keysClear(); }
function showEnd() {
  S.mode = 'end'; const t = (S.endT - S.startT) / 1000;
  $('#overlayHost').innerHTML = `<div class="overlay"><div class="card2 px" role="dialog" aria-label="Run complete"><span class="k">RUN COMPLETE · ${fmtT(t)}</span><h2>Thanks for playing.</h2>
  <p>I'm looking for remote, paid internships in AI engineering, agentic AI, AI research and backend. If this run made you curious, let's talk.</p>
  <div class="res"><div><b>${S.skills}/12</b><span>SKILLS</span></div><div><b>${S.projects}/2</b><span>PROJECTS</span></div><div><b>${S.tokens}</b><span>TOKENS</span></div><div><b>${S.bugs}</b><span>BUGS FIXED</span></div></div>
  <p class="copyline">Email: <code>talk2hussain@gmail.com</code> <button class="tbtn" id="eCopy">COPY</button></p>
  <div class="row"><a class="pbtn gold small" href="https://github.com/Hussaincodes01" target="_blank" rel="noopener">GITHUB ↗</a><a class="pbtn gold small" href="https://www.linkedin.com/in/jhussain2005" target="_blank" rel="noopener">LINKEDIN ↗</a><a class="pbtn small" href="https://arcvisual.vercel.app" target="_blank" rel="noopener">ARCVISUAL ↗</a><a class="pbtn small" href="https://vayunetra-india.vercel.app" target="_blank" rel="noopener">VAYUNETRA ↗</a></div>
  <div class="row"><button class="pbtn rose small" id="eAgain">PLAY AGAIN</button><a class="pbtn small" href="#inventory" id="eQuick">QUICK VIEW ↓</a></div></div></div>`;
  $('#eCopy').onclick = e => copyMail(e.target); $('#eAgain').onclick = () => { $('#overlayHost').innerHTML = ''; restart(); };
}
function copyMail(btn) { const m = 'talk2hussain@gmail.com'; const done = () => { btn.textContent = 'COPIED'; setTimeout(() => btn.textContent = 'COPY', 1500); }; try { navigator.clipboard.writeText(m).then(done, () => sel()); } catch (e) { sel(); } function sel() { const r = document.createRange(); r.selectNodeContents($('#mail')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = 'SELECTED'; } }
$('#copyMail').onclick = e => copyMail(e.target);

function restart() {
  Object.assign(P1, { x: 70, y: -40, vx: 0, vy: 0, face: 1, ground: null, jumps: 0, dash: 0, dashCd: 0, atk: 0, inv: 0, safe: { x: 70, y: 214 } });
  tokens.forEach(t => t.got = false); orbs.forEach(o => o.got = false); chests.forEach(c => c.open = false); stations.forEach(s => { s.visited = false; s.auto = false; });
  enemies.forEach(e => { e.hp = e.t === 'bug' ? 2 : 1; e.dead = false; if (e.bx) { e.x = e.bx; e.y = e.by; } });
  Object.assign(S, { mode: 'play', tokens: 0, bugs: 0, skills: 0, projects: 0, startT: 0, moved: false, camX: 0, zone: null });
  document.querySelectorAll('.track .mk').forEach(m => m.classList.remove('done'));
  document.querySelectorAll('.skills span').forEach(s => s.classList.remove('got'));
  parts.length = 0; hud();
}

/* ================= INPUT ================= */
function keysClear() { for (const k in keys) keys[k] = false; for (const k in pressed) pressed[k] = false; }
addEventListener('keydown', e => {
  const a = KEYMAP[e.code]; if (!S.visible) return;
  if (a || !e.metaKey) unlockAll();
  if (!a) return;
  if (['left', 'right', 'jump', 'talk', 'dash'].includes(a) || e.code === 'Space') e.preventDefault();
  if (e.repeat) { if (S.mode === 'play' && ['left', 'right'].includes(a)) keys[a] = true; return; }
  if (a === 'music') { toggle('music'); return; } if (a === 'voice') { toggle('voice'); return; }
  if (S.mode === 'panel') { if (a === 'enter' || a === 'pause') { e.preventDefault(); closePanel(); } else if (a === 'left' && panel) playSec(panel.i - 1, false); else if (a === 'right' && panel) playSec(panel.i + 1, false); return; }
  if (S.mode === 'pause') { if (a === 'pause') resume(); return; }
  if (S.mode !== 'play') return;
  if (a === 'pause') { showPause(); return; }
  keys[a] = true; pressed[a] = true;
});
addEventListener('keyup', e => { const a = KEYMAP[e.code]; if (a) keys[a] = false; });
function unlockAll() { const was = !!AE.ctx; AE.unlock(); $('#soundHint').hidden = true; AE.setActive(S.visible && S.mode !== 'idle'); if (!was && AE.ctx && !S.introPlayed && S.mode === 'play') { S.introPlayed = true; setTimeout(() => { if (S.mode === 'play') AE.playVoice('intro'); }, 400); } }
$('#game').addEventListener('pointerdown', () => unlockAll());
function toggle(k) { AE.on[k] = !AE.on[k]; const b = k === 'music' ? $('#bMusic') : $('#bVoice'); b.setAttribute('aria-pressed', AE.on[k]); if (k === 'voice' && !AE.on.voice) AE.stopVoice(); AE.setActive(AE.active); }
$('#bMusic').onclick = () => { unlockAll(); toggle('music'); };
$('#bVoice').onclick = () => { unlockAll(); toggle('voice'); };
$('#bPause').onclick = () => { if (S.mode === 'play') showPause(); else if (S.mode === 'pause') resume(); };
// touch
if (matchMedia('(hover: none) and (pointer: coarse)').matches) {
  $('#touch').hidden = false; $('#help').innerHTML = 'TAP JUMP TWICE TO DOUBLE JUMP' + (innerHeight > innerWidth ? '<br>TURN SIDEWAYS FOR A WIDER VIEW' : '');
  document.querySelectorAll('.tc').forEach(b => {
    const k = b.dataset.k;
    const on = e => { e.preventDefault(); unlockAll(); if (S.mode !== 'play') return; keys[k] = true; pressed[k] = true; b.classList.add('on'); try { b.setPointerCapture(e.pointerId); } catch (_) { } };
    const off = e => { keys[k] = false; b.classList.remove('on'); };
    b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('lostpointercapture', off);
  });
}

/* ================= PHYSICS ================= */
const C = { RUN: 150, ACC: 1500, ACCA: 1050, FRIC: 1900, JV: 335, DJV: 300, G: 1100, GF: 1550, MAXF: 430, DASHV: 345, DASHT: 0.17, DASHCD: 0.42, COY: 0.1, BUF: 0.13 };
const ATK_T = 0.3;
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
function pbox() { return { x: P1.x - P1.w / 2, y: P1.y - P1.h, w: P1.w, h: P1.h }; }

function updatePlayer(dt) {
  const p = P1, inL = keys.left, inR = keys.right, dir = (inR ? 1 : 0) - (inL ? 1 : 0);
  if ((dir || pressed.jump) && !S.moved) { S.moved = true; S.startT = performance.now(); $('#help').style.opacity = .0; }
  p.dashCd -= dt; p.inv -= dt; p.coyote -= dt; p.buf -= dt;
  if (pressed.jump) p.buf = C.BUF;
  if (pressed.dash && p.dashCd <= 0 && p.dash <= 0) { p.dash = C.DASHT; p.dashCd = C.DASHCD; p.vx = (dir || p.face) * C.DASHV; p.face = dir || p.face; p.vy = 0; AE.sfx('dash'); shake(1.5); dust(p.x, p.y, p.face, 6); }
  if (pressed.attack && p.atk <= 0) { p.atk = ATK_T; p.atkN = (p.atkN + 1) % 3; p.atkHit.clear(); AE.sfx('slash', p.atkN); slashes.push({ x: p.x, y: p.y - 13, dir: p.face, life: 0.16, n: p.atkN }); for (let i = 0; i < 3; i++) parts.push({ x: p.x + p.face * 16, y: p.y - 14 + rnd(-6, 6), vx: p.face * rnd(30, 70), vy: rnd(-40, -10), life: 0.5, max: 0.5, c: '#8fe6f5', s: 0, g: 60, glyph: ['{', '}', ';', '<', '/>', '=>'][Math.floor(Math.random() * 6)] }); }
  if (p.dash > 0) {
    p.dash -= dt; p.vy = 0; p.trail -= dt;
    if (p.trail <= 0) { p.trail = 0.025; ghosts.push({ x: p.x, y: p.y, f: 'dash', face: p.face, life: 0.22 }); }
  } else {
    const acc = p.ground ? C.ACC : C.ACCA;
    if (dir) { p.vx += dir * acc * dt; if (Math.abs(p.vx) > C.RUN) p.vx = Math.sign(p.vx) * Math.max(C.RUN, Math.abs(p.vx) - C.FRIC * dt); p.face = dir; }
    else { const f = (p.ground ? C.FRIC : C.FRIC * 0.35) * dt; p.vx = Math.abs(p.vx) <= f ? 0 : p.vx - Math.sign(p.vx) * f; }
    if (p.atk > 0 && p.ground) p.vx *= 0.9;
    p.vy += (p.vy > 0 ? C.GF : C.G) * dt; if (!keys.jump && p.vy < -60) p.vy += 1800 * dt; p.vy = Math.min(p.vy, C.MAXF);
  }
  if (p.buf > 0) {
    if (p.ground || p.coyote > 0) { p.vy = -C.JV; p.ground = null; p.coyote = 0; p.buf = 0; p.jumps = 1; p.sx = 0.75; p.sy = 1.3; AE.sfx('jump'); dust(p.x, p.y, -p.face, 4); }
    else if (p.jumps < 2 && pressed.jump) { p.vy = -C.DJV; p.jumps = 2; p.buf = 0; p.dash = 0; p.sx = 0.8; p.sy = 1.25; AE.sfx('djump'); burst(p.x, p.y - 2, 8, ['#8fe6f5', '#fbf3df'], 60, 0.35, 0, 2); }
  }
  if (p.atk > 0) p.atk -= dt;
  // movement + collisions
  const prevBottom = p.y; const onMover = p.ground && p.ground.mover ? p.ground : null;
  if (onMover) p.x += onMover.dx;
  p.x += p.vx * dt; let b = pbox();
  for (const s of solids) { if (s.k === 'oneway') continue; if (overlap(b, s)) { if (p.vx > 0 || (p.x < s.x + s.w / 2)) p.x = s.x - p.w / 2 - 0.01; else p.x = s.x + s.w + p.w / 2 + 0.01; if (p.dash <= 0) p.vx = 0; b = pbox(); } }
  p.x = clamp(p.x, 8, WORLD_W - 8);
  p.y += p.vy * dt; b = pbox(); const was = p.ground; p.ground = null;
  for (const s of solids) {
    if (b.x >= s.x + s.w || b.x + b.w <= s.x) continue;
    if (s.k === 'oneway') { if (p.vy >= 0 && prevBottom <= s.y + 0.5 && p.y >= s.y && !(keys.talk && false)) { p.y = s.y; p.vy = 0; p.ground = s; } continue; }
    if (overlap(b, s)) { if (p.vy >= 0 && prevBottom <= s.y + 4) { p.y = s.y; p.vy = 0; p.ground = s; } else if (p.vy < 0) { p.y = s.y + s.h + p.h; p.vy = 0; } b = pbox(); }
  }
  if (!p.ground) { // ground probe for standing still
    for (const s of solids) if (b.x < s.x + s.w && b.x + b.w > s.x && Math.abs(p.y - s.y) < 0.6 && p.vy >= 0) { p.ground = s; p.y = s.y; }
  }
  if (p.ground) { p.jumps = 0; p.coyote = C.COY; if (!was) { p.sx = 1.25; p.sy = 0.78; if (S.t > 0.3) { AE.sfx('land'); dust(p.x, p.y, 0, 6); } } if (p.ground.k === 'ground' && p.ground.w > 40) p.safe = { x: clamp(p.x, p.ground.x + 16, p.ground.x + p.ground.w - 16), y: p.ground.y }; }
  else if (was && p.vy >= 0) p.coyote = C.COY;
  p.sx = lerp(p.sx, 1, Math.min(1, dt * 14)); p.sy = lerp(p.sy, 1, Math.min(1, dt * 14));
  if (p.ground && Math.abs(p.vx) > 100 && Math.random() < dt * 14) dust(p.x - p.face * 3, p.y, p.face, 1);
  if (p.y > LH + 60) { p.x = p.safe.x; p.y = p.safe.y - 40; p.vx = 0; p.vy = 0; p.inv = 1; shake(3); AE.sfx('hurt'); toast('OOPS. RESPAWNED.'); }
  p.anim += dt;
}

function updateWorld(dt) {
  const p = P1, pb = pbox();
  for (const m of movers) { m.t += dt; const nx = lerp(m.ax, m.bx, (Math.sin(m.t * 1.1) + 1) / 2); m.dx = nx - m.x; m.x = nx; }
  // attack hitbox
  let hb = null; if (p.atk > 0 && p.atk < ATK_T - 0.04 && p.atk > ATK_T - 0.2) hb = { x: p.face > 0 ? p.x : p.x - 30, y: p.y - 26, w: 30, h: 26 };
  for (const e of enemies) {
    if (e.dead) continue; e.ph += dt; e.fl -= dt;
    if (e.t === 'bug') { if (e.kb) { e.x += e.kb * dt; e.kb *= 0.86; if (Math.abs(e.kb) < 4) e.kb = 0; } else { e.x += e.dir * 26 * dt; } if (e.x < e.x0) { e.x = e.x0; e.dir = 1; } if (e.x > e.x1) { e.x = e.x1; e.dir = -1; } e.box = { x: e.x - 7, y: e.y - 9, w: 14, h: 9 }; }
    else { e.x = e.bx + Math.sin(e.ph * 0.9) * 36 + (e.kb || 0); e.y = e.by + Math.sin(e.ph * 2.1) * 10; if (e.kb) { e.kb *= 0.9; } e.box = { x: e.x - 7, y: e.y - 7, w: 14, h: 14 }; }
    if (hb && !p.atkHit.has(e) && overlap(hb, e.box)) {
      p.atkHit.add(e); e.hp--; e.fl = 0.12; e.kb = p.face * 140; S.hit = 0.055; shake(2.5); AE.sfx('hit'); burst(e.x, e.y - 4, 6, ['#fbf3df', '#8fe6f5'], 90, 0.25, 200, 2);
      if (e.hp <= 0) { e.dead = true; S.bugs++; AE.sfx('pop'); burst(e.x, e.y - 4, 18, e.t === 'bug' ? ['#e2553f', '#ffb347', '#2a1f3a'] : ['#d9d1ff', '#a99fd8', '#ffffff'], 130, 0.6, 260, 2); ftext(e.x, e.y - 14, e.t === 'bug' ? 'BUG FIXED' : 'NaN CLEARED', '#f0a33a'); for (let i = 0; i < 3; i++) tokens.push({ x: e.x + rnd(-6, 6), y: e.y - 10, got: false, ph: 0, drop: true, vx: rnd(-60, 60), vy: rnd(-160, -90) }); hud(); }
    } else if (!e.dead && p.inv <= 0 && p.dash <= 0 && overlap(pb, e.box)) {
      p.inv = 0.9; p.vx = (p.x < e.x ? -1 : 1) * 190; p.vy = -170; p.ground = null; shake(3); AE.sfx('hurt'); burst(p.x, p.y - 12, 8, ['#ff6b6b', '#fbf3df'], 80, 0.4);
      if (S.tokens > 0) { const lose = Math.min(3, S.tokens); S.tokens -= lose; ftext(p.x, p.y - 30, `-${lose}`, '#ff8a8a'); hud(); }
    }
  }
  for (const c of chests) { c.fl -= dt; if (!c.open && hb && overlap(hb, { x: c.x - 9, y: c.y - 14, w: 18, h: 14 })) { c.open = true; c.fl = 0.2; S.hit = 0.06; shake(3); AE.sfx('chest'); burst(c.x, c.y - 12, 24, ['#f0a33a', '#fff1a6', '#fbf3df'], 140, 0.8); for (let i = 0; i < 5; i++) tokens.push({ x: c.x, y: c.y - 14, got: false, ph: 0, drop: true, vx: rnd(-80, 80), vy: rnd(-220, -140) }); toast(`<strong>${c.a[0]}</strong>${c.a[1]}`, 'ach', 4200); } }
  // tokens
  for (const t of tokens) {
    if (t.got) continue; t.ph += dt;
    if (t.drop) { t.vy += 600 * dt; t.x += t.vx * dt; t.y += t.vy * dt; for (const s of solids) if (t.x > s.x && t.x < s.x + s.w && t.y > s.y - 3 && t.y < s.y + 6 && t.vy > 0) { t.y = s.y - 3; t.vy *= -0.4; t.vx *= 0.7; } if (t.y > LH + 40) t.got = true; }
    const dx = p.x - t.x, dy = (p.y - 12) - t.y, d = Math.hypot(dx, dy);
    if (d < 34 && !t.drop || (t.drop && d < 60 && t.ph > 0.4)) { t.x += dx * dt * 9; t.y += dy * dt * 9; }
    if (d < 11) { t.got = true; S.tokens++; S.streak = S.streakT > 0 ? S.streak + 1 : 0; S.streakT = 0.6; AE.sfx('coin', Math.min(S.streak, 9)); burst(t.x, t.y, 4, ['#ffd36b', '#fff'], 40, 0.3, 0, 1); hud(); }
  }
  S.streakT -= dt;
  for (const o of orbs) {
    if (o.got) continue; o.ph += dt;
    if (Math.hypot(p.x - o.x, p.y - 12 - o.y) < 14) { o.got = true; S.skills++; AE.sfx('orb'); shake(2); burst(o.x, o.y, 26, ['#8fe6f5', '#f0a33a', '#fbf3df'], 120, 0.8, 80, 2); ftext(o.x, o.y - 12, '+' + o.name, '#8fe6f5'); toast(`SKILL UNLOCKED · ${o.name.toUpperCase()}`); markSkill(o.name); hud(); }
  }
  for (const st of stations) { st.near = Math.abs(p.x - st.x) < 34 && p.ground; if (!st.visited && !st.auto && Math.abs(p.x - st.x) < 44 && S.mode === 'play') { st.auto = true; p.vx *= 0.3; openPanel(st.id); return; } if (st.near && pressed.talk) { openPanel(st.id); return; } }
  if (p.x > GATE.x - 6 && S.mode === 'play' && !S.endT) { finale(); }
  for (const g of ghosts) g.life -= dt;
  while (ghosts.length && ghosts[0].life <= 0) ghosts.shift();
  for (const s of slashes) s.life -= dt; while (slashes.length && slashes[0].life <= 0) slashes.shift();
}
function finale() {
  S.endT = performance.now(); if (!S.startT) S.startT = S.endT - 1000; S.mode = 'ending'; AE.sfx('gate'); shake(4); $('#mk-gate').classList.add('done');
  for (let i = 0; i < 4; i++) setTimeout(() => burst(GATE.x + rnd(-40, 40), 120 + rnd(-30, 30), 40, ['#f0a33a', '#8fe6f5', '#ff8a4c', '#fff1a6', '#c3b6ff'], 170, 1.4, 160, 2), i * 260);
  setTimeout(() => AE.playVoice('outro'), 500);
  setTimeout(showEnd, 1700);
}
function updateParts(dt) {
  for (const q of parts) { q.life -= dt; q.vy += q.g * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= 0.985; }
  for (let i = parts.length - 1; i >= 0; i--) if (parts[i].life <= 0) parts.splice(i, 1);
  for (const t of texts) { t.life -= dt; t.y -= 22 * dt; } for (let i = texts.length - 1; i >= 0; i--) if (texts[i].life <= 0) texts.splice(i, 1);
}

/* ================= RENDER ================= */
const MOON = (() => { const [c, x] = mk(30, 30); x.fillStyle = '#fff6d8'; x.beginPath(); x.arc(15, 15, 13, 0, 7); x.fill(); x.fillStyle = '#ffe7a8'; x.fillRect(8, 17, 3, 2); x.fillRect(12, 22, 2, 2); x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.arc(21, 10, 12, 0, 7); x.fill(); return c; })();
const STARS = Array.from({ length: 120 }, (_, i) => { const r = mulberry(i + 99); return { x: r() * 640, y: r() * 170, s: r() < 0.15 ? 2 : 1, p: r() * 6, c: r() < 0.2 ? '#ffd23d' : r() < 0.3 ? '#7fd0ff' : '#ffffff' }; });
const KITES = Array.from({ length: 7 }, (_, i) => ({ x: 60 + i * 110 + (i % 2) * 30, y: 34 + (i * 37) % 56, c: ['#ff4a5e', '#ffd23d', '#2fd6b0', '#ff7ac8', '#ffffff', '#5a8aff', '#ff9a3d'][i], p: i * 1.3 }));
const FLIES = Array.from({ length: 34 }, () => ({ x: Math.random() * 640, y: 50 + Math.random() * 170, p: Math.random() * 9, s: 0.3 + Math.random() * 0.7 }));
const GCL = Array.from({ length: 10 }, (_, i) => ({ x: (i * 131) % 760, y: 8 + (i * 23) % 92, s: 0.4 + (i % 3) * 0.3, k: i % 6 }));
let VIG = null;
function buildVignette() { const [c, x] = mk(VW, LH); const v = x.createRadialGradient(VW / 2, LH / 2, LH * 0.5, VW / 2, LH / 2, VW * 0.8); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(20,10,50,.32)'); x.fillStyle = v; x.fillRect(0, 0, VW, LH); VIG = c; }
function tileDraw(img, par, alpha, yOff = 0) {
  if (alpha <= 0.01 || !img) return; ctx.globalAlpha = alpha; let off = -((S.camX * par) % TILE); if (off > 0) off -= TILE;
  for (let x = Math.round(off); x < VW; x += TILE) ctx.drawImage(img, x, yOff); ctx.globalAlpha = 1;
}
function drawSky(cx, t, W) {
  const [a, b, c] = keyedCol(SKY, cx); const g = ctx.createLinearGradient(0, 0, 0, LH); g.addColorStop(0, a); g.addColorStop(0.55, b); g.addColorStop(1, c); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, LH);
  const night = clamp(keyed(DARK, cx) / 0.34, 0, 1);
  if (night > 0.05) for (const s of STARS) { const al = night * (0.55 + 0.45 * Math.sin(t * 1.7 + s.p)); ctx.globalAlpha = al; ctx.fillStyle = s.c; let x = (s.x - S.camX * 0.02) % 640; if (x < 0) x += 640; ctx.fillRect(Math.round(x), s.y, s.s, s.s); if (s.s > 1 && Math.sin(t * 2 + s.p) > 0.7) { ctx.fillRect(Math.round(x) - 1, s.y + 0.5, 4, 1); } }
  ctx.globalAlpha = 1;
  if (W[0] > 0.02) pixelSun(ctx, VW * 0.82, 40, 14, t, 'day', W[0]);
  if (W[1] > 0.02) { const k = clamp((cx - 1150) / 1300, 0, 1); pixelSun(ctx, VW * 0.72, lerp(70, 206, k), 18, t, 'set', W[1]); }
  if (W[2] > 0.02) { ctx.globalAlpha = W[2]; const mx = VW * 0.78, my = 50; ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(glow('rgba(160,180,255,'), mx - 60, my - 60, 120, 120); ctx.globalCompositeOperation = 'source-over'; ctx.drawImage(MOON, Math.round(mx - 15), my - 15); ctx.globalAlpha = 1; }
  if (W[3] > 0.02) { const k = clamp((cx - 3960) / (GATE.x - 3960), 0, 1); pixelSun(ctx, VW * 0.64, lerp(214, 92, k), 22, t, 'dawn', W[3]); }
  // clouds, tinted per zone
  const tints = [['day', W[0]], ['sunset', W[1]], ['night', W[2] * 0.6], ['dawn', W[3]]];
  for (const [tn, al] of tints) {
    if (al < 0.02) continue; const set = cloudSet(tn); ctx.globalAlpha = al;
    for (const c of GCL) { let x = (c.x - S.camX * 0.06 * c.s - t * 4 * c.s) % (VW + 160); if (x < -100) x += VW + 160; ctx.drawImage(set[c.k], Math.round(x - 60), c.y); }
  }
  ctx.globalAlpha = 1;
}
function drawManim(t, a) {
  if (a < 0.02) return; ctx.globalAlpha = a; const base = -S.camX * 0.3 + 1150 * 0.3;
  for (let i = 0; i < 4; i++) {
    const ox = base + 60 + i * 230, oy = 70 + (i % 2) * 40; if (ox < -200 || ox > VW + 40) continue;
    const prog = clamp(((t * 0.25 + i * 0.3) % 1.4), 0, 1);
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(Math.round(ox), oy, 140, 1); ctx.fillRect(Math.round(ox), oy - 30, 1, 60);
    ctx.strokeStyle = i % 2 ? '#fff1a6' : '#ffffff'; ctx.lineWidth = 2; ctx.beginPath();
    const fy = s => i % 2 ? -Math.exp(-((s - 70) ** 2) / 600) * 26 : Math.sin(s / 16) * 18 * Math.exp(-s / 180);
    for (let s = 0; s <= prog * 140; s += 2) { s === 0 ? ctx.moveTo(ox + s, oy + fy(s)) : ctx.lineTo(ox + s, oy + fy(s)); }
    ctx.stroke(); if (prog < 1) { const s = prog * 140; ctx.fillStyle = '#ff5e7a'; ctx.fillRect(ox + s - 2, oy + fy(s) - 2, 4, 4); }
  }
  const gx = base + 420, gy = 26; if (gx > -80 && gx < VW + 20) for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) { const v = (Math.sin(t * 1.5 + r * 1.3 + c * 0.7) + 1) / 2 * (r === c ? 1 : 0.55); ctx.fillStyle = `rgba(255,255,255,${0.15 + v * 0.55})`; ctx.fillRect(Math.round(gx + c * 7), gy + r * 7, 6, 6); }
  ctx.globalAlpha = 1;
}
function drawLandfillLive(t, a) {
  if (a < 0.02) return; ctx.globalAlpha = a;
  const par = 0.45, plumes = LAYERS.mid.vayuPlumes; let off = -((S.camX * par) % TILE); if (off > 0) off -= TILE;
  const satX = ((t * 22) % (VW + 200)) - 100, satY = 34;
  const sp = [];
  for (let base = Math.round(off); base < VW; base += TILE) for (const pl of plumes) sp.push({ x: base + pl.x, top: pl.top + 10 });
  ctx.globalCompositeOperation = 'lighter';
  const pg = glow('rgba(255,120,80,'), pg2 = glow('rgba(255,200,90,');
  for (const pl of sp) { if (pl.x < -80 || pl.x > VW + 80) continue;
    for (let i = 0; i < 12; i++) { const k = ((t * 0.18 + i / 12) % 1), y = pl.top - k * 92, x = pl.x + Math.sin(k * 5 + i) * 6 + k * 34, r = 9 + k * 24; ctx.globalAlpha = a * 0.55 * (1 - k); ctx.drawImage(i % 3 ? pg : pg2, x - r, y - r, r * 2, r * 2); } }
  ctx.globalAlpha = a;
  const bg = ctx.createLinearGradient(0, satY, 0, 240); bg.addColorStop(0, 'rgba(120,240,255,.35)'); bg.addColorStop(1, 'rgba(120,240,255,0)'); ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(satX - 1, satY + 3); ctx.lineTo(satX - 24, 240); ctx.lineTo(satX + 24, 240); ctx.lineTo(satX + 1, satY + 3); ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  const sx = Math.round(satX); ctx.fillStyle = '#1e1633'; ctx.fillRect(sx - 11, satY - 3, 23, 7); ctx.fillStyle = '#e8ecff'; ctx.fillRect(sx - 2, satY - 2, 5, 5); ctx.fillStyle = '#5a8aff'; ctx.fillRect(sx - 10, satY - 1, 7, 3); ctx.fillRect(sx + 4, satY - 1, 7, 3); ctx.fillStyle = '#ff5e7a'; ctx.fillRect(sx, satY + 3, 1, 2);
  for (const pl of sp) if (Math.abs(pl.x + 20 - satX) < 60) {
    const bx = Math.round(pl.x - 10), by = Math.round(pl.top - 78); ctx.strokeStyle = '#7ff0ff'; ctx.lineWidth = 1; ctx.strokeRect(bx + 0.5, by + 0.5, 62, 72);
    ctx.fillStyle = '#7ff0ff'; ctx.fillRect(bx, by - 10, 62, 10); ctx.fillStyle = '#1e1633'; ctx.font = '8px Silkscreen, monospace'; ctx.fillText('CH4 PLUME', bx + 3, by - 2);
  }
  ctx.fillStyle = '#141a46'; for (let i = 0; i < 5; i++) { const a2 = t * 0.5 + i * 1.3, x = VW * 0.5 + Math.cos(a2) * (60 + i * 18) - ((S.camX - 3000) * 0.1), y = 80 + Math.sin(a2) * 18 + i * 4, f = Math.sin(t * 8 + i) > 0 ? 1 : 0; ctx.fillRect(Math.round(x) - 3, Math.round(y) - f, 3, 1); ctx.fillRect(Math.round(x) + 1, Math.round(y) - f, 3, 1); ctx.fillRect(Math.round(x), Math.round(y), 1, 1); }
  ctx.globalAlpha = 1;
}
function drawFlies(t, a, col) { if (a < 0.02) return; for (const f of FLIES) { let x = (f.x - S.camX * f.s * 0.6) % 640; if (x < 0) x += 640; const y = f.y + Math.sin(t * 0.8 + f.p) * 10, b = (Math.sin(t * 2.4 + f.p) + 1) / 2; ctx.globalAlpha = a * b; ctx.fillStyle = col; ctx.fillRect(Math.round(x), Math.round(y), 2, 2); ctx.globalAlpha = a * b * 0.3; ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 4, 4); } ctx.globalAlpha = 1; }

const snap = v => Math.round(v * R) / R;
function drawSprite(name, x, y, face, tint = 'n', sx = 1, sy = 1, alpha = 1) {
  const f = FR[name][tint][face > 0 ? 'r' : 'l']; ctx.globalAlpha = alpha; ctx.save(); ctx.translate(snap(x), snap(y)); if (sx !== 1 || sy !== 1) ctx.scale(sx, sy); ctx.drawImage(f, -SPRITE.w / 2, -FOOT); ctx.restore(); ctx.globalAlpha = 1;
}
function playerFrame() {
  const p = P1;
  if (p.dash > 0) return 'dash';
  if (p.atk > 0) return p.atk > ATK_T - 0.07 ? 'atk0' : 'atk1';
  if (!p.ground) return p.vy < 0 ? 'jump' : 'fall';
  if (Math.abs(p.vx) > 12) return 'run' + (Math.floor(p.anim / 0.072) % 6);
  if (p.anim % 3.6 < 0.12) return 'blink';
  return Math.floor(p.anim / 0.55) % 2 ? 'idle1' : 'idle0';
}
function drawBug(e, t) {
  const x = Math.round(e.x), y = Math.round(e.y), f = Math.floor(e.ph * 10) % 2, d = e.dir;
  ctx.fillStyle = '#1e1633'; ctx.fillRect(x - 8, y - 10, 16, 9); ctx.fillRect(x + d * 6 - 3, y - 8, 6, 6);
  ctx.fillStyle = e.fl > 0 ? '#fff' : '#ff4a5e'; ctx.fillRect(x - 7, y - 9, 13, 7); ctx.fillStyle = e.fl > 0 ? '#fff' : '#ff9aa8'; ctx.fillRect(x - 6, y - 9, 5, 1);
  ctx.fillStyle = '#1e1633'; ctx.fillRect(x - 1, y - 9, 1, 7); ctx.fillRect(x - 5, y - 6, 2, 2); ctx.fillRect(x + 2, y - 5, 2, 2);
  ctx.fillStyle = '#fff'; ctx.fillRect(x + d * 7, y - 7, 2, 2); ctx.fillStyle = '#1e1633'; ctx.fillRect(x + d * 7 + (d > 0 ? 1 : 0), y - 6, 1, 1);
  for (let i = -1; i <= 1; i++) ctx.fillRect(x + i * 4 + (f ? 1 : -1), y - 1, 1, 1 + ((i + f) & 1));
  ctx.fillRect(x + d * 9, y - 11, 1, 2); ctx.fillRect(x + d * 10, y - 12, 1, 1);
}
function drawGhost(e, t) {
  const x = Math.round(e.x), y = Math.round(e.y);
  ctx.fillStyle = '#1e1633'; ctx.beginPath(); ctx.arc(x, y - 2, 8, Math.PI, 0); ctx.fill(); ctx.fillRect(x - 8, y - 2, 16, 8);
  ctx.fillStyle = e.fl > 0 ? '#ffffff' : '#d8ccff'; ctx.beginPath(); ctx.arc(x, y - 2, 7, Math.PI, 0); ctx.fill(); ctx.fillRect(x - 7, y - 2, 14, 7);
  for (let i = 0; i < 4; i++) { const w = Math.floor(e.ph * 6 + i) % 2; ctx.fillStyle = '#d8ccff'; ctx.fillRect(x - 7 + i * 4, y + 5, 3, w ? 2 : 1); }
  ctx.fillStyle = '#1e1633'; ctx.font = '6px Silkscreen, monospace'; ctx.fillText('NaN', x - 6, y + 2);
}
function drawChest(c, t) {
  const x = Math.round(c.x), y = Math.round(c.y);
  ctx.fillStyle = '#1e1633'; ctx.fillRect(x - 11, y - 14, 22, 14);
  ctx.fillStyle = c.fl > 0 ? '#fff' : '#d0763a'; ctx.fillRect(x - 10, y - 13, 20, 12); ctx.fillStyle = '#9a4f22'; ctx.fillRect(x - 10, y - 7, 20, 1);
  ctx.fillStyle = '#ffd23d'; ctx.fillRect(x - 10, y - 13, 2, 12); ctx.fillRect(x + 8, y - 13, 2, 12); ctx.fillRect(x - 2, y - 9, 4, 4); ctx.fillStyle = '#1e1633'; ctx.fillRect(x - 1, y - 8, 2, 2);
  if (c.open) { ctx.fillStyle = '#1e1633'; ctx.fillRect(x - 11, y - 21, 22, 8); ctx.fillStyle = '#d0763a'; ctx.fillRect(x - 10, y - 20, 20, 6); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.8; ctx.drawImage(glow('rgba(255,220,120,'), x - 20, y - 50, 40, 40); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
  else { ctx.fillStyle = '#1e1633'; ctx.fillRect(x - 11, y - 18, 22, 5); ctx.fillStyle = '#ef9a5a'; ctx.fillRect(x - 10, y - 17, 20, 3); if (Math.sin(t * 3 + c.x) > 0.6) { ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 5, y - 20, 1, 3); ctx.fillRect(x + 4, y - 19, 3, 1); } }
}
function drawStation(st, t) {
  const x = Math.round(st.x), y = Math.round(st.y);
  if (!st.visited) { ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(0, 0, 0, y); g.addColorStop(0, 'rgba(255,210,61,0)'); g.addColorStop(1, `rgba(255,210,61,${0.3 + Math.sin(t * 3) * 0.08})`); ctx.fillStyle = g; ctx.fillRect(x - 10, 0, 20, y - 50); ctx.globalCompositeOperation = 'source-over'; }
  ctx.fillStyle = '#1e1633'; ctx.fillRect(x - 23, y - 63, 46, 63); ctx.fillStyle = st.id === 'arc' ? '#7a5cff' : '#2fb6a0'; ctx.fillRect(x - 21, y - 61, 42, 59); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(x - 21, y - 61, 42, 2); ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(x + 15, y - 59, 6, 57);
  ctx.fillStyle = '#1e1633'; ctx.fillRect(x - 17, y - 55, 34, 28); ctx.fillStyle = '#0e1238'; ctx.fillRect(x - 16, y - 54, 32, 26);
  if (st.id === 'arc') { ctx.strokeStyle = '#7ff0ff'; ctx.lineWidth = 1; ctx.beginPath(); const k = (t * 0.5) % 1; for (let s = 0; s <= 28 * k; s++) { const yy = y - 40 - Math.sin(s / 4.5) * 8; s ? ctx.lineTo(x - 14 + s, yy) : ctx.moveTo(x - 14 + s, yy); } ctx.stroke(); ctx.fillStyle = '#ffd23d'; ctx.font = '6px Silkscreen, monospace'; ctx.fillText('arXiv', x - 14, y - 47); }
  else { for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) { const v = (Math.sin(t * 2 + r * 2 + c) + 1) / 2; ctx.fillStyle = `rgba(255,${Math.round(110 + v * 110)},80,${0.35 + v * 0.65})`; ctx.fillRect(x - 14 + c * 6, y - 52 + r * 6, 5, 5); } ctx.strokeStyle = '#7ff0ff'; ctx.strokeRect(x - 3.5, y - 47.5, 13, 13);
    ctx.fillStyle = '#1e1633'; ctx.beginPath(); ctx.ellipse(x + 28, y - 70, 11, 6, -0.6, 0, 7); ctx.fill(); ctx.fillStyle = '#e8ecff'; ctx.beginPath(); ctx.ellipse(x + 28, y - 70, 10, 5, -0.6, 0, 7); ctx.fill(); ctx.fillStyle = '#1e1633'; ctx.fillRect(x + 21, y - 66, 4, 7); }
  ctx.font = '8px Silkscreen, monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#1e1633'; ctx.fillText(st.name.toUpperCase(), x + 1, y - 15); ctx.fillStyle = '#ffffff'; ctx.fillText(st.name.toUpperCase(), x, y - 16); ctx.textAlign = 'left';
  ctx.fillStyle = st.visited ? '#ffd23d' : '#ff5e7a'; ctx.fillRect(x - 12, y - 8, 24, 3);
  if (!st.visited) { const by = Math.round(y - 84 + Math.sin(t * 4) * 3); ctx.fillStyle = '#1e1633'; ctx.fillRect(x - 6, by - 1, 12, 16); ctx.fillStyle = '#ffd23d'; ctx.fillRect(x - 5, by, 10, 14); ctx.fillStyle = '#1e1633'; ctx.fillRect(x - 1, by + 2, 2, 6); ctx.fillRect(x - 1, by + 10, 2, 2); }
  else if (st.near) { const by = Math.round(y - 82 + Math.sin(t * 4) * 2); ctx.fillStyle = '#1e1633'; ctx.fillRect(x - 7, by - 1, 14, 13); ctx.fillStyle = '#fff6e0'; ctx.fillRect(x - 6, by, 12, 11); ctx.fillStyle = '#1e1633'; ctx.font = '8px Silkscreen, monospace'; ctx.fillText('E', x - 2, by + 8); }
}
function drawGate(t) {
  const x = GATE.x, y = GATE.y;
  ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.7; ctx.drawImage(glow('rgba(255,210,61,'), x - 90, y - 140, 180, 180); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#1e1633'; ctx.fillRect(x - 47, y - 111, 94, 111); ctx.fillStyle = '#ff7a5a'; ctx.fillRect(x - 46, y - 110, 92, 110);
  for (let r = 0; r < 11; r++) for (let c = 0; c < 6; c++) { ctx.fillStyle = (r + c) % 3 ? '#ff9a6a' : '#e85a4a'; ctx.fillRect(x - 44 + c * 15 + (r % 2) * 7, y - 108 + r * 10, 13, 8); }
  ctx.fillStyle = '#1e1633'; ctx.fillRect(x - 25, y - 73, 50, 73); ctx.beginPath(); ctx.arc(x, y - 73, 25, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#3a2a8a'; ctx.fillRect(x - 23, y - 72, 46, 72); ctx.beginPath(); ctx.arc(x, y - 72, 23, Math.PI, 0); ctx.fill();
  for (let i = 0; i < 22; i++) { const a = t * 1.5 + i * 0.7, r = 4 + (i * 3) % 20; ctx.fillStyle = ['#ffd23d', '#7ff0ff', '#ff7ac8'][i % 3]; ctx.fillRect(Math.round(x + Math.cos(a) * r) - 1, Math.round(y - 50 + Math.sin(a) * r * 1.6), 2, 2); }
  const on = Math.sin(t * 6) > -0.8; ctx.fillStyle = '#1e1633'; ctx.fillRect(x - 38, y - 130, 76, 18); ctx.fillStyle = on ? '#ffd23d' : '#8a6a2a'; ctx.font = '10px Silkscreen, monospace'; ctx.textAlign = 'center'; ctx.fillText('HIRE ME', x, y - 117); ctx.textAlign = 'left';
}
function drawOrb(o, t) {
  const y = Math.round(o.y + Math.sin(o.ph * 2.4) * 3), x = Math.round(o.x);
  ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(glow('rgba(127,240,255,'), x - 18, y - 18, 36, 36); ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#1e1633'; ctx.fillRect(x - 8, y - 7, 16, 14); ctx.fillRect(x - 7, y - 8, 14, 16);
  ctx.fillStyle = '#7ff0ff'; ctx.fillRect(x - 7, y - 6, 14, 12); ctx.fillRect(x - 6, y - 7, 12, 14); ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 5, y - 6, 4, 2); ctx.fillStyle = '#3fc0e0'; ctx.fillRect(x - 6, y + 4, 12, 2);
  ctx.fillStyle = '#1e1633'; ctx.font = '6px Silkscreen, monospace'; ctx.textAlign = 'center'; ctx.fillText(o.short, x, y + 2); ctx.textAlign = 'left';
}
function drawToken(k, t) {
  const y = Math.round(k.y + (k.drop ? 0 : Math.sin(t * 3 + k.ph) * 1.5)), w = Math.round(Math.abs(Math.cos(t * 4 + k.ph)) * 4 + 1), x = Math.round(k.x - w / 2);
  ctx.fillStyle = '#1e1633'; ctx.fillRect(x - 1, y - 5, w + 2, 10);
  ctx.fillStyle = '#ffd23d'; ctx.fillRect(x, y - 4, w, 8); ctx.fillStyle = '#fff6c8'; ctx.fillRect(x, y - 4, 1, 3); ctx.fillStyle = '#e98a1e'; ctx.fillRect(x, y + 2, w, 2);
}
function drawSign(x, y, lines) {
  ctx.font = '8px Silkscreen, monospace'; const w = Math.ceil(Math.max(...lines.map(l => ctx.measureText(l).width))) + 10, h = lines.length * 10 + 5;
  ctx.fillStyle = '#1e1633'; ctx.fillRect(x + 7, y - 12, 5, 12); ctx.fillRect(x + w - 12, y - 12, 5, 12); ctx.fillStyle = '#8a5530'; ctx.fillRect(x + 8, y - 12, 3, 12); ctx.fillRect(x + w - 11, y - 12, 3, 12);
  ctx.fillStyle = '#1e1633'; ctx.fillRect(x - 1, y - 12 - h - 1, w + 2, h + 2); ctx.fillStyle = '#c98a4a'; ctx.fillRect(x, y - 12 - h, w, h); ctx.fillStyle = '#ffd08a'; ctx.fillRect(x, y - 12 - h, w, 2);
  ctx.fillStyle = '#1e1633'; lines.forEach((l, i) => ctx.fillText(l, x + 5, y - 12 - h + 10 + i * 10));
}

function render(t) {
  const cx = S.camX + VW / 2, W = zoneWeights(cx);
  ctx.setTransform(R, 0, 0, R, 0, 0); ctx.imageSmoothingEnabled = false;
  drawSky(cx, t, W);
  tileDraw(LAYERS.far.delhi, 0.12, W[0]); tileDraw(LAYERS.far.arc, 0.12, W[1] * 0.8); tileDraw(LAYERS.far.vayu, 0.12, W[2]); tileDraw(LAYERS.far.dawn, 0.12, W[3]);
  if (W[0] > 0.02) { ctx.globalAlpha = W[0]; drawKitesOn(ctx, t, VW, 214, S.camX); ctx.globalAlpha = 1; }
  drawManim(t, W[1]);
  tileDraw(LAYERS.mid.delhi, 0.45, W[0], 12); tileDraw(LAYERS.mid.arc, 0.45, W[1], 0); tileDraw(LAYERS.mid.vayu, 0.45, W[2], 8); tileDraw(LAYERS.mid.dawn, 0.45, W[3], 6);
  drawLandfillLive(t, W[2]);
  drawFlies(t, W[1] * 0.9, '#fff1a6'); drawFlies(t, W[2], '#ffd23d'); drawFlies(t, W[3] * 0.7, '#ffffff');
  const sh = S.shake > 0.05 ? [rnd(-S.shake, S.shake), rnd(-S.shake, S.shake)] : [0, 0];
  const camS = snap(S.camX - sh[0]);
  ctx.save(); ctx.translate(-camS, snap(sh[1]));
  const L = S.camX - 60, Rr = S.camX + VW + 60;
  drawSign(100, 214, ['RUN RIGHT >>>', 'Z: FIX BUGS']); drawSign(2876, 198, ['RIDE THE LIFT', 'ACROSS >>>']);
  for (const s of solids) {
    if (s.x > Rr || s.x + s.w < L) continue;
    if (s.mover) { const mx = snap(s.x); ctx.fillStyle = '#1e1633'; ctx.fillRect(mx - 1, s.y - 1, s.w + 2, s.h + 2); ctx.fillStyle = '#7ff0ff'; ctx.fillRect(mx, s.y, s.w, 2); ctx.fillStyle = '#5a64c8'; ctx.fillRect(mx, s.y + 2, s.w, s.h - 2); ctx.fillStyle = (Math.sin(t * 8) > 0) ? '#ffd23d' : '#ff5e7a'; ctx.fillRect(mx + s.w / 2 - 1, s.y + 3, 2, 2); continue; }
    if (s.tex) ctx.drawImage(s.tex, Math.round(s.x), Math.round(s.y));
    if (s.k === 'ground') { ctx.fillStyle = '#1e1633'; ctx.fillRect(Math.round(s.x) - 1, s.y, 1, LH); ctx.fillRect(Math.round(s.x + s.w), s.y, 1, LH); }
  }
  for (const st of stations) if (st.x > L - 40 && st.x < Rr + 40) drawStation(st, t);
  if (GATE.x > L - 80 && GATE.x < Rr + 80) drawGate(t);
  for (const c of chests) if (c.x > L && c.x < Rr) drawChest(c, t);
  for (const k of tokens) if (!k.got && k.x > L && k.x < Rr) drawToken(k, t);
  for (const o of orbs) if (!o.got && o.x > L && o.x < Rr) drawOrb(o, t);
  for (const e of enemies) if (!e.dead && e.x > L && e.x < Rr) (e.t === 'bug' ? drawBug : drawGhost)(e, t);
  for (const g of ghosts) drawSprite(g.f, g.x, g.y, g.face, 'ghost', 1, 1, g.life / 0.22 * 0.5);
  const p = P1, blink = p.inv > 0 && Math.floor(t * 20) % 2;
  if (p.ground) { ctx.fillStyle = 'rgba(30,22,51,.3)'; const sx = snap(p.x); ctx.fillRect(Math.round(sx) - 7, p.y, 14, 2); ctx.fillRect(Math.round(sx) - 5, p.y + 2, 10, 1); }
  if (!blink) drawSprite(playerFrame(), p.x, p.y, p.face, 'n', p.sx, p.sy);
  for (const s of slashes) { const k = 1 - s.life / 0.16, r = 20 + s.n * 3; ctx.save(); ctx.translate(snap(p.x + s.dir * 6), snap(p.y - 15)); ctx.scale(s.dir, s.n === 1 ? -1 : 1); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(127,240,255,${0.9 * (1 - k)})`; ctx.beginPath(); ctx.arc(0, 0, r, -1.3 + k * 0.6, 1.0 + k * 0.6); ctx.arc(-5, -2, r - 5, 1.0 + k * 0.6, -1.3 + k * 0.6, true); ctx.fill(); ctx.fillStyle = `rgba(255,255,255,${0.95 * (1 - k)})`; ctx.beginPath(); ctx.arc(0, 0, r, -0.9 + k * 0.6, 0.7 + k * 0.6); ctx.arc(-2, -1, r - 2, 0.7 + k * 0.6, -0.9 + k * 0.6, true); ctx.fill(); ctx.restore(); }
  ctx.globalCompositeOperation = 'source-over';
  for (const q of parts) { ctx.globalAlpha = clamp(q.life / q.max, 0, 1); ctx.fillStyle = q.c; if (q.glyph) { ctx.font = '7px Silkscreen, monospace'; ctx.fillText(q.glyph, q.x, q.y); } else ctx.fillRect(Math.round(q.x), Math.round(q.y), q.s, q.s); } ctx.globalAlpha = 1;
  ctx.font = '8px Silkscreen, monospace'; ctx.textAlign = 'center'; for (const tx of texts) { ctx.globalAlpha = clamp(tx.life * 1.5, 0, 1); ctx.fillStyle = '#1e1633'; ctx.fillText(tx.s, tx.x + 1, tx.y + 1); ctx.fillText(tx.s, tx.x - 1, tx.y); ctx.fillText(tx.s, tx.x, tx.y - 1); ctx.fillStyle = tx.c; ctx.fillText(tx.s, tx.x, tx.y); } ctx.textAlign = 'left'; ctx.globalAlpha = 1;
  ctx.restore();
  tileDraw(LAYERS.fg, 1.25, 0.55, 0);
  const dark = keyed(DARK, cx);
  if (dark > 0.02) {
    lx.globalCompositeOperation = 'source-over'; lx.clearRect(0, 0, VW, LH); lx.fillStyle = `rgba(10,14,60,${dark})`; lx.fillRect(0, 0, VW, LH);
    lx.globalCompositeOperation = 'destination-out';
    const hole = (x, y, r, a = 1) => { x -= S.camX; if (x < -r || x > VW + r) return; lx.globalAlpha = a; lx.drawImage(HOLE, x - r, y - r, r * 2, r * 2); };
    hole(P1.x, P1.y - 16, 84, 1);
    for (const st of stations) hole(st.x, st.y - 40, 100, 1);
    for (const o of orbs) if (!o.got) hole(o.x, o.y, 34, 0.9);
    for (const e of enemies) if (!e.dead && e.t === 'ghost') hole(e.x, e.y, 26, 0.7);
    for (const c of chests) if (c.open) hole(c.x, c.y - 30, 44, 0.8);
    hole(GATE.x, GATE.y - 50, 130, 1);
    lx.globalAlpha = 1;
    ctx.drawImage(lightC, 0, 0, VW, LH);
  }
  if (VIG) ctx.drawImage(VIG, 0, 0);
  if (S.mode === 'panel' || S.mode === 'pause') { ctx.fillStyle = 'rgba(20,26,70,.35)'; ctx.fillRect(0, 0, VW, LH); }
}

/* ================= LOOP ================= */
let last = performance.now(), lastZoneD = -1;
const STEP = 1 / 120;
function frame(now) {
  requestAnimationFrame(frame);
  const el = Math.min(0.05, Math.max(0, (now - last) / 1000)); last = now;
  if (!S.visible) return;
  S.t += el;
  if (S.mode === 'play' || S.mode === 'ending') {
    const n = Math.max(1, Math.ceil(el / STEP - 0.01)), dt = el / n;
    for (let i = 0; i < n; i++) {
      if (S.hit > 0) { S.hit -= dt; continue; }
      if (S.mode === 'play') { updatePlayer(dt); updateWorld(dt); }
      for (const k in pressed) pressed[k] = false;
      updateParts(dt);
    }
    const look = P1.face * 34 + clamp(P1.vx, -160, 160) * 0.12; const tx = clamp(P1.x - VW * 0.42 + look, 0, WORLD_W - VW);
    S.camX += (tx - S.camX) * (1 - Math.exp(-el * 5));
    S.shake *= Math.pow(0.002, el);
    const cx = S.camX + VW / 2, z = zoneAt(P1.x);
    if (z !== S.zone) { if (S.zone || S.t > 0.5) showZone(z); S.zone = z; }
    const d = keyed(DARK, cx) / 0.34; if (Math.abs(d - lastZoneD) > 0.03) { lastZoneD = d; AE.setZone(d, 1 - d); }
    hud();
  } else updateParts(el * 0.3);
  render(S.t);
}

/* ================= VISIBILITY / BOOT ================= */
function setVisible(v) {
  S.visible = v;
  if (v && S.mode === 'idle') { S.mode = 'play'; P1.y = -40; S.camX = 0; $('#soundHint').hidden = !!(AE.ctx && AE.ctx.state === 'running'); setTimeout(() => showZone(ZONES[0]), 600); if (AE.ctx && !S.introPlayed) { S.introPlayed = true; setTimeout(() => AE.playVoice('intro'), 900); } }
  AE.setActive(v && S.mode !== 'idle');
  if (!v) { keysClear(); if (S.mode === 'panel') AE.stopVoice(); }
}
new IntersectionObserver(es => es.forEach(e => setVisible(e.intersectionRatio > 0.55)), { threshold: [0, 0.55, 1] }).observe($('#game'));
document.addEventListener('visibilitychange', () => { if (document.hidden) { keysClear(); AE.ctx && AE.ctx.suspend(); } else if (AE.ctx) AE.ctx.resume(); });
addEventListener('resize', resize);

// skills list in quick view
const ALL_SKILLS = ['Python', 'C++', 'TypeScript', 'Go', 'PyTorch', 'Hugging Face', 'LangGraph', 'LangChain', 'LlamaIndex', 'Vector DBs', 'FastAPI', 'Docker', 'ONNX', 'PostgreSQL', 'Quantization-aware training', 'Fine-tuning', 'Google Earth Engine', 'Manim', 'CI/CD + Pytest', 'Linux'];
$('#skillList').innerHTML = ALL_SKILLS.map(s => `<span data-s="${s}">${s}</span>`).join('') + '<span class="note">Highlighted = collected during your run.</span>';
function markSkill(n) { const el = document.querySelector(`#skillList [data-s="${n}"]`); if (el) el.classList.add('got'); }

const go = () => { buildLayers(); resize(); hud(); $('#profFace').src = PORTRAIT; startTitle(); requestAnimationFrame(frame); };
(document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]) : Promise.resolve()).then(go);
})();
