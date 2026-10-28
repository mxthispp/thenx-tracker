// Synthétiseur Web Audio + synthèse vocale pour le timer HIIT.
let ctx = null;

export function unlockAudio() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, duration, { type = 'sine', gain = 0.35, delay = 0 } = {}) {
  const ac = unlockAudio();
  if (!ac) return;
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

/** Bip court du décompte 3-2-1. */
export const countdownBeep = () => tone(880, 0.12, { type: 'square', gain: 0.18 });

/** Bip long au changement de phase : aigu pour l'effort, grave pour le repos. */
export function phaseBeep(phase) {
  if (phase === 'work') {
    tone(1320, 0.55, { type: 'square', gain: 0.2 });
  } else if (phase === 'done') {
    tone(660, 0.18, { gain: 0.3 });
    tone(880, 0.18, { gain: 0.3, delay: 0.2 });
    tone(1320, 0.5, { gain: 0.3, delay: 0.4 });
  } else {
    tone(520, 0.6, { type: 'triangle', gain: 0.35 });
  }
}

let frVoice = null;
function pickVoice() {
  if (!('speechSynthesis' in window)) return null;
  if (frVoice) return frVoice;
  const voices = window.speechSynthesis.getVoices();
  frVoice = voices.find((v) => v.lang?.startsWith('fr') && /Thomas|Amélie|Google/i.test(v.name))
    || voices.find((v) => v.lang?.startsWith('fr')) || null;
  return frVoice;
}
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => { frVoice = null; pickVoice(); };
}

export function speak(text) {
  if (!('speechSynthesis' in window)) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'fr-FR';
  u.rate = 1.05;
  const v = pickVoice();
  if (v) u.voice = v;
  synth.speak(u);
}

export const speechSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window;
