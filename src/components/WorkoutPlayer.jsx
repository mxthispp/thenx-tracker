import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, ExternalLink, PlayCircle, Sparkles, X } from 'lucide-react';
import { WORKOUTS, fmtTs, weekConfig, youtubeUrl } from '../data/program';
import { buildWorkoutSequence, sequenceDuration } from '../lib/sequence';
import { useStore } from '../lib/store';
import { formatLong, fromKey } from '../lib/dates';
import HiitTimer from './HiitTimer';
import YouTubePlayer from './YouTubePlayer';
import { ACCENTS, Button, Pill, Toggle } from './ui';

export default function WorkoutPlayer({ dateKey, workoutIds, week, onClose }) {
  const { state, setSettings, updateExercise, setSessionDone, updateSession } = useStore();
  const { settings } = state;
  const cfg = weekConfig(week, settings);
  const sequence = useMemo(() => buildWorkoutSequence(workoutIds, cfg), [workoutIds.join(','), cfg.work, cfg.rest, cfg.rounds, cfg.roundRest, cfg.transition]); // eslint-disable-line react-hooks/exhaustive-deps
  const [active, setActive] = useState(workoutIds[0]);
  const [celebrate, setCelebrate] = useState(false);
  const player = useRef(null);
  const day = state.log[dateKey] || { sessions: {} };
  const w = WORKOUTS[active];

  const onIntervalStart = (iv) => {
    if (iv.workoutId && iv.workoutId !== active) setActive(iv.workoutId);
    if (iv.phase === 'work' && iv.round === 1 && iv.ts && settings.videoSync) player.current?.seekTo(iv.ts);
  };

  // Coche automatiquement l'exercice à la fin de sa dernière série.
  const onIntervalEndRef = useRef(null);
  onIntervalEndRef.current = (iv) => {
    if (iv?.phase === 'work' && iv.lastRound) updateExercise(dateKey, iv.workoutId, iv.exId, { done: true });
  };
  const lastIv = useRef(null);
  const handleStart = (iv, idx) => {
    if (lastIv.current) onIntervalEndRef.current(lastIv.current);
    lastIv.current = sequence[idx];
    onIntervalStart(iv);
  };

  const finish = () => {
    if (lastIv.current) onIntervalEndRef.current(lastIv.current);
    workoutIds.forEach((wid) => setSessionDone(dateKey, wid, true));
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 2600);
  };

  const allDone = workoutIds.every((wid) => day.sessions?.[wid]?.done);

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-y-auto bg-ink"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 260, damping: 32 }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-red-600/20 via-red-900/5 to-transparent" />
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-ink/80 px-4 pb-3 pt-[max(env(safe-area-inset-top),12px)] backdrop-blur-xl md:px-8">
        <button onClick={onClose} aria-label="Fermer" className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.07] hover:bg-white/10">
          <ChevronDown size={22} />
        </button>
        <div className="min-w-0 text-center">
          <div className="truncate text-[15px] font-bold">{workoutIds.map((id) => WORKOUTS[id].title).join(' + ')}</div>
          <div className="text-xs capitalize text-slate-400">{formatLong(fromKey(dateKey))} · S{cfg.n} {cfg.name}</div>
        </div>
        <button onClick={onClose} aria-label="Fermer" className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.07] hover:bg-white/10">
          <X size={20} />
        </button>
      </header>

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 pb-32 pt-2 md:grid-cols-[1.15fr_1fr] md:px-8">
        <div className="min-w-0 space-y-5">
          {workoutIds.length > 1 && (
            <div className="flex gap-2 rounded-2xl bg-white/[0.04] p-1">
              {workoutIds.map((id) => (
                <button
                  key={id}
                  onClick={() => setActive(id)}
                  className={`relative flex-1 rounded-xl py-2 text-sm font-semibold ${active === id ? 'text-white' : 'text-slate-400'}`}
                >
                  {active === id && <motion.span layoutId="combo-tab" className="absolute inset-0 rounded-xl bg-white/10" />}
                  <span className="relative">{WORKOUTS[id].title}</span>
                </button>
              ))}
            </div>
          )}
          <YouTubePlayer ref={player} videoId={w.youtubeId} title={w.videoTitle} />
          <div className="flex items-start justify-between gap-3 px-1">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-200">{w.videoTitle}</div>
              <div className="mt-0.5 text-xs text-slate-500">~{w.duration} min · {w.muscles.join(' · ')}</div>
            </div>
            <a href={youtubeUrl(w.youtubeId)} target="_blank" rel="noreferrer" className="shrink-0 rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Ouvrir sur YouTube">
              <ExternalLink size={18} />
            </a>
          </div>

          <div className="rounded-3xl border border-white/[0.06] bg-ink-800/60 p-5">
            <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
              <Pill className="bg-red-500/15 text-red-300">{cfg.work}s effort</Pill>
              <Pill className="bg-emerald-500/15 text-emerald-300">{cfg.rest}s repos</Pill>
              <Pill className="bg-white/[0.06] text-slate-300">{cfg.rounds} tours</Pill>
              <Pill className="bg-white/[0.06] text-slate-300">{Math.round(sequenceDuration(sequence) / 60)} min</Pill>
            </div>
            <HiitTimer
              sequence={sequence}
              sound={settings.sound}
              voice={settings.voice}
              onToggleSound={() => setSettings({ sound: !settings.sound })}
              onToggleVoice={() => setSettings({ voice: !settings.voice })}
              onIntervalStart={handleStart}
              onComplete={finish}
              compact
            />
            {workoutIds.includes('abs') && (
              <div className="mt-4 border-t border-white/[0.06] pt-1">
                <Toggle
                  checked={settings.videoSync}
                  onChange={(v) => setSettings({ videoSync: v })}
                  label="Synchroniser la vidéo Abdos"
                  hint="Le lecteur saute au timestamp de chaque exercice au début de l’effort."
                />
              </div>
            )}
            <p className="mt-3 text-center text-xs leading-relaxed text-slate-500">{cfg.focus}</p>
          </div>
        </div>

        <div className="min-w-0 space-y-5">
          {workoutIds.map((wid) => (
            <ExerciseChecklist
              key={wid}
              workout={WORKOUTS[wid]}
              session={day.sessions?.[wid]}
              onExercise={(exId, patch) => updateExercise(dateKey, wid, exId, patch)}
              onSeek={(ts) => {
                setActive(wid);
                setTimeout(() => player.current?.seekTo(ts), 50);
              }}
              onNotes={(notes) => updateSession(dateKey, wid, { notes })}
            />
          ))}
          <Button variant={allDone ? 'emerald' : 'primary'} className="w-full py-4 text-base" onClick={() => (allDone ? workoutIds.forEach((wid) => setSessionDone(dateKey, wid, false)) : finish())}>
            {allDone ? <><Check size={20} /> Séance validée — annuler ?</> : <><Sparkles size={20} /> Terminer & valider la séance</>}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {celebrate && (
          <motion.div className="pointer-events-none fixed inset-0 z-[60] grid place-items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              initial={{ scale: 0.4, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="flex flex-col items-center gap-3 rounded-[32px] bg-emerald-500 px-10 py-8 text-ink shadow-glow-emerald"
            >
              <Check size={56} strokeWidth={3} />
              <div className="text-xl font-black">Séance validée 🔥</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ExerciseChecklist({ workout, session, onExercise, onSeek, onNotes }) {
  const accent = ACCENTS[workout.accent];
  const [open, setOpen] = useState(null);
  const exState = session?.exercises || {};
  const doneCount = workout.exercises.filter((e) => exState[e.id]?.done).length;

  return (
    <div className="rounded-3xl border border-white/[0.06] bg-ink-800/60 p-2">
      <div className="flex items-center justify-between px-3 py-3">
        <div>
          <div className={`text-[11px] font-bold uppercase tracking-[0.16em] ${accent.text}`}>{workout.tag}</div>
          <div className="text-base font-bold">{workout.title}</div>
        </div>
        <div className="text-sm font-semibold tabular-nums text-slate-400">{doneCount}/{workout.exercises.length}</div>
      </div>
      <ul className="space-y-1">
        {workout.exercises.map((ex, i) => {
          const s = exState[ex.id] || {};
          const isOpen = open === ex.id;
          return (
            <li key={ex.id} className={`rounded-2xl transition-colors ${isOpen ? 'bg-white/[0.04]' : ''}`}>
              <div className="flex items-center gap-3 px-3 py-2.5">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => onExercise(ex.id, { done: !s.done })}
                  aria-label={s.done ? 'Décocher' : 'Cocher'}
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 transition-colors ${s.done ? 'border-emerald-500 bg-emerald-500 text-ink' : 'border-ink-500 text-transparent hover:border-slate-400'}`}
                >
                  <Check size={16} strokeWidth={3.5} />
                </motion.button>
                <button onClick={() => setOpen(isOpen ? null : ex.id)} className="min-w-0 flex-1 text-left">
                  <div className={`text-[15px] font-semibold ${s.done ? 'text-slate-400 line-through decoration-emerald-500/60' : ''}`}>
                    <span className="mr-1.5 text-slate-500">{i + 1}.</span>{ex.name}
                  </div>
                  <div className="truncate text-xs text-slate-500">
                    {ex.fr}
                    {(s.reps || s.rpe) && <span className="ml-1 text-slate-400">· {s.reps ? `${s.reps} reps` : ''}{s.reps && s.rpe ? ' · ' : ''}{s.rpe ? `RPE ${s.rpe}` : ''}</span>}
                  </div>
                </button>
                {ex.ts != null && (
                  <button onClick={() => onSeek(ex.ts)} className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums ${accent.soft} ${accent.text}`}>
                    <PlayCircle size={14} /> {fmtTs(ex.ts)}
                  </button>
                )}
              </div>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="space-y-4 px-4 pb-4 pl-[60px]">
                      <p className="text-[13px] leading-relaxed text-slate-300">💡 {ex.cue}</p>
                      <label className="flex items-center gap-3 text-sm">
                        <span className="w-28 text-slate-400">Répétitions</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          min="0"
                          value={s.reps ?? ''}
                          onChange={(e) => onExercise(ex.id, { reps: e.target.value })}
                          placeholder="—"
                          className="w-20 rounded-xl border border-white/10 bg-ink px-3 py-2 text-center font-semibold tabular-nums outline-none focus:border-red-500"
                        />
                      </label>
                      <div>
                        <div className="mb-2 flex justify-between text-sm">
                          <span className="text-slate-400">Ressenti (RPE)</span>
                          <span className="font-bold tabular-nums">{s.rpe ? `${s.rpe}/10` : '—'}</span>
                        </div>
                        <div className="grid grid-cols-10 gap-1">
                          {Array.from({ length: 10 }, (_, k) => k + 1).map((n) => (
                            <button
                              key={n}
                              onClick={() => onExercise(ex.id, { rpe: s.rpe === n ? null : n })}
                              className={`h-8 rounded-lg text-xs font-bold tabular-nums transition-colors ${s.rpe >= n ? (n >= 9 ? 'bg-red-500 text-white' : n >= 7 ? 'bg-orange-500 text-white' : 'bg-emerald-500 text-ink') : 'bg-white/[0.06] text-slate-400'}`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
      <textarea
        value={session?.notes || ''}
        onChange={(e) => onNotes(e.target.value)}
        placeholder="Notes de séance (variante, douleurs, sensations…)"
        rows={2}
        className="mt-2 w-full resize-none rounded-2xl border border-white/[0.06] bg-ink/60 px-4 py-3 text-sm outline-none placeholder:text-slate-600 focus:border-red-500/60"
      />
    </div>
  );
}
