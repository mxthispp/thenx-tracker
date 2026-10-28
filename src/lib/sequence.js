import { WORKOUTS, PREP_SECONDS } from '../data/program';

/**
 * Construit la suite d'intervalles du timer pour une ou plusieurs séances (combo dimanche).
 * Chaque intervalle : { phase: 'prep'|'work'|'rest'|'transition', duration, label, exId, workoutId, round, rounds, next }
 */
export function buildWorkoutSequence(workoutIds, cfg) {
  const seq = [];
  workoutIds.forEach((wid, wi) => {
    const w = WORKOUTS[wid];
    // La routine abdos suit le format vidéo : 6 × 1 min (effort + repos = 60 s).
    const work = w.fixedFormat ? Math.min(cfg.work, 50) : cfg.work;
    const rest = w.fixedFormat ? 60 - work : cfg.rest;
    const rounds = w.fixedFormat ? 1 : cfg.rounds;
    if (wi > 0) {
      seq.push({ phase: 'transition', duration: cfg.transition, label: `Transition → ${w.title}`, workoutId: wid });
    }
    for (let r = 1; r <= rounds; r++) {
      w.exercises.forEach((ex, ei) => {
        seq.push({ phase: 'work', duration: work, label: ex.name, sub: ex.fr, exId: ex.id, ts: ex.ts, workoutId: wid, round: r, rounds, lastRound: r === rounds });
        const lastInRound = ei === w.exercises.length - 1;
        if (!lastInRound) seq.push({ phase: 'rest', duration: rest, label: 'Repos', workoutId: wid, round: r, rounds });
        else if (r < rounds) seq.push({ phase: 'rest', duration: cfg.roundRest, label: `Fin du tour ${r}`, workoutId: wid, round: r, rounds });
      });
    }
  });
  return finalize(seq);
}

/** Timer libre : N intervalles effort/repos, éventuellement nommés d'après une séance. */
export function buildGenericSequence({ work, rest, rounds, workoutId }) {
  const names = workoutId ? WORKOUTS[workoutId].exercises : null;
  const seq = [];
  for (let i = 0; i < rounds; i++) {
    const ex = names ? names[i % names.length] : null;
    seq.push({ phase: 'work', duration: work, label: ex ? ex.name : `Intervalle ${i + 1}`, sub: ex?.fr, exId: ex?.id, round: i + 1, rounds });
    if (i < rounds - 1) seq.push({ phase: 'rest', duration: rest, label: 'Repos', round: i + 1, rounds });
  }
  return finalize(seq);
}

function finalize(seq) {
  const first = seq.find((s) => s.phase === 'work');
  const out = [{ phase: 'prep', duration: PREP_SECONDS, label: 'Préparation', next: first?.label }, ...seq.filter((s) => s.duration > 0)];
  for (let i = 0; i < out.length; i++) {
    if (out[i].phase !== 'work') out[i].next = out.slice(i + 1).find((s) => s.phase === 'work')?.label;
  }
  return out;
}

export function sequenceDuration(seq) {
  return seq.reduce((a, s) => a + s.duration, 0);
}
