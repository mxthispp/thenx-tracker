import { motion } from 'framer-motion';

export const ACCENTS = {
  red: { text: 'text-red-400', bg: 'bg-red-500', soft: 'bg-red-500/10', ring: 'ring-red-500/30', grad: 'from-red-500 to-orange-500', hex: '#EF4444' },
  sky: { text: 'text-sky-400', bg: 'bg-sky-500', soft: 'bg-sky-500/10', ring: 'ring-sky-500/30', grad: 'from-sky-500 to-indigo-500', hex: '#0EA5E9' },
  amber: { text: 'text-amber-400', bg: 'bg-amber-500', soft: 'bg-amber-500/10', ring: 'ring-amber-500/30', grad: 'from-amber-500 to-red-500', hex: '#F59E0B' },
  violet: { text: 'text-violet-400', bg: 'bg-violet-500', soft: 'bg-violet-500/10', ring: 'ring-violet-500/30', grad: 'from-violet-500 to-fuchsia-500', hex: '#8B5CF6' },
  rose: { text: 'text-rose-400', bg: 'bg-rose-500', soft: 'bg-rose-500/10', ring: 'ring-rose-500/30', grad: 'from-rose-500 to-red-600', hex: '#F43F5E' },
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500', soft: 'bg-emerald-500/10', ring: 'ring-emerald-500/30', grad: 'from-emerald-500 to-teal-500', hex: '#10B981' },
  cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500', soft: 'bg-cyan-500/10', ring: 'ring-cyan-500/30', grad: 'from-cyan-500 to-sky-500', hex: '#06B6D4' },
};

export function Card({ className = '', children, ...rest }) {
  return (
    <div className={`rounded-3xl border border-white/[0.06] bg-ink-800/70 backdrop-blur-xl ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function SectionTitle({ children, action }) {
  return (
    <div className="mb-3 flex items-end justify-between px-1">
      <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-400">{children}</h2>
      {action}
    </div>
  );
}

export function Toggle({ checked, onChange, label, hint, disabled }) {
  return (
    <label className={`flex items-center justify-between gap-4 py-3 ${disabled ? 'opacity-50' : 'cursor-pointer'}`}>
      <span className="min-w-0">
        <span className="block text-[15px] font-medium text-slate-100">{label}</span>
        {hint && <span className="mt-0.5 block text-[13px] leading-snug text-slate-400">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-ink-500'}`}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 600, damping: 35 }}
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow ${checked ? 'right-0.5' : 'left-0.5'}`}
        />
      </button>
    </label>
  );
}

export function Pill({ children, className = '' }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${className}`}>{children}</span>;
}

export function Button({ variant = 'primary', className = '', children, ...rest }) {
  const styles = {
    primary: 'bg-thenx text-white shadow-glow hover:bg-red-500 active:bg-thenx-dark',
    emerald: 'bg-emerald-500 text-ink shadow-glow-emerald hover:bg-emerald-400',
    ghost: 'bg-white/[0.06] text-slate-100 hover:bg-white/10',
    outline: 'border border-white/10 text-slate-200 hover:bg-white/5',
  };
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-[15px] font-semibold transition-colors disabled:opacity-40 ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
