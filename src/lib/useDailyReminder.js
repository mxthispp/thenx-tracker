import { useEffect, useRef } from 'react';
import { msUntil, reminderText, showNotification } from './notifications';
import { toKey } from './dates';

/** Programme le rappel quotidien tant que l'app est ouverte, et rattrape un rappel manqué du jour. */
export function useDailyReminder(state, setSettings) {
  const stateRef = useRef(state);
  stateRef.current = state;
  const { notifications, reminderTime, lastNotified } = state.settings;

  useEffect(() => {
    if (!notifications) return undefined;
    const fire = () => {
      const s = stateRef.current;
      const todayKey = toKey(new Date());
      if (s.settings.lastNotified === todayKey) return;
      const msg = reminderText(s);
      if (msg) showNotification(msg.title, msg.body);
      setSettings({ lastNotified: todayKey });
    };

    // Rappel de l'heure déjà passé aujourd'hui et pas encore envoyé → on l'envoie maintenant.
    const [h, m] = reminderTime.split(':').map(Number);
    const now = new Date();
    if (now.getHours() * 60 + now.getMinutes() >= h * 60 + m && lastNotified !== toKey(now)) fire();

    let timer;
    const schedule = () => {
      timer = setTimeout(() => {
        fire();
        schedule();
      }, Math.min(msUntil(reminderTime), 2 ** 31 - 1));
    };
    schedule();
    return () => clearTimeout(timer);
  }, [notifications, reminderTime]); // eslint-disable-line react-hooks/exhaustive-deps
}
