import { AnimatePresence, motion } from 'framer-motion';
import { ChevronsLeft, ChevronsRight, Pause, Play, RotateCcw, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import { useIntervalTimer } from '../lib/useIntervalTimer';

export const PHASES = {
  prep: { label: 'Préparation', color: '#FACC15', grad: ['#FDE047', '#F59E0B'], text: 'text-yellow-300', glow: 'rgba(250,204,21,0.35)' },
  work: { label: 'Effort', color: '#EF4444', grad: ['#F97316', '#EF4444'], text: 'text-red-400', glow: 'rgba(239,68,68,0.45)' },
  rest: { label: 'Repos', color: '#10B981', grad: ['#34D399', '#0EA5E9'], text: 'text-emerald-300', glow: 'rgba(16,185,129,0.35)' },
  transition: { label: 'Transition', color: '#3B82F6', grad: ['#60A5FA', '#6366F1'], text: 'text-blue-300', glow: 'rgba(59,130,246,0.35)' },
};

const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export default function HiitTimer({ sequence, sound, voice, onToggleSound, onToggleVoice, onIntervalStart, onComplete, compact = false }) {
  const t = useIntervalTimer(sequence, { sound, voice, onIntervalStart, onComplete });
  const cur = t.current || sequence[0];
  const phase = t.finished ? PHASES.rest : PHASES[cur.phase];
  const secs = Math.ceil(t.remaining / 1000);
  const pct = cur.duration ? 1 - t.remaining / (cur.duration * 1000) : 1;

  const size = compact ? 230 : 290;
  const stroke = compact ? 14 : 16;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const workCount = sequence.filter((s) => s.phase === 'work').length;
  const workIdx = sequence.slice(0, t.index + 1).filter((s) => s.phase === 'work').length;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <motion.div
          className="absolute inset-6 rounded-full blur-3xl"
          animate={{ backgroundColor: phase.glow, scale: t.running ? [1, 1.06, 1] : 1 }}
          transition={{ scale: { duration: 1, repeat: Infinity }, backgroundColor: { duration: 0.4 } }}
        />
        <svg width={size} height={size} className="relative -rotate-90">
          <defs>
            {Object.entries(PHASES).map(([k, p]) => (
              <linearGradient key={k} id={`ph-${k}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor={p.grad[0]} />
                <stop offset="1" stopColor={p.grad[1]} />
              </linearGradient>
            ))}
          </defs>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={`url(#ph-${t.finished ? 'rest' : cur.phase})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * pct}
            style={{ transition: 'stroke-dashoffset 0.1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={t.finished ? 'done' : t.index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center"
            >
              <span className={`text-xs font-bold uppercase tracking-[0.2em] ${phase.text}`}>{t.finished ? 'Terminé' : phase.label}</span>
              <motion.span
                key={secs}
                initial={secs <= 3 && t.running ? { scale: 1.25 } : false}
                animate={{ scale: 1 }}
                className={`font-black tabular-nums tracking-tight ${compact ? 'text-6xl' : 'text-7xl'}`}
              >
                {t.finished ? '✓' : fmt(secs)}
              </motion.span>
              <span className="mt-1 line-clamp-2 text-sm font-semibold text-slate-200">
                {t.finished ? 'Bravo, séance validée !' : cur.phase === 'work' ? cur.label : cur.next ? `Suivant : ${cur.next}` : cur.label}
              </span>
              {!t.finished && cur.round && (
                <span className="mt-1 text-[11px] font-medium text-slate-500">
                  {cur.rounds < workCount ? `Tour ${cur.round}/${cur.rounds} · ` : ''}{workIdx}/{workCount}
                </span>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-4">
        <IconBtn onClick={t.reset} label="Réinitialiser"><RotateCcw size={20} /></IconBtn>
        <IconBtn onClick={t.prev} label="Précédent"><ChevronsLeft size={22} /></IconBtn>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={t.running ? t.pause : t.start}
          aria-label={t.running ? 'Pause' : 'Démarrer'}
          className="grid h-20 w-20 place-items-center rounded-full text-white shadow-2xl"
          style={{ background: `linear-gradient(135deg, ${phase.grad[0]}, ${phase.grad[1]})`, boxShadow: `0 10px 40px -8px ${phase.glow}` }}
        >
          {t.running ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
        </motion.button>
        <IconBtn onClick={t.next} label="Suivant"><ChevronsRight size={22} /></IconBtn>
        <IconBtn onClick={onToggleSound} label="Son" active={sound}>{sound ? <Volume2 size={20} /> : <VolumeX size={20} />}</IconBtn>
      </div>
      <div className="mt-4 flex w-full max-w-xs items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400 transition-[width] duration-200" style={{ width: `${(t.elapsedTotal / t.total) * 100}%` }} />
        </div>
        <span className="text-xs tabular-nums text-slate-400">{fmt(t.elapsedTotal)} / {fmt(t.total)}</span>
        <button onClick={onToggleVoice} aria-label="Voix" className={`rounded-full p-1.5 ${voice ? 'text-emerald-400' : 'text-slate-500'}`}>
          {voice ? <Mic size={16} /> : <MicOff size={16} />}
        </button>
      </div>
    </div>
  );
}

function IconBtn({ children, onClick, label, active }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid h-12 w-12 place-items-center rounded-full bg-white/[0.06] ring-1 ring-white/[0.06] hover:bg-white/10 ${active === false ? 'text-slate-500' : 'text-slate-200'}`}
    >
      {children}
    </motion.button>
  );
}
