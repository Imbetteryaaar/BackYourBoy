// Tiny zero-dependency sound engine using the Web Audio API.
// Mobile browsers require a user gesture before audio can start, so we lazily
// create + resume the context on the first play() call (which is always from a tap).

let ctx = null;
let muted = false;
try { muted = localStorage.getItem('byb_muted') === '1'; } catch (e) {}

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function blip(freq, start, dur, type = 'sine', vol = 0.18) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + start;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function slide(f1, f2, start, dur, type = 'sawtooth', vol = 0.15) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + start;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(f1, t);
  osc.frequency.exponentialRampToValueAtTime(f2, t + dur);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

const SOUNDS = {
  click:   () => blip(520, 0, 0.08, 'triangle', 0.12),
  pop:     () => { blip(660, 0, 0.07, 'square', 0.12); blip(990, 0.04, 0.08, 'square', 0.10); },
  add:     () => { blip(523, 0, 0.07, 'triangle', 0.16); blip(784, 0.06, 0.1, 'triangle', 0.16); },
  remove:  () => slide(500, 180, 0, 0.16, 'sawtooth', 0.12),
  tick:    () => blip(880, 0, 0.05, 'square', 0.08),
  urgent:  () => blip(1200, 0, 0.06, 'square', 0.14),
  bid:     () => { blip(440, 0, 0.08, 'square', 0.14); blip(660, 0.07, 0.1, 'square', 0.14); },
  bullshit:() => { slide(300, 90, 0, 0.45, 'sawtooth', 0.2); blip(120, 0.1, 0.4, 'square', 0.14); },
  whoosh:  () => slide(200, 900, 0, 0.25, 'sine', 0.1),
  success: () => { [523, 659, 784, 1047].forEach((f, i) => blip(f, i * 0.09, 0.18, 'triangle', 0.18)); },
  fail:    () => { [400, 330, 262, 200].forEach((f, i) => blip(f, i * 0.1, 0.2, 'sawtooth', 0.14)); },
  win:     () => { [523, 659, 784, 1047, 1319].forEach((f, i) => blip(f, i * 0.1, 0.25, 'triangle', 0.2)); blip(1568, 0.55, 0.4, 'triangle', 0.18); },
  doubt:   () => { blip(300, 0, 0.12, 'sawtooth', 0.14); blip(260, 0.13, 0.18, 'sawtooth', 0.14); },
};

export function play(name) {
  if (muted) return;
  const fn = SOUNDS[name];
  if (fn) try { fn(); } catch (e) {}
}

export function isMuted() { return muted; }
export function toggleMute() {
  muted = !muted;
  try { localStorage.setItem('byb_muted', muted ? '1' : '0'); } catch (e) {}
  return muted;
}
