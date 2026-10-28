import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { mondayOf, toKey } from './dates';
import { defaultProfile } from './nutrition';

const STORAGE_KEY = 'thenx-tracker-v1';

const defaultState = () => ({
  version: 1,
  startDate: toKey(mondayOf(new Date())),
  log: {},
  profile: defaultProfile(),
  food: {},
  weights: {},
  water: {},
  customFoods: [],
  settings: {
    scheduleVariant: 'original',
    deload: false,
    shortRest: false,
    sound: true,
    voice: true,
    videoSync: true,
    notifications: false,
    reminderTime: '18:00',
    sessionTime: '18:30',
    icsIncludeSports: true,
    lastNotified: null,
    mealReminders: false,
    mealTimes: ['10:30', '16:30', '21:30'],
  },
});

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const base = defaultState();
    return merge(base, parsed);
  } catch {
    return defaultState();
  }
}

function merge(base, data) {
  return {
    ...base,
    ...data,
    settings: { ...base.settings, ...data.settings },
    profile: { ...base.profile, ...data.profile, ramp: { ...base.profile.ramp, ...data.profile?.ramp } },
  };
}

const uid = () => Math.random().toString(36).slice(2, 10);

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, setState] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* stockage indisponible (navigation privée) : l'app reste utilisable */
    }
  }, [state]);

  const updateDay = useCallback((key, fn) => {
    setState((s) => {
      const day = s.log[key] || { sessions: {}, activities: {} };
      return { ...s, log: { ...s.log, [key]: fn(day) } };
    });
  }, []);

  const actions = useMemo(() => ({
    setSettings: (patch) => setState((s) => ({ ...s, settings: { ...s.settings, ...patch } })),
    setStartDate: (key) => setState((s) => ({ ...s, startDate: key })),
    toggleActivity: (key, id) => updateDay(key, (d) => ({ ...d, activities: { ...d.activities, [id]: !d.activities?.[id] } })),
    setSessionDone: (key, wid, done) => updateDay(key, (d) => {
      const sess = d.sessions?.[wid] || { exercises: {} };
      return { ...d, sessions: { ...d.sessions, [wid]: { ...sess, done, completedAt: done ? new Date().toISOString() : null } } };
    }),
    updateSession: (key, wid, patch) => updateDay(key, (d) => {
      const sess = d.sessions?.[wid] || { exercises: {} };
      return { ...d, sessions: { ...d.sessions, [wid]: { ...sess, ...patch } } };
    }),
    updateExercise: (key, wid, exId, patch) => updateDay(key, (d) => {
      const sess = d.sessions?.[wid] || { exercises: {} };
      const ex = sess.exercises?.[exId] || {};
      return {
        ...d,
        sessions: { ...d.sessions, [wid]: { ...sess, exercises: { ...sess.exercises, [exId]: { ...ex, ...patch } } } },
      };
    }),
    setProfile: (patch) => setState((s) => ({ ...s, profile: { ...s.profile, ...patch } })),
    addFood: (key, entry) => setState((s) => ({
      ...s,
      food: { ...s.food, [key]: [...(s.food[key] || []), { id: uid(), at: new Date().toISOString(), ...entry }] },
    })),
    removeFood: (key, id) => setState((s) => ({ ...s, food: { ...s.food, [key]: (s.food[key] || []).filter((e) => e.id !== id) } })),
    addCustomFood: (food) => setState((s) => ({ ...s, customFoods: [...s.customFoods, { ...food, id: `custom-${uid()}`, cat: 'perso' }] })),
    removeCustomFood: (id) => setState((s) => ({ ...s, customFoods: s.customFoods.filter((f) => f.id !== id) })),
    setWeight: (key, kg) => setState((s) => {
      const weights = { ...s.weights };
      if (kg == null) delete weights[key];
      else weights[key] = kg;
      return { ...s, weights };
    }),
    addWater: (key, ml) => setState((s) => ({ ...s, water: { ...s.water, [key]: Math.max(0, (s.water[key] || 0) + ml) } })),
    replaceAll: (next) => setState(merge(defaultState(), next)),
    reset: () => setState(defaultState()),
  }), [updateDay]);

  const value = useMemo(() => ({ state, ...actions }), [state, actions]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  return useContext(StoreContext);
}

export function exportBackup(state) {
  const blob = new Blob([JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `thenx-sauvegarde-${toKey(new Date())}.json`);
}

export async function parseBackup(file) {
  const data = JSON.parse(await file.text());
  if (!data || typeof data !== 'object' || !data.log || !data.startDate) {
    throw new Error('Fichier de sauvegarde invalide.');
  }
  return data;
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
