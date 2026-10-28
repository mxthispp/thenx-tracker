import { useCallback, useEffect, useRef, useState } from 'react';
import { countdownBeep, phaseBeep, speak, unlockAudio } from './audio';

/**
 * Moteur de timer HIIT basé sur l'horloge réelle (pas de dérive si l'onglet ralentit).
 * Déclenche les bips 3-2-1, le bip long de changement de phase et l'annonce vocale.
 */
export function useIntervalTimer(sequence, { sound = true, voice = true, onIntervalStart, onComplete } = {}) {
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(sequence[0]?.duration * 1000 || 0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);

  const endAt = useRef(0);
  const indexRef = useRef(0);
  const lastBeep = useRef(null);
  const wakeLock = useRef(null);
  const opts = useRef({});
  opts.current = { sound, voice, onIntervalStart, onComplete };

  const announce = useCallback((iv, isStart) => {
    const { sound: s, voice: v, onIntervalStart: cb } = opts.current;
    if (s && !isStart) phaseBeep(iv.phase);
    if (v) {
      if (iv.phase === 'prep') speak(`Préparez-vous. Premier exercice : ${iv.next}`);
      else if (iv.phase === 'work') speak(iv.label);
      else if (iv.next) speak(`${iv.phase === 'transition' ? 'Transition' : 'Repos'}. Prochain exercice : ${iv.next}`);
    }
    cb?.(iv, indexRef.current);
  }, []);

  // Réinitialise quand la séquence change (changement de semaine, de préréglage…)
  useEffect(() => {
    setRunning(false);
    setFinished(false);
    setIndex(0);
    indexRef.current = 0;
    setRemaining((sequence[0]?.duration || 0) * 1000);
  }, [sequence]);

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => {
      let rem = endAt.current - Date.now();
      const sec = Math.ceil(rem / 1000);
      if (sec <= 3 && sec >= 1 && lastBeep.current !== `${indexRef.current}-${sec}`) {
        lastBeep.current = `${indexRef.current}-${sec}`;
        if (opts.current.sound) countdownBeep();
      }
      if (rem <= 0) {
        const next = indexRef.current + 1;
        if (next >= sequence.length) {
          setRunning(false);
          setFinished(true);
          setRemaining(0);
          if (opts.current.sound) phaseBeep('done');
          if (opts.current.voice) speak('Séance terminée. Bravo !');
          opts.current.onComplete?.();
          return;
        }
        indexRef.current = next;
        endAt.current += sequence[next].duration * 1000;
        rem = endAt.current - Date.now();
        setIndex(next);
        announce(sequence[next], false);
      }
      setRemaining(Math.max(rem, 0));
    }, 100);
    return () => clearInterval(id);
  }, [running, sequence, announce]);

  // Garde l'écran allumé pendant l'entraînement.
  useEffect(() => {
    if (!running || !('wakeLock' in navigator)) return undefined;
    let released = false;
    navigator.wakeLock.request('screen').then((l) => {
      if (released) l.release();
      else wakeLock.current = l;
    }).catch(() => {});
    return () => {
      released = true;
      wakeLock.current?.release().catch(() => {});
      wakeLock.current = null;
    };
  }, [running]);

  const start = useCallback(() => {
    unlockAudio();
    if (finished) {
      indexRef.current = 0;
      setIndex(0);
      setFinished(false);
      endAt.current = Date.now() + sequence[0].duration * 1000;
      announce(sequence[0], true);
    } else {
      endAt.current = Date.now() + remaining;
      if (indexRef.current === 0 && remaining === sequence[0].duration * 1000) announce(sequence[0], true);
    }
    setRunning(true);
  }, [finished, remaining, sequence, announce]);

  const pause = useCallback(() => {
    setRunning(false);
    setRemaining(Math.max(endAt.current - Date.now(), 0));
    window.speechSynthesis?.cancel();
  }, []);

  const jump = useCallback((to) => {
    const i = Math.min(Math.max(to, 0), sequence.length - 1);
    indexRef.current = i;
    setIndex(i);
    setFinished(false);
    const dur = sequence[i].duration * 1000;
    setRemaining(dur);
    endAt.current = Date.now() + dur;
    if (running) announce(sequence[i], false);
  }, [sequence, running, announce]);

  const reset = useCallback(() => {
    setRunning(false);
    setFinished(false);
    indexRef.current = 0;
    setIndex(0);
    setRemaining(sequence[0].duration * 1000);
    window.speechSynthesis?.cancel();
  }, [sequence]);

  const current = sequence[index];
  const elapsedTotal = sequence.slice(0, index).reduce((a, s) => a + s.duration, 0) + (current ? current.duration - remaining / 1000 : 0);
  const total = sequence.reduce((a, s) => a + s.duration, 0);

  return {
    index, current, remaining, running, finished, total, elapsedTotal,
    start, pause, reset,
    next: () => jump(index + 1),
    prev: () => jump(remaining < (current.duration - 2) * 1000 ? index : index - 1),
  };
}
