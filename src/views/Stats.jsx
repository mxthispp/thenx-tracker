import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, CalendarPlus, ChevronLeft, ChevronRight, Download, Flame, RotateCcw, Trophy, Upload } from 'lucide-react';
import { DAY_SHORT, WORKOUTS } from '../data/program';
import { downloadBlob, exportBackup, parseBackup, useStore } from '../lib/store';
import { addDays, formatMonth, fromKey, mondayOf, toKey } from '../lib/dates';
import { bestStreak, currentStreak, totals } from '../lib/stats';
import { buildIcs } from '../lib/ics';
import { notificationsSupported, requestPermission, showNotification } from '../lib/notifications';
import { ACCENTS, Button, Card, SectionTitle, Toggle } from '../components/ui';

export default function Stats() {
  const { state, setSettings, setStartDate, replaceAll, reset } = useStore();
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [toast, setToast] = useState(null);
  const fileRef = useRef(null);
  const t = totals(state);
  const streak = currentStreak(state);
  const best = bestStreak(state);

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const toggleNotifications = async (on) => {
    if (!on) return setSettings({ notifications: false });
    const perm = await requestPermission();
    if (perm === 'granted') {
      setSettings({ notifications: true });
      showNotification('Rappels activés ✅', `Rappel quotidien à ${state.settings.reminderTime} pour ta séance THENX.`);
    } else {
      flash(perm === 'unsupported' ? 'Notifications non supportées sur ce navigateur.' : 'Permission refusée dans le navigateur.');
    }
  };

  const exportIcs = () => {
    downloadBlob(new Blob([buildIcs(state)], { type: 'text/calendar;charset=utf-8' }), 'programme-thenx-4-semaines.ics');
    flash('Fichier .ics téléchargé — ouvre-le pour l’ajouter à ton calendrier.');
  };

  const onImport = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      replaceAll(await parseBackup(file));
      flash('Sauvegarde restaurée ✅');
    } catch (err) {
      flash(err.message || 'Import impossible.');
    }
  };

  // Grille du mois (lundi en premier)
  const gridStart = mondayOf(month);
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  const lastRowNeeded = cells.findLastIndex((d) => d.getMonth() === month.getMonth());
  const visible = cells.slice(0, Math.ceil((lastRowNeeded + 1) / 7) * 7);
  const todayKey = toKey(new Date());

  return (
    <div className="space-y-6">
      <header className="pt-2">
        <div className="text-sm font-medium text-slate-400">Historique · Rappels · Sauvegarde</div>
        <h1 className="mt-1 text-[32px] font-black leading-none tracking-tight">Statistiques</h1>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={<Flame size={18} className="text-orange-400" fill="currentColor" />} label="Série actuelle" value={streak} unit="j" />
        <StatTile icon={<Trophy size={18} className="text-amber-400" />} label="Meilleure série" value={best} unit="j" />
        <StatTile label="Séances THENX" value={t.sessions} sub={`${t.minutes} min`} />
        <StatTile label="RPE moyen" value={t.avgRpe ? t.avgRpe.toFixed(1) : '—'} sub={`🥊 ${t.boxe} · ⚽ ${t.foot}`} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 [&>*]:min-w-0">
        <div>
          <SectionTitle>Calendrier</SectionTitle>
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/5" aria-label="Mois précédent"><ChevronLeft size={20} /></button>
              <div className="text-base font-bold capitalize">{formatMonth(month)}</div>
              <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/5" aria-label="Mois suivant"><ChevronRight size={20} /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {DAY_SHORT.map((d) => <div key={d} className="pb-1 text-[11px] font-semibold text-slate-500">{d}</div>)}
              {visible.map((d) => {
                const key = toKey(d);
                const log = state.log[key];
                const inMonth = d.getMonth() === month.getMonth();
                const thenx = log && Object.values(log.sessions || {}).some((s) => s.done);
                const boxe = log?.activities?.boxe;
                const foot = log?.activities?.foot || log?.activities?.footRecup;
                const any = thenx || boxe || foot;
                return (
                  <div
                    key={key}
                    className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm ${inMonth ? '' : 'opacity-25'} ${key === todayKey ? 'ring-1 ring-red-500' : ''} ${any ? 'bg-white/[0.05]' : ''}`}
                  >
                    <span className={`tabular-nums ${any ? 'font-bold' : 'text-slate-400'}`}>{d.getDate()}</span>
                    <span className="mt-0.5 flex h-1.5 gap-0.5">
                      {thenx && <span className="h-1.5 w-1.5 rounded-full bg-red-500" />}
                      {boxe && <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />}
                      {foot && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex justify-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" />Renfo THENX</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-400" />Boxe</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" />Foot</span>
            </div>
          </Card>

          <div className="mt-6" />
          <SectionTitle>Répartition</SectionTitle>
          <Card className="space-y-3 p-5">
            {Object.values(WORKOUTS).map((w) => {
              const n = t.perWorkout[w.id] || 0;
              const max = Math.max(1, ...Object.values(t.perWorkout));
              return (
                <div key={w.id}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium">{w.title}</span>
                    <span className="tabular-nums text-slate-400">{n}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                    <motion.div className={`h-full rounded-full bg-gradient-to-r ${ACCENTS[w.accent].grad}`} initial={{ width: 0 }} animate={{ width: `${(n / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </Card>
        </div>

        <div className="space-y-6">
          <div>
            <SectionTitle>Rappels & calendrier</SectionTitle>
            <Card className="divide-y divide-white/[0.06] px-5">
              <Toggle
                checked={state.settings.notifications}
                onChange={toggleNotifications}
                disabled={!notificationsSupported()}
                label={<span className="flex items-center gap-2">{state.settings.notifications ? <Bell size={16} className="text-emerald-400" /> : <BellOff size={16} className="text-slate-500" />}Rappel quotidien</span>}
                hint={notificationsSupported() ? 'Notification navigateur si la séance du jour n’est pas encore faite.' : 'Non supporté ici (sur iPhone : installe l’app sur l’écran d’accueil).'}
              />
              <TimeRow label="Heure du rappel" value={state.settings.reminderTime} onChange={(v) => setSettings({ reminderTime: v, lastNotified: null })} />
              <TimeRow label="Heure des séances (.ics)" value={state.settings.sessionTime} onChange={(v) => setSettings({ sessionTime: v })} />
              <Toggle checked={state.settings.icsIncludeSports} onChange={(v) => setSettings({ icsIncludeSports: v })} label="Inclure Boxe & Foot" hint="Ajoutés en évènements « journée entière »." />
              <div className="py-4">
                <Button className="w-full" onClick={exportIcs}><CalendarPlus size={18} /> Exporter vers mon Calendrier (.ics)</Button>
                <p className="mt-2 text-center text-xs text-slate-500">4 semaines · liens YouTube · alerte 30 min avant chaque séance</p>
              </div>
              {state.settings.notifications && (
                <div className="py-3">
                  <Button variant="ghost" className="w-full" onClick={() => showNotification('Test THENX 🔥', 'Les notifications fonctionnent !')}>Tester une notification</Button>
                </div>
              )}
            </Card>
            <p className="mt-2 px-1 text-xs leading-relaxed text-slate-500">
              Les notifications web ne partent que lorsque l’app est ouverte (ou installée et active en arrière-plan). Pour des rappels garantis, combine-les avec l’export calendrier.
            </p>
          </div>

          <div>
            <SectionTitle>Programme & sauvegarde</SectionTitle>
            <Card className="divide-y divide-white/[0.06] px-5">
              <label className="flex items-center justify-between gap-4 py-3">
                <span>
                  <span className="block text-[15px] font-medium">Début du cycle (lundi)</span>
                  <span className="block text-[13px] text-slate-400">Semaine 1 commence ce jour-là.</span>
                </span>
                <input
                  type="date"
                  value={state.startDate}
                  onChange={(e) => e.target.value && setStartDate(toKey(mondayOf(fromKey(e.target.value))))}
                  className="rounded-xl border border-white/10 bg-ink px-3 py-2 text-sm outline-none [color-scheme:dark] focus:border-red-500"
                />
              </label>
              <div className="grid grid-cols-2 gap-2 py-4">
                <Button variant="ghost" onClick={() => exportBackup(state)}><Download size={18} /> Export JSON</Button>
                <Button variant="ghost" onClick={() => fileRef.current?.click()}><Upload size={18} /> Import JSON</Button>
                <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onImport} />
              </div>
              <div className="py-3">
                <button
                  onClick={() => window.confirm('Effacer tout l’historique et les réglages ?') && reset()}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/10"
                >
                  <RotateCcw size={16} /> Réinitialiser les données
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {toast && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-sm rounded-2xl bg-white px-4 py-3 text-center text-sm font-semibold text-ink shadow-2xl md:bottom-8">
          {toast}
        </motion.div>
      )}
    </div>
  );
}

function StatTile({ icon, label, value, unit, sub }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">{icon}{label}</div>
      <div className="mt-2 text-3xl font-black tabular-nums">{value}<span className="ml-0.5 text-base text-slate-500">{unit}</span></div>
      {sub && <div className="mt-0.5 text-xs text-slate-500">{sub}</div>}
    </Card>
  );
}

function TimeRow({ label, value, onChange }) {
  return (
    <label className="flex items-center justify-between gap-4 py-3">
      <span className="text-[15px] font-medium">{label}</span>
      <input type="time" value={value} onChange={(e) => onChange(e.target.value)} className="rounded-xl border border-white/10 bg-ink px-3 py-2 text-sm tabular-nums outline-none [color-scheme:dark] focus:border-red-500" />
    </label>
  );
}

