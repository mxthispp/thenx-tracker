import { useEffect, useRef } from 'react';
import { msUntil, reminderText, showNotification } from './notifications';
import { dayTotals, targets } from './nutrition';
import { toKey } from './dates';

function mealText(state) {
  const key = toKey(new Date());
  const t = targets(state);
  const tot = dayTotals(state, key);
  const kcal = t.kcal - tot.kcal;
  if (kcal <= 0) return null;
  const p = Math.max(0, t.protein - Math.round(tot.p));
  return { title: '🍌 Pause collation', body: `Il te reste ${Math.round(kcal)} kcal${p ? ` et ${p} g de protéines` : ''} aujourd’hui. Un shake ou une poignée d’amandes ?` };
}

/**
 * Programme les rappels (séance + collations) tant que l'app est ouverte,
 * et rattrape un rappel du jour déjà passé mais pas encore envoyé.
 */
export function useDailyReminder(state, setSettings) {
  const stateRef = useRef(state);
  stateRef.current = state;
  const { notifications, reminderTime, mealReminders, mealTimes } = state.settings;

  useEffect(() => {
    const reminders = [];
    if (notifications) reminders.push({ id: 'session', time: reminderTime, text: reminderText, catchUp: true });
    if (notifications && mealReminders) mealTimes.forEach((time) => reminders.push({ id: `meal-${time}`, time, text: mealText, catchUp: false }));
    if (!reminders.length) return undefined;

    const sent = (s) => (typeof s.settings.lastNotified === 'object' && s.settings.lastNotified) || {};
    const fire = (r) => {
      const s = stateRef.current;
      const todayKey = toKey(new Date());
      if (sent(s)[r.id] === todayKey) return;
      const msg = r.text(s);
      if (msg) showNotification(msg.title, msg.body);
      setSettings({ lastNotified: { ...sent(stateRef.current), [r.id]: todayKey } });
    };

    const now = new Date();
    reminders.forEach((r) => {
      const [h, m] = r.time.split(':').map(Number);
      if (r.catchUp && now.getHours() * 60 + now.getMinutes() >= h * 60 + m) fire(r);
    });

    const timers = reminders.map((r) => {
      let id;
      const schedule = () => {
        id = setTimeout(() => {
          fire(r);
          schedule();
        }, Math.min(msUntil(r.time), 2 ** 31 - 1));
      };
      schedule();
      return () => clearTimeout(id);
    });
    return () => timers.forEach((clear) => clear());
  }, [notifications, reminderTime, mealReminders, mealTimes.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps
}
