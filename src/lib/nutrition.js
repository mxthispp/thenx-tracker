import { addDays, diffDays, fromKey, startOfDay, toKey } from './dates';

export const ACTIVITY_LEVELS = [
  { id: 'moderate', label: 'Modéré', hint: '3–4 séances / semaine', factor: 1.55 },
  { id: 'active', label: 'Très actif', hint: 'THENX + boxe ×2 + foot', factor: 1.725 },
  { id: 'athlete', label: 'Athlète', hint: 'Entraînement quasi quotidien + job physique', factor: 1.9 },
];

export const GOALS = [
  { id: 'lean', label: 'Prise de masse propre', surplus: 300, hint: '+0,25 kg / semaine visé' },
  { id: 'bulk', label: 'Prise de masse', surplus: 450, hint: '+0,4 kg / semaine visé' },
  { id: 'maintain', label: 'Maintien', surplus: 0, hint: 'Poids stable' },
];

export const RAMP_STEP = 150; // kcal ajoutées chaque semaine en montée progressive

export const defaultProfile = () => ({
  name: 'Mathis',
  sex: 'male',
  age: 20,
  height: 182,
  weight: 66,
  activity: 'active',
  goal: 'lean',
  adjustment: 0,
  lastAdjustAt: null,
  ramp: { enabled: true, startKcal: 2300, startDate: toKey(startOfDay(new Date())) },
});

const round = (n, step = 50) => Math.round(n / step) * step;

/** Dernier poids saisi, sinon celui du profil. */
export function currentWeight(state) {
  const keys = Object.keys(state.weights || {}).sort();
  return keys.length ? state.weights[keys[keys.length - 1]] : state.profile.weight;
}

/** Métabolisme de base (Mifflin-St Jeor). */
export function bmr({ sex, age, height }, weight) {
  return 10 * weight + 6.25 * height - 5 * age + (sex === 'female' ? -161 : 5);
}

export function targets(state, date = new Date()) {
  const { profile } = state;
  const weight = currentWeight(state);
  const factor = ACTIVITY_LEVELS.find((a) => a.id === profile.activity)?.factor ?? 1.725;
  const surplus = GOALS.find((g) => g.id === profile.goal)?.surplus ?? 300;
  const base = bmr(profile, weight);
  const maintenance = base * factor;
  const full = round(maintenance + surplus + (profile.adjustment || 0));

  let kcal = full;
  let rampWeek = null;
  if (profile.ramp?.enabled && profile.ramp.startKcal < full) {
    const weeks = Math.max(0, Math.floor(diffDays(date, fromKey(profile.ramp.startDate)) / 7));
    kcal = Math.min(full, round(profile.ramp.startKcal + weeks * RAMP_STEP));
    rampWeek = kcal < full ? weeks + 1 : null;
  }

  const protein = Math.round(weight * 2);
  const fat = Math.round(Math.max(weight * 0.9, (kcal * 0.27) / 9));
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  const water = Math.round((weight * 35 + 500) / 250) * 250;

  return { kcal, full, maintenance: round(maintenance), bmr: Math.round(base), protein, fat, carbs, water, weight, rampWeek };
}

export function dayFood(state, key) {
  return state.food?.[key] || [];
}

export function dayTotals(state, key) {
  return dayFood(state, key).reduce(
    (t, e) => ({ kcal: t.kcal + e.kcal, p: t.p + e.p, c: t.c + e.c, f: t.f + e.f, count: t.count + 1 }),
    { kcal: 0, p: 0, c: 0, f: 0, count: 0 },
  );
}

/** Points de poids triés, avec moyenne glissante sur 7 jours. */
export function weightSeries(state) {
  const entries = Object.entries(state.weights || {}).sort(([a], [b]) => (a < b ? -1 : 1));
  return entries.map(([key, kg]) => {
    const d = fromKey(key);
    const window = entries.filter(([k]) => {
      const diff = diffDays(d, fromKey(k));
      return diff >= 0 && diff < 7;
    });
    const avg = window.reduce((a, [, v]) => a + v, 0) / window.length;
    return { key, date: d, kg, avg };
  });
}

/** Pente en kg/semaine (régression linéaire) sur les `days` derniers jours. */
export function weeklyRate(state, days = 14, today = new Date()) {
  const from = addDays(startOfDay(today), -days);
  const pts = weightSeries(state).filter((p) => p.date >= from);
  if (pts.length < 4) return null;
  const span = diffDays(pts[pts.length - 1].date, pts[0].date);
  if (span < 7) return null;
  const xs = pts.map((p) => diffDays(p.date, from));
  const ys = pts.map((p) => p.kg);
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
  const my = ys.reduce((a, b) => a + b, 0) / ys.length;
  const num = xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0);
  const den = xs.reduce((a, x) => a + (x - mx) ** 2, 0);
  return den ? (num / den) * 7 : null;
}

/** Ajustement proposé quand la courbe de poids sort de la cible. */
export function adjustmentSuggestion(state, today = new Date()) {
  const { profile } = state;
  if (profile.lastAdjustAt && diffDays(today, fromKey(profile.lastAdjustAt)) < 14) return null;
  const t = targets(state, today);
  if (t.rampWeek) return null; // on laisse la montée progressive finir
  const rate = weeklyRate(state, 14, today);
  if (rate == null) return null;
  const goal = profile.goal;
  if (goal === 'maintain') {
    if (rate > 0.25) return { delta: -150, rate, reason: 'Tu prends du poids alors que tu vises le maintien.' };
    if (rate < -0.25) return { delta: 150, rate, reason: 'Tu perds du poids alors que tu vises le maintien.' };
    return null;
  }
  const [min, max] = goal === 'bulk' ? [0.25, 0.6] : [0.15, 0.45];
  if (rate < min) return { delta: 200, rate, reason: 'Ton poids stagne sur 2 semaines : ton corps brûle plus que prévu.' };
  if (rate > max) return { delta: -150, rate, reason: 'Tu montes un peu vite : on limite la prise de gras.' };
  return null;
}

/** Jours de suite où l'objectif protéines a été atteint (aujourd'hui ne casse pas la série). */
export function proteinStreak(state, today = new Date()) {
  let n = 0;
  let d = startOfDay(today);
  for (let i = 0; i < 365; i++) {
    const key = toKey(d);
    const ok = dayTotals(state, key).p >= targets(state, d).protein;
    if (ok) n++;
    else if (i > 0) break;
    d = addDays(d, -1);
  }
  return n;
}
