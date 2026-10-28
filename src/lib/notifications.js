import { WORKOUTS } from '../data/program';
import { dayPlan, isItemDone } from './stats';
import { toKey } from './dates';

export const notificationsSupported = () => typeof window !== 'undefined' && 'Notification' in window;

export async function requestPermission() {
  if (!notificationsSupported()) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  return Notification.requestPermission();
}

export async function showNotification(title, body) {
  if (!notificationsSupported() || Notification.permission !== 'granted') return false;
  const options = { body, icon: './icons/icon-192.png', badge: './icons/icon-192.png', tag: 'thenx-daily', renotify: true };
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) {
      await reg.showNotification(title, options);
      return true;
    }
  } catch {
    /* repli sur l'API directe */
  }
  new Notification(title, options);
  return true;
}

export function reminderText(state, date = new Date()) {
  const plan = dayPlan(date, state.settings);
  const key = toKey(date);
  const pending = plan.items.filter((i) => i.type === 'session' && !isItemDone(state.log, key, i));
  if (!pending.length) return null;
  const names = pending.map((i) => WORKOUTS[i.id].title).join(' + ');
  return { title: '🔥 Séance THENX du jour', body: `${names} t’attend. ${plan.note}` };
}

/** Millisecondes jusqu'au prochain rappel (aujourd'hui si pas encore passé, sinon demain). */
export function msUntil(time, now = new Date()) {
  const [h, m] = time.split(':').map(Number);
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
  if (target <= now) target.setDate(target.getDate() + 1);
  return target - now;
}
