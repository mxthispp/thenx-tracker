export const DAY_MS = 86400000;

export function toKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function startOfDay(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** 0 = lundi … 6 = dimanche */
export function dow(d) {
  return (d.getDay() + 6) % 7;
}

export function mondayOf(d = new Date()) {
  return addDays(startOfDay(d), -dow(d));
}

export function diffDays(a, b) {
  return Math.round((startOfDay(a) - startOfDay(b)) / DAY_MS);
}

/** Semaine du programme (1-4) pour une date, 0 si avant le début, 5+ si terminé. */
export function programWeekOf(date, startKey) {
  const diff = diffDays(date, fromKey(startKey));
  if (diff < 0) return 0;
  return Math.floor(diff / 7) + 1;
}

export function programDate(startKey, week, dayIdx) {
  return addDays(fromKey(startKey), (week - 1) * 7 + dayIdx);
}

const fmtLong = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
const fmtShort = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
const fmtMonth = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' });

export const formatLong = (d) => fmtLong.format(d);
export const formatShort = (d) => fmtShort.format(d);
export const formatMonth = (d) => fmtMonth.format(d);
