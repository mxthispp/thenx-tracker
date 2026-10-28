import { motion } from 'framer-motion';
import { BarChart3, CalendarDays, Flame, Timer, UtensilsCrossed } from 'lucide-react';

export const TABS = [
  { id: 'today', label: 'Aujourd’hui', icon: Flame },
  { id: 'plan', label: 'Planning', icon: CalendarDays },
  { id: 'food', label: 'Nutrition', icon: UtensilsCrossed },
  { id: 'timer', label: 'Timer', icon: Timer },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
];

export function BottomNav({ tab, onChange }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.06] bg-ink/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button key={id} onClick={() => onChange(id)} className="relative flex flex-col items-center gap-1 py-2.5">
              {active && <motion.span layoutId="tab-dot" className="absolute top-0 h-0.5 w-10 rounded-full bg-thenx" />}
              <Icon size={22} strokeWidth={active ? 2.4 : 1.8} className={active ? 'text-thenx' : 'text-slate-500'} />
              <span className={`text-[10.5px] font-medium ${active ? 'text-slate-100' : 'text-slate-500'}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function SideNav({ tab, onChange }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-white/[0.06] px-4 py-8 md:flex">
      <div className="mb-10 flex items-center gap-3 px-2">
        <img src="./icons/icon.svg" alt="" className="h-10 w-10" />
        <div>
          <div className="text-lg font-black tracking-tight">THENX</div>
          <div className="text-xs text-slate-500">Callisthénie · Boxe · Foot</div>
        </div>
      </div>
      {TABS.map(({ id, label, icon: Icon }) => {
        const active = tab === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`relative mb-1 flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-medium transition-colors ${active ? 'text-white' : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'}`}
          >
            {active && <motion.span layoutId="side-active" className="absolute inset-0 rounded-2xl bg-white/[0.07] ring-1 ring-white/10" />}
            <Icon size={20} className={`relative ${active ? 'text-thenx' : ''}`} />
            <span className="relative whitespace-nowrap text-left">{{ stats: 'Stats & Rappels', plan: 'Planning 4 semaines', timer: 'Timer HIIT', food: 'Nutrition & Poids' }[id] || label}</span>
          </button>
        );
      })}
    </aside>
  );
}
