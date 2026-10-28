import { motion } from 'framer-motion';
import { AlertTriangle, Check, ChevronRight, Clock, Flame, Play, Plus, Trophy } from 'lucide-react';
import { FOODS } from '../data/foods';
import { dayTotals, targets } from '../lib/nutrition';
import { ACTIVITIES, DAY_SHORT, WORKOUTS, weekConfig } from '../data/program';
import { useStore } from '../lib/store';
import { addDays, dow, formatLong, mondayOf, programWeekOf, toKey } from '../lib/dates';
import { currentStreak, dayStatus, isItemDone, programProgress, weekProgress } from '../lib/stats';
import ProgressRing from '../components/ProgressRing';
import { ACCENTS, Button, Card, Pill, SectionTitle } from '../components/ui';

export default function Today({ onStart, onGoPlan, onGoFood }) {
  const { state, toggleActivity, setStartDate, addFood } = useStore();
  const today = new Date();
  const key = toKey(today);
  const rawWeek = programWeekOf(today, state.startDate);
  const week = Math.min(Math.max(rawWeek, 1), 4);
  const cfg = weekConfig(week, state.settings);
  const status = dayStatus(state, today);
  const plan = status.plan;
  const streak = currentStreak(state, today);
  const wp = weekProgress(state, week);
  const pp = programProgress(state);
  const sessions = plan.items.filter((i) => i.type === 'session');
  const activities = plan.items.filter((i) => i.type === 'activity');
  const sessionDone = sessions.length > 0 && sessions.every((i) => isItemDone(state.log, key, i));
  const main = sessions[0] ? WORKOUTS[sessions[0].id] : null;
  const accent = main ? ACCENTS[main.accent] : ACCENTS.rose;
  const monday = mondayOf(today);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between pt-2">
        <div>
          <div className="text-sm font-medium capitalize text-slate-400">{formatLong(today)}</div>
          <h1 className="mt-1 text-[32px] font-black leading-none tracking-tight">Aujourd’hui</h1>
        </div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-1.5 rounded-full bg-gradient-to-br from-orange-500/20 to-red-600/20 px-3.5 py-2 ring-1 ring-orange-500/30"
        >
          <Flame size={18} className="text-orange-400" fill="currentColor" />
          <span className="text-lg font-black tabular-nums">{streak}</span>
          <span className="text-xs font-medium text-orange-200/80">jour{streak > 1 ? 's' : ''}</span>
        </motion.div>
      </header>

      {rawWeek > 4 && (
        <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="text-amber-400" />
            <div>
              <div className="font-bold">Cycle de 4 semaines terminé !</div>
              <div className="text-sm text-slate-400">Programme complété à {Math.round(pp.pct * 100)} %. Lance un nouveau cycle.</div>
            </div>
          </div>
          <Button variant="ghost" onClick={() => setStartDate(toKey(monday))}>Nouveau cycle</Button>
        </Card>
      )}

      {/* Séance du jour */}
      <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative overflow-hidden rounded-[32px] border border-white/[0.07] bg-ink-800">
        <div className={`absolute -right-16 -top-20 h-64 w-64 rounded-full bg-gradient-to-br ${accent.grad} opacity-25 blur-3xl`} />
        {main && (
          <img
            src={`https://i.ytimg.com/vi/${main.youtubeId}/hqdefault.jpg`}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-[0.18]"
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-800 via-ink-800/85 to-ink-800/30" />
        <div className="relative p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Pill className="bg-white/10 text-slate-200">Semaine {week} · {cfg.name}</Pill>
            {main && <Pill className={`${accent.soft} ${accent.text}`}>{main.tag}</Pill>}
          </div>
          {sessions.length ? (
            <>
              <h2 className="text-[28px] font-black leading-tight tracking-tight">{sessions.map((s) => WORKOUTS[s.id].title).join(' + ')}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-300">
                <span className="flex items-center gap-1.5"><Clock size={15} /> ~{sessions.reduce((a, s) => a + WORKOUTS[s.id].duration, 0)} min vidéo</span>
                <span>{cfg.work}s / {cfg.rest}s · {cfg.rounds} tours</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{plan.note}</p>
              {plan.warning && (
                <button onClick={onGoPlan} className="mt-3 flex w-full items-start gap-2 rounded-2xl bg-amber-500/10 p-3 text-left text-[13px] text-amber-200 ring-1 ring-amber-500/20">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {plan.warning}
                </button>
              )}
              <div className="mt-5 flex gap-3">
                <Button className="flex-1 py-4 text-base" variant={sessionDone ? 'emerald' : 'primary'} onClick={() => onStart(key, sessions.map((s) => s.id), week)}>
                  {sessionDone ? <><Check size={20} /> Validée · Revoir</> : <><Play size={20} fill="currentColor" /> Lancer la séance</>}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-5xl">{ACTIVITIES[activities[0]?.id]?.emoji}</div>
              <h2 className="mt-3 text-[28px] font-black leading-tight tracking-tight">{ACTIVITIES[activities[0]?.id]?.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{plan.note}</p>
            </>
          )}
        </div>
      </motion.div>

      {activities.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {activities.map((item) => {
            const a = ACTIVITIES[item.id];
            const done = isItemDone(state.log, key, item);
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => toggleActivity(key, item.id)}
                className={`flex items-center gap-4 rounded-3xl border p-4 text-left transition-colors ${done ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-white/[0.06] bg-ink-800/70'}`}
              >
                <span className="text-3xl">{a.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">{a.title}</span>
                  <span className="block text-xs text-slate-400">{item.required ? a.subtitle : 'Optionnel · ne compte pas dans la série'}</span>
                </span>
                <span className={`grid h-9 w-9 place-items-center rounded-full border-2 ${done ? 'border-emerald-500 bg-emerald-500 text-ink' : 'border-ink-500 text-transparent'}`}>
                  <Check size={18} strokeWidth={3} />
                </span>
              </motion.button>
            );
          })}
        </div>
      )}

      <NutritionCard state={state} dateKey={key} onOpen={onGoFood} onShake={() => {
        const f = FOODS.find((x) => x.id === 'shake');
        addFood(key, { foodId: f.id, emoji: f.emoji, name: f.name, qty: 1, slot: 'snack', kcal: f.kcal, p: f.p, c: f.c, f: f.f });
      }} />

      {/* Progression */}
      <div>
        <SectionTitle>Progression</SectionTitle>
        <Card className="grid grid-cols-2 gap-2 p-5">
          <div className="flex flex-col items-center gap-3">
            <ProgressRing value={wp.pct} size={124} stroke={12} gradient={['#F97316', '#EF4444']}>
              <div className="text-center">
                <div className="text-2xl font-black tabular-nums">{Math.round(wp.pct * 100)}%</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{wp.done}/{wp.total}</div>
              </div>
            </ProgressRing>
            <span className="text-sm font-semibold text-slate-300">Semaine {week}</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <ProgressRing value={pp.pct} size={124} stroke={12} gradient={['#34D399', '#10B981']}>
              <div className="text-center">
                <div className="text-2xl font-black tabular-nums">{Math.round(pp.pct * 100)}%</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{pp.done}/{pp.total}</div>
              </div>
            </ProgressRing>
            <span className="text-sm font-semibold text-slate-300">Programme 4 sem.</span>
          </div>
        </Card>
      </div>

      {/* Semaine en cours */}
      <div>
        <SectionTitle action={<button onClick={onGoPlan} className="text-sm font-semibold text-thenx">Planning →</button>}>Cette semaine</SectionTitle>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 7 }, (_, i) => {
            const d = addDays(monday, i);
            const s = dayStatus(state, d);
            const isToday = i === dow(today);
            const first = s.plan.session[0] ? WORKOUTS[s.plan.session[0]] : null;
            const emoji = first ? '💪' : ACTIVITIES[s.plan.activities[0]]?.emoji;
            return (
              <div
                key={i}
                className={`flex flex-col items-center gap-1.5 rounded-2xl py-3 ${isToday ? 'bg-white/[0.08] ring-1 ring-red-500/50' : 'bg-ink-800/60'}`}
              >
                <span className={`text-[11px] font-semibold ${isToday ? 'text-red-400' : 'text-slate-500'}`}>{DAY_SHORT[i]}</span>
                <span className="text-lg leading-none">{emoji}</span>
                <span className={`h-1.5 w-1.5 rounded-full ${s.complete ? 'bg-emerald-400' : s.done > 0 ? 'bg-amber-400' : d < today && !isToday ? 'bg-red-500/60' : 'bg-ink-500'}`} />
              </div>
            );
          })}
        </div>
      </div>

      <Card className="p-5">
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-red-400">Focus semaine {week}</div>
        <p className="mt-2 text-[15px] font-medium leading-relaxed">{cfg.focus}</p>
        <ul className="mt-3 space-y-1.5 text-sm text-slate-400">
          {cfg.tips.map((t) => <li key={t}>• {t}</li>)}
        </ul>
      </Card>
    </div>
  );
}

function NutritionCard({ state, dateKey, onOpen, onShake }) {
  const t = targets(state);
  const tot = dayTotals(state, dateKey);
  const left = Math.round(t.kcal - tot.kcal);
  return (
    <Card className="p-4">
      <button onClick={onOpen} className="flex w-full items-center gap-4 text-left">
        <ProgressRing value={tot.kcal / t.kcal} size={64} stroke={7} gradient={['#F97316', '#EF4444']}>
          <span className="text-[13px] font-black tabular-nums">{Math.round((tot.kcal / t.kcal) * 100)}%</span>
        </ProgressRing>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Nutrition</span>
          <span className="block font-bold tabular-nums">{Math.round(tot.kcal)} / {t.kcal} kcal</span>
          <span className="block text-xs tabular-nums text-slate-500">
            Protéines {Math.round(tot.p)}/{t.protein} g · {left > 0 ? `encore ${left} kcal` : 'objectif atteint ✓'}
          </span>
        </span>
        <ChevronRight size={20} className="text-slate-500" />
      </button>
      {left > 0 && (
        <motion.button whileTap={{ scale: 0.97 }} onClick={onShake} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/[0.06] py-2.5 text-sm font-semibold hover:bg-white/10">
          <Plus size={16} /> Shake maison · 905 kcal
        </motion.button>
      )}
    </Card>
  );
}
