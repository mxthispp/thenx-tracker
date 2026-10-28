import { WORKOUTS, getSchedule } from '../data/program';
import { addDays, dow, fromKey, programDate, startOfDay, toKey } from './dates';

/** Éléments à valider pour une date donnée (séances THENX + sports). */
export function dayPlan(date, settings) {
  const day = getSchedule(settings.scheduleVariant)[dow(date)];
  const items = [
    ...day.session.map((wid) => ({ type: 'session', id: wid, required: true })),
    ...day.activities.map((aid) => ({ type: 'activity', id: aid, required: !aid.endsWith('Recup') && aid !== 'course' })),
  ];
  return { ...day, items };
}

export function isItemDone(log, key, item) {
  const d = log[key];
  if (!d) return false;
  return item.type === 'session' ? !!d.sessions?.[item.id]?.done : !!d.activities?.[item.id];
}

export function dayStatus(state, date) {
  const key = toKey(date);
  const plan = dayPlan(date, state.settings);
  const required = plan.items.filter((i) => i.required);
  const done = required.filter((i) => isItemDone(state.log, key, i)).length;
  return { key, plan, done, total: required.length, complete: required.length > 0 && done === required.length };
}

export function weekProgress(state, week) {
  let done = 0;
  let total = 0;
  for (let i = 0; i < 7; i++) {
    const s = dayStatus(state, programDate(state.startDate, week, i));
    done += s.done;
    total += s.total;
  }
  return { done, total, pct: total ? done / total : 0 };
}

export function programProgress(state) {
  let done = 0;
  let total = 0;
  for (let w = 1; w <= 4; w++) {
    const p = weekProgress(state, w);
    done += p.done;
    total += p.total;
  }
  return { done, total, pct: total ? done / total : 0 };
}

/** Jours consécutifs validés ; aujourd'hui non encore validé ne casse pas la série. */
export function currentStreak(state, today = new Date()) {
  const start = fromKey(state.startDate);
  let streak = 0;
  let d = startOfDay(today);
  for (let guard = 0; guard < 3650; guard++) {
    if (d < start) break;
    const s = dayStatus(state, d);
    if (s.complete) streak++;
    else if (guard > 0) break;
    d = addDays(d, -1);
  }
  return streak;
}

export function bestStreak(state) {
  const keys = Object.keys(state.log).sort();
  if (!keys.length) return 0;
  let best = 0;
  let run = 0;
  let d = fromKey(keys[0] < state.startDate ? keys[0] : state.startDate);
  const end = startOfDay(new Date());
  while (d <= end) {
    if (dayStatus(state, d).complete) best = Math.max(best, ++run);
    else run = 0;
    d = addDays(d, 1);
  }
  return best;
}

export function totals(state) {
  let sessions = 0;
  let minutes = 0;
  let boxe = 0;
  let foot = 0;
  const rpes = [];
  const perWorkout = Object.fromEntries(Object.keys(WORKOUTS).map((k) => [k, 0]));
  for (const day of Object.values(state.log)) {
    for (const [wid, s] of Object.entries(day.sessions || {})) {
      if (!s.done) continue;
      sessions++;
      perWorkout[wid] = (perWorkout[wid] || 0) + 1;
      minutes += WORKOUTS[wid]?.duration || 0;
      for (const ex of Object.values(s.exercises || {})) if (ex.rpe) rpes.push(Number(ex.rpe));
    }
    if (day.activities?.boxe) boxe++;
    if (day.activities?.foot || day.activities?.footRecup) foot++;
  }
  const avgRpe = rpes.length ? rpes.reduce((a, b) => a + b, 0) / rpes.length : null;
  return { sessions, minutes, boxe, foot, avgRpe, perWorkout };
}
