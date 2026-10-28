import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BottomNav, SideNav } from './components/BottomNav';
import WorkoutPlayer from './components/WorkoutPlayer';
import Today from './views/Today';
import Planning from './views/Planning';
import TimerView from './views/TimerView';
import Stats from './views/Stats';
import { useStore } from './lib/store';
import { useDailyReminder } from './lib/useDailyReminder';

const TAB_KEY = 'thenx-tab';

export default function App() {
  const { state, setSettings } = useStore();
  const [tab, setTab] = useState(() => {
    try {
      return sessionStorage.getItem(TAB_KEY) || 'today';
    } catch {
      return 'today';
    }
  });
  const [workout, setWorkout] = useState(null);
  useDailyReminder(state, setSettings);

  useEffect(() => {
    try {
      sessionStorage.setItem(TAB_KEY, tab);
    } catch {
      /* ignore */
    }
    window.scrollTo({ top: 0 });
  }, [tab]);

  useEffect(() => {
    document.body.style.overflow = workout ? 'hidden' : '';
  }, [workout]);

  const start = (dateKey, workoutIds, week) => setWorkout({ dateKey, workoutIds, week });

  const views = {
    today: <Today onStart={start} onGoPlan={() => setTab('plan')} />,
    plan: <Planning onStart={start} />,
    timer: <TimerView />,
    stats: <Stats />,
  };

  return (
    <div className="flex min-h-screen">
      <SideNav tab={tab} onChange={setTab} />
      <main className="min-w-0 flex-1 px-4 pb-28 pt-[max(env(safe-area-inset-top),16px)] md:px-10 md:pb-12 md:pt-10">
        <div className={`mx-auto ${tab === 'timer' || tab === 'stats' ? 'max-w-5xl' : 'max-w-2xl'}`}>
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {views[tab]}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <BottomNav tab={tab} onChange={setTab} />
      <AnimatePresence>
        {workout && <WorkoutPlayer key={workout.dateKey + workout.workoutIds.join()} {...workout} onClose={() => setWorkout(null)} />}
      </AnimatePresence>
    </div>
  );
}
