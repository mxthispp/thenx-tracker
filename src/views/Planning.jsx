import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Check, ChevronRight, ShieldCheck } from 'lucide-react';
import { ACTIVITIES, DAY_NAMES, WEEKS, WORKOUTS, weekConfig } from '../data/program';
import { useStore } from '../lib/store';
import { formatShort, programDate, programWeekOf, toKey } from '../lib/dates';
import { dayStatus, isItemDone, weekProgress } from '../lib/stats';
import { ACCENTS, Card, Pill, SectionTitle, Toggle } from '../components/ui';

export default function Planning({ onStart }) {
  const { state, setSettings, toggleActivity } = useStore();
  const current = Math.min(Math.max(programWeekOf(new Date(), state.startDate), 1), 4);
  const [week, setWeek] = useState(current);
  const cfg = weekConfig(week, state.settings);
  const wp = weekProgress(state, week);
  const todayKey = toKey(new Date());
  const optimized = state.settings.scheduleVariant === 'optimized';

  return (
    <div className="space-y-6">
      <header className="pt-2">
        <div className="text-sm font-medium text-slate-400">Cycle de 4 semaines · Boxe mar./jeu. · Foot sam.</div>
        <h1 className="mt-1 text-[32px] font-black leading-none tracking-tight">Planning</h1>
      </header>

      {/* Sélecteur de semaine */}
      <div className="grid grid-cols-4 gap-2 rounded-3xl bg-ink-800/70 p-1.5 ring-1 ring-white/[0.06]">
        {WEEKS.map((w) => {
          const active = w.n === week;
          const p = weekProgress(state, w.n);
          return (
            <button key={w.n} onClick={() => setWeek(w.n)} className="relative rounded-[20px] px-1 py-2.5 text-center">
              {active && <motion.span layoutId="week-pill" className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-red-500 to-red-700 shadow-glow" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
              <span className="relative block text-[11px] font-semibold uppercase tracking-wider opacity-70">Sem.</span>
              <span className="relative block text-xl font-black leading-tight">{w.n}</span>
              <span className={`relative mx-auto mt-1 block h-1 w-8 overflow-hidden rounded-full ${active ? 'bg-white/30' : 'bg-white/10'}`}>
                <span className="block h-full bg-emerald-400" style={{ width: `${p.pct * 100}%` }} />
              </span>
              {w.n === current && !active && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={week} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }} className="space-y-6">
          <Card className="relative overflow-hidden p-5">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-red-500/20 blur-3xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-red-400">Semaine {cfg.n} · {cfg.level}</div>
                  <div className="text-2xl font-black">{cfg.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black tabular-nums">{Math.round(wp.pct * 100)}%</div>
                  <div className="text-xs text-slate-500">{wp.done}/{wp.total} validés</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <Stat label="Effort" value={`${cfg.work}s`} className="text-red-300" />
                <Stat label="Repos" value={`${cfg.rest}s`} className="text-emerald-300" />
                <Stat label="Tours" value={cfg.rounds} className="text-slate-100" />
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">{cfg.focus}</p>
              <div className="mt-2 divide-y divide-white/[0.06]">
                {cfg.n <= 2 && (
                  <Toggle
                    checked={state.settings.shortRest}
                    onChange={(v) => setSettings({ shortRest: v })}
                    label="Repos court (15 s)"
                    hint={`Remplace ${WEEKS[cfg.n - 1].rest}s par 15s de récupération.`}
                  />
                )}
                {cfg.deload && (
                  <Toggle
                    checked={state.settings.deload}
                    onChange={(v) => setSettings({ deload: v })}
                    label="Mode décharge (-20 %)"
                    hint="À activer si le foot et la boxe ont laissé de la fatigue : 32 s d’effort au lieu de 40 s."
                  />
                )}
              </div>
            </div>
          </Card>

          <Card className={`p-4 ${optimized ? 'ring-1 ring-emerald-500/30' : 'ring-1 ring-amber-500/25'}`}>
            <div className="flex gap-3">
              {optimized ? <ShieldCheck className="mt-0.5 shrink-0 text-emerald-400" size={20} /> : <AlertTriangle className="mt-0.5 shrink-0 text-amber-400" size={20} />}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold">{optimized ? 'Planning optimisé boxe actif' : 'Conflit détecté : Push mercredi → Boxe jeudi'}</div>
                <p className="mt-1 text-[13px] leading-relaxed text-slate-400">
                  {optimized
                    ? 'Pectoraux & Triceps passent le vendredi (lendemain de boxe), Abdos le mercredi. Aucune séance triceps/épaules la veille d’une boxe.'
                    : 'Ton planning place la séance Pectoraux & Triceps la veille de la boxe du jeudi. Le planning optimisé inverse mercredi et vendredi pour respecter ta règle.'}
                </p>
                <div className="-mb-2">
                  <Toggle checked={optimized} onChange={(v) => setSettings({ scheduleVariant: v ? 'optimized' : 'original' })} label="Planning optimisé boxe" />
                </div>
              </div>
            </div>
          </Card>

          <div>
            <SectionTitle>7 jours</SectionTitle>
            <div className="space-y-2.5">
              {DAY_NAMES.map((name, di) => {
                const date = programDate(state.startDate, week, di);
                const key = toKey(date);
                const s = dayStatus(state, date);
                const isToday = key === todayKey;
                return (
                  <motion.div
                    key={di}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: di * 0.03 }}
                    className={`rounded-3xl border p-4 ${isToday ? 'border-red-500/40 bg-red-500/[0.06]' : 'border-white/[0.06] bg-ink-800/60'}`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-bold">{name}</span>
                        <span className="text-xs text-slate-500">{formatShort(date)}</span>
                        {isToday && <Pill className="bg-red-500 text-white">Aujourd’hui</Pill>}
                      </div>
                      {s.complete && <span className="flex items-center gap-1 text-xs font-bold text-emerald-400"><Check size={14} strokeWidth={3} /> Validé</span>}
                    </div>
                    <div className="space-y-2">
                      {s.plan.session.length > 0 && (
                        <SessionRow wids={s.plan.session} done={s.plan.session.every((id) => isItemDone(state.log, key, { type: 'session', id }))} onClick={() => onStart(key, s.plan.session, week)} />
                      )}
                      {s.plan.items.filter((i) => i.type === 'activity').map((item) => {
                        const a = ACTIVITIES[item.id];
                        const done = isItemDone(state.log, key, item);
                        return (
                          <button key={item.id} onClick={() => toggleActivity(key, item.id)} className="flex w-full items-center gap-3 rounded-2xl bg-white/[0.03] px-3 py-2.5 text-left hover:bg-white/[0.05]">
                            <span className="text-xl">{a.emoji}</span>
                            <span className="flex-1 text-sm font-semibold">{a.title}{!item.required && <span className="ml-1 font-normal text-slate-500">(optionnel)</span>}</span>
                            <span className={`grid h-7 w-7 place-items-center rounded-full border-2 ${done ? 'border-emerald-500 bg-emerald-500 text-ink' : 'border-ink-500 text-transparent'}`}>
                              <Check size={14} strokeWidth={3} />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-2.5 text-[12.5px] leading-snug text-slate-500">{s.plan.note}</p>
                    {s.plan.warning && <p className="mt-1.5 flex gap-1.5 text-[12.5px] leading-snug text-amber-300/90"><AlertTriangle size={14} className="mt-px shrink-0" />{s.plan.warning}</p>}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Stat({ label, value, className }) {
  return (
    <div className="rounded-2xl bg-white/[0.04] py-3">
      <div className={`text-xl font-black tabular-nums ${className}`}>{value}</div>
      <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">{label}</div>
    </div>
  );
}

function SessionRow({ wids, done, onClick }) {
  return (
    <motion.button whileTap={{ scale: 0.98 }} onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl bg-white/[0.05] p-2.5 text-left hover:bg-white/[0.08]">
      <div className="flex -space-x-3">
        {wids.map((id) => (
          <img key={id} src={`https://i.ytimg.com/vi/${WORKOUTS[id].youtubeId}/mqdefault.jpg`} alt="" loading="lazy" className="h-12 w-16 rounded-xl bg-gradient-to-br from-ink-600 to-ink-700 object-cover ring-2 ring-ink-800" onError={(e) => { e.currentTarget.removeAttribute('src'); }} />
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap gap-1">
          {wids.map((id) => <span key={id} className={`text-[10px] font-bold uppercase tracking-wider ${ACCENTS[WORKOUTS[id].accent].text}`}>{WORKOUTS[id].tag}</span>)}
        </div>
        <div className="truncate text-sm font-bold">{wids.map((id) => WORKOUTS[id].title).join(' + ')}</div>
        <div className="text-xs text-slate-500">~{wids.reduce((a, id) => a + WORKOUTS[id].duration, 0)} min · THENX</div>
      </div>
      {done ? (
        <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-500 text-ink"><Check size={14} strokeWidth={3} /></span>
      ) : (
        <ChevronRight size={20} className="text-slate-500" />
      )}
    </motion.button>
  );
}
