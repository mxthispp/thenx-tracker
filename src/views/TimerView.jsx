import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { TIMER_PRESETS, WORKOUTS } from '../data/program';
import { buildGenericSequence } from '../lib/sequence';
import { useStore } from '../lib/store';
import HiitTimer from '../components/HiitTimer';
import { Card, SectionTitle } from '../components/ui';

export default function TimerView() {
  const { state, setSettings } = useStore();
  const saved = state.settings.customTimer || { work: 40, rest: 15, rounds: 10 };
  const [presetId, setPresetId] = useState('intermediate');
  const [custom, setCustom] = useState(saved);
  const [rounds, setRounds] = useState(10);
  const [workoutId, setWorkoutId] = useState('');

  const preset = presetId === 'custom' ? custom : TIMER_PRESETS.find((p) => p.id === presetId);
  const n = presetId === 'custom' ? custom.rounds : rounds;
  const sequence = useMemo(
    () => buildGenericSequence({ work: preset.work, rest: preset.rest, rounds: n, workoutId: workoutId || null }),
    [preset.work, preset.rest, n, workoutId],
  );

  const updateCustom = (patch) => {
    const next = { ...custom, ...patch };
    setCustom(next);
    setSettings({ customTimer: next });
  };

  return (
    <div className="space-y-6">
      <header className="pt-2">
        <div className="text-sm font-medium text-slate-400">Effort · Repos · Bips 3-2-1 · Annonce vocale</div>
        <h1 className="mt-1 text-[32px] font-black leading-none tracking-tight">Timer HIIT</h1>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 [&>*]:min-w-0">
        <Card className="flex flex-col items-center p-6">
          <HiitTimer
            sequence={sequence}
            sound={state.settings.sound}
            voice={state.settings.voice}
            onToggleSound={() => setSettings({ sound: !state.settings.sound })}
            onToggleVoice={() => setSettings({ voice: !state.settings.voice })}
          />
        </Card>

        <div className="space-y-6">
          <div>
            <SectionTitle>Préréglages</SectionTitle>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4">
              {[...TIMER_PRESETS, { id: 'custom', label: 'Perso', work: custom.work, rest: custom.rest }].map((p) => {
                const active = p.id === presetId;
                return (
                  <motion.button
                    key={p.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPresetId(p.id)}
                    className={`rounded-2xl border p-3 text-left transition-colors ${active ? 'border-red-500/60 bg-red-500/10' : 'border-white/[0.06] bg-ink-800/60 hover:bg-white/[0.04]'}`}
                  >
                    <div className={`text-xs font-bold uppercase tracking-wider ${active ? 'text-red-300' : 'text-slate-400'}`}>{p.label}</div>
                    <div className="mt-1 text-lg font-black tabular-nums">{p.work}s<span className="text-slate-500">/</span>{p.rest}s</div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <Card className="divide-y divide-white/[0.06] px-5">
            {presetId === 'custom' && (
              <>
                <Stepper label="Effort" value={custom.work} unit="s" step={5} min={5} max={180} onChange={(v) => updateCustom({ work: v })} />
                <Stepper label="Repos" value={custom.rest} unit="s" step={5} min={0} max={180} onChange={(v) => updateCustom({ rest: v })} />
              </>
            )}
            <Stepper
              label="Intervalles"
              value={n}
              step={1}
              min={1}
              max={60}
              onChange={(v) => (presetId === 'custom' ? updateCustom({ rounds: v }) : setRounds(v))}
            />
            <label className="flex items-center justify-between gap-4 py-3">
              <span className="text-[15px] font-medium">Nommer d’après</span>
              <select
                value={workoutId}
                onChange={(e) => setWorkoutId(e.target.value)}
                className="rounded-xl border border-white/10 bg-ink px-3 py-2 text-sm outline-none focus:border-red-500"
              >
                <option value="">Intervalles génériques</option>
                {Object.values(WORKOUTS).map((w) => <option key={w.id} value={w.id}>{w.title}</option>)}
              </select>
            </label>
          </Card>

          <Card className="p-5 text-sm text-slate-400">
            <div className="mb-2 font-semibold text-slate-200">Code couleur</div>
            <div className="grid grid-cols-2 gap-2">
              <Legend color="bg-yellow-400" label="Préparation 5 s" />
              <Legend color="bg-gradient-to-r from-orange-500 to-red-500" label="Effort" />
              <Legend color="bg-gradient-to-r from-emerald-400 to-sky-500" label="Repos" />
              <Legend color="bg-gradient-to-r from-blue-400 to-indigo-500" label="Transition" />
            </div>
            <p className="mt-3 text-xs leading-relaxed">Astuce : sur iPhone, désactive le mode silencieux pour entendre les bips. L’écran reste allumé pendant le timer.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Stepper({ label, value, unit = '', step, min, max, onChange }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-[15px] font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <button onClick={() => onChange(Math.max(min, value - step))} className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.06] hover:bg-white/10" aria-label={`Moins ${label}`}>
          <Minus size={16} />
        </button>
        <span className="w-14 text-center text-lg font-black tabular-nums">{value}{unit}</span>
        <button onClick={() => onChange(Math.min(max, value + step))} className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.06] hover:bg-white/10" aria-label={`Plus ${label}`}>
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-3 w-3 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  );
}
