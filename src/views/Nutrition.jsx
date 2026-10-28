import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, ChevronLeft, ChevronRight, Droplet, Lightbulb, Minus, Plus, Scale, Search, Sparkles, Trash2, TrendingDown, TrendingUp, X } from 'lucide-react';
import { APPETITE_TIPS, FOODS, FOOD_CATEGORIES, MEAL_SLOTS } from '../data/foods';
import { useStore } from '../lib/store';
import { addDays, diffDays, formatLong, formatShort, fromKey, startOfDay, toKey } from '../lib/dates';
import { ACTIVITY_LEVELS, GOALS, RAMP_STEP, adjustmentSuggestion, dayFood, dayTotals, proteinStreak, targets, weeklyRate, weightSeries } from '../lib/nutrition';
import { requestPermission } from '../lib/notifications';
import ProgressRing from '../components/ProgressRing';
import WeightChart from '../components/WeightChart';
import { Button, Card, SectionTitle, Toggle } from '../components/ui';

const SECTIONS = [
  { id: 'meals', label: 'Repas' },
  { id: 'weight', label: 'Poids' },
  { id: 'profile', label: 'Profil' },
];

export default function Nutrition() {
  const [section, setSection] = useState('meals');
  return (
    <div className="space-y-6">
      <header className="pt-2">
        <div className="text-sm font-medium text-slate-400">Prise de masse · Petit appétit</div>
        <h1 className="mt-1 text-[32px] font-black leading-none tracking-tight">Nutrition</h1>
      </header>
      <div className="flex gap-1 rounded-2xl bg-ink-800/70 p-1 ring-1 ring-white/[0.06]">
        {SECTIONS.map((s) => (
          <button key={s.id} onClick={() => setSection(s.id)} className={`relative flex-1 rounded-xl py-2.5 text-sm font-semibold ${section === s.id ? 'text-white' : 'text-slate-400'}`}>
            {section === s.id && <motion.span layoutId="nutri-tab" className="absolute inset-0 rounded-xl bg-white/10" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
            <span className="relative">{s.label}</span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={section} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
          {section === 'meals' && <Meals />}
          {section === 'weight' && <Weight />}
          {section === 'profile' && <Profile />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ───────────────────────────── Repas ───────────────────────────── */

function Meals() {
  const { state, addFood, removeFood, addWater } = useStore();
  const [date, setDate] = useState(() => startOfDay(new Date()));
  const [sheet, setSheet] = useState(null); // slot id
  const key = toKey(date);
  const isToday = key === toKey(new Date());
  const t = targets(state, date);
  const tot = dayTotals(state, key);
  const entries = dayFood(state, key);
  const water = state.water?.[key] || 0;
  const streak = proteinStreak(state);
  const remaining = Math.round(t.kcal - tot.kcal);
  const tip = APPETITE_TIPS[diffDays(date, new Date(2026, 0, 1)) % APPETITE_TIPS.length];
  const slotsUsed = new Set(entries.map((e) => e.slot)).size;

  const recents = useMemo(() => {
    const seen = new Map();
    Object.keys(state.food || {}).sort().reverse().forEach((k) => {
      state.food[k].forEach((e) => {
        if (e.foodId && !seen.has(e.foodId) && seen.size < 6) seen.set(e.foodId, e);
      });
    });
    return [...seen.values()];
  }, [state.food]);

  const quickShake = () => {
    const f = FOODS.find((x) => x.id === 'shake');
    addFood(key, entryFrom(f, 1, defaultSlot()));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => setDate(addDays(date, -1))} className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.06]" aria-label="Jour précédent"><ChevronLeft size={20} /></button>
        <div className="text-center">
          <div className="text-[15px] font-bold capitalize">{isToday ? 'Aujourd’hui' : formatLong(date)}</div>
          {!isToday && <button onClick={() => setDate(startOfDay(new Date()))} className="text-xs font-semibold text-thenx">Revenir à aujourd’hui</button>}
        </div>
        <button onClick={() => setDate(addDays(date, 1))} disabled={isToday} className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.06] disabled:opacity-30" aria-label="Jour suivant"><ChevronRight size={20} /></button>
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-5">
          <ProgressRing value={tot.kcal / t.kcal} size={132} stroke={13} gradient={['#F97316', '#EF4444']}>
            <div className="text-center">
              <div className="text-2xl font-black tabular-nums">{Math.round(tot.kcal)}</div>
              <div className="text-[11px] font-semibold text-slate-500">/ {t.kcal} kcal</div>
            </div>
          </ProgressRing>
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <div className={`text-lg font-black ${remaining > 0 ? '' : 'text-emerald-400'}`}>
                {remaining > 0 ? `Encore ${remaining} kcal` : 'Objectif atteint 🔥'}
              </div>
              <div className="text-xs text-slate-500">{slotsUsed}/5 prises · série protéines {streak} j</div>
            </div>
            <Macro label="Protéines" value={tot.p} goal={t.protein} color="bg-red-500" />
            <Macro label="Glucides" value={tot.c} goal={t.carbs} color="bg-amber-400" />
            <Macro label="Lipides" value={tot.f} goal={t.fat} color="bg-sky-400" />
          </div>
        </div>
        {t.rampWeek && (
          <div className="mt-4 rounded-2xl bg-white/[0.04] px-4 py-3 text-[13px] leading-snug text-slate-300">
            <span className="font-semibold text-white">Montée progressive · semaine {t.rampWeek}</span> — objectif {t.kcal} kcal, +{RAMP_STEP} kcal chaque semaine jusqu’à {t.full} kcal. Ton estomac s’habitue en douceur.
          </div>
        )}
      </Card>

      <motion.button whileTap={{ scale: 0.97 }} onClick={quickShake} className="flex w-full items-center gap-4 rounded-3xl bg-gradient-to-br from-red-500 to-orange-500 p-4 text-left shadow-glow">
        <span className="text-4xl">🥤</span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-black">+ Shake maison</span>
          <span className="block text-xs text-white/80">≈ 905 kcal · 35 g protéines · se boit en 2 min</span>
        </span>
        <Plus size={24} />
      </motion.button>

      {recents.length > 0 && (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
          {recents.map((e) => (
            <button key={e.foodId} onClick={() => addFood(key, { ...stripEntry(e), slot: defaultSlot() })} className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-2 text-xs font-semibold hover:bg-white/10">
              <span>{e.emoji}</span>{e.name}{e.qty !== 1 && ` ×${e.qty}`}<Plus size={12} className="text-slate-400" />
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {MEAL_SLOTS.map((slot) => {
          const list = entries.filter((e) => e.slot === slot.id);
          const kcal = list.reduce((a, e) => a + e.kcal, 0);
          return (
            <Card key={slot.id} className="p-2">
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{slot.emoji}</span>
                  <span className="font-bold">{slot.label}</span>
                  {kcal > 0 && <span className="text-xs tabular-nums text-slate-500">{Math.round(kcal)} kcal</span>}
                </div>
                <button onClick={() => setSheet(slot.id)} className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.06] hover:bg-white/10" aria-label={`Ajouter au ${slot.label}`}>
                  <Plus size={18} />
                </button>
              </div>
              {list.map((e) => (
                <div key={e.id} className="flex items-center gap-3 rounded-2xl px-3 py-2 hover:bg-white/[0.03]">
                  <span className="text-xl">{e.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{e.name}{e.qty !== 1 && <span className="text-slate-500"> ×{e.qty}</span>}</div>
                    <div className="text-xs tabular-nums text-slate-500">{Math.round(e.kcal)} kcal · P {Math.round(e.p)} · G {Math.round(e.c)} · L {Math.round(e.f)}</div>
                  </div>
                  <button onClick={() => removeFood(key, e.id)} className="rounded-full p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-400" aria-label="Supprimer"><Trash2 size={16} /></button>
                </div>
              ))}
            </Card>
          );
        })}
      </div>

      <div>
        <SectionTitle action={<span className="text-xs tabular-nums text-slate-400">{(water / 1000).toFixed(2).replace('.', ',')} / {(t.water / 1000).toFixed(2).replace('.', ',')} L</span>}>Hydratation</SectionTitle>
        <Card className="p-4">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: t.water / 250 }, (_, i) => {
              const full = i < water / 250;
              return (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => addWater(key, (full && i === Math.ceil(water / 250) - 1 ? i * 250 : (i + 1) * 250) - water)}
                  className={`grid h-10 w-10 place-items-center rounded-xl transition-colors ${full ? 'bg-sky-500/20 text-sky-300' : 'bg-white/[0.04] text-slate-600'}`}
                  aria-label={`Verre ${i + 1}`}
                >
                  <Droplet size={18} fill={full ? 'currentColor' : 'none'} />
                </motion.button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-slate-500">1 goutte = 250 ml. Bois surtout entre les repas, pas juste avant (ça coupe la faim).</p>
        </Card>
      </div>

      <Card className="flex gap-3 p-4">
        <Lightbulb size={20} className="mt-0.5 shrink-0 text-amber-400" />
        <p className="text-sm leading-relaxed text-slate-300">{tip}</p>
      </Card>

      <AnimatePresence>
        {sheet && <AddFoodSheet slot={sheet} onClose={() => setSheet(null)} onAdd={(entry) => addFood(key, entry)} />}
      </AnimatePresence>
    </div>
  );
}

function defaultSlot(now = new Date()) {
  const h = now.getHours();
  if (h < 10) return 'breakfast';
  if (h < 14) return 'lunch';
  if (h < 18) return 'snack';
  if (h < 21) return 'dinner';
  return 'night';
}

function entryFrom(food, qty, slot) {
  return { foodId: food.id, emoji: food.emoji, name: food.name, qty, slot, kcal: food.kcal * qty, p: food.p * qty, c: food.c * qty, f: food.f * qty };
}

function stripEntry({ foodId, emoji, name, qty, kcal, p, c, f }) {
  return { foodId, emoji, name, qty, kcal, p, c, f };
}

function Macro({ label, value, goal, color }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-semibold tabular-nums text-slate-300">{Math.round(value)}<span className="text-slate-500">/{goal} g</span></span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div className={`h-full rounded-full ${color}`} animate={{ width: `${Math.min(100, (value / goal) * 100)}%` }} />
      </div>
    </div>
  );
}

const QTYS = [0.5, 1, 1.5, 2, 3];

function AddFoodSheet({ slot, onClose, onAdd }) {
  const { state, addCustomFood, removeCustomFood } = useStore();
  const [cat, setCat] = useState('boost');
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState(null);
  const [qty, setQty] = useState(1);
  const [custom, setCustom] = useState(false);
  const [added, setAdded] = useState(null);
  const slotInfo = MEAL_SLOTS.find((s) => s.id === slot);
  const all = [...FOODS, ...state.customFoods];
  const list = query
    ? all.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()))
    : all.filter((f) => f.cat === cat);

  const confirm = () => {
    onAdd(entryFrom(picked, qty, slot));
    setAdded(picked.name);
    setPicked(null);
    setQty(1);
    setTimeout(() => setAdded(null), 1600);
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm md:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        className="relative flex max-h-[88vh] w-full max-w-lg flex-col rounded-t-[28px] border border-white/10 bg-ink-850 pb-[env(safe-area-inset-bottom)] md:rounded-[28px]"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pb-3 pt-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ajouter à</div>
            <div className="text-lg font-black">{slotInfo.emoji} {slotInfo.label}</div>
          </div>
          <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.07]" aria-label="Fermer"><X size={20} /></button>
        </div>

        {custom ? (
          <CustomFoodForm
            onCancel={() => setCustom(false)}
            onSave={(food, save) => {
              if (save) addCustomFood(food);
              onAdd(entryFrom({ ...food, id: null }, 1, slot));
              setCustom(false);
              setAdded(food.name);
              setTimeout(() => setAdded(null), 1600);
            }}
          />
        ) : (
          <>
            <div className="px-5">
              <label className="flex items-center gap-2 rounded-2xl bg-white/[0.06] px-4 py-3">
                <Search size={18} className="text-slate-500" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un aliment" className="w-full bg-transparent text-[15px] outline-none placeholder:text-slate-500" />
              </label>
              {!query && (
                <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1">
                  {[...FOOD_CATEGORIES, ...(state.customFoods.length ? [{ id: 'perso', label: 'Mes aliments' }] : [])].map((c) => (
                    <button key={c.id} onClick={() => setCat(c.id)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold ${cat === c.id ? 'bg-thenx text-white' : 'bg-white/[0.06] text-slate-300'}`}>
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-3 flex-1 overflow-y-auto px-3">
              {list.map((f) => (
                <div key={f.id} className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 ${picked?.id === f.id ? 'bg-red-500/10 ring-1 ring-red-500/40' : 'hover:bg-white/[0.04]'}`}>
                  <button onClick={() => { setPicked(f); setQty(1); }} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <span className="text-2xl">{f.emoji}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{f.star && '⭐ '}{f.name}</span>
                      <span className="block truncate text-xs text-slate-500">{f.portion}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-sm font-bold tabular-nums">{f.kcal}</span>
                      <span className="block text-[11px] tabular-nums text-slate-500">P {f.p} g</span>
                    </span>
                  </button>
                  {f.cat === 'perso' && (
                    <button onClick={() => removeCustomFood(f.id)} className="rounded-full p-1.5 text-slate-600 hover:text-red-400" aria-label="Supprimer l’aliment"><Trash2 size={14} /></button>
                  )}
                </div>
              ))}
              {!list.length && <p className="px-3 py-6 text-center text-sm text-slate-500">Aucun aliment trouvé.</p>}
              <button onClick={() => setCustom(true)} className="my-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 py-3 text-sm font-semibold text-slate-300 hover:bg-white/[0.03]">
                <Plus size={16} /> Saisie libre (kcal / protéines)
              </button>
            </div>
            <AnimatePresence>
              {picked && (
                <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="border-t border-white/10 px-5 py-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold">{picked.emoji} {picked.name}</span>
                    <span className="text-sm font-bold tabular-nums">{Math.round(picked.kcal * qty)} kcal · P {Math.round(picked.p * qty)} g</span>
                  </div>
                  <div className="mb-3 grid grid-cols-5 gap-1.5">
                    {QTYS.map((q) => (
                      <button key={q} onClick={() => setQty(q)} className={`rounded-xl py-2 text-sm font-bold ${qty === q ? 'bg-white text-ink' : 'bg-white/[0.06] text-slate-300'}`}>×{String(q).replace('.', ',')}</button>
                    ))}
                  </div>
                  <Button className="w-full" onClick={confirm}><Plus size={18} /> Ajouter</Button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
        <AnimatePresence>
          {added && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-x-0 -top-14 mx-auto w-fit rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-ink">
              ✓ {added} ajouté
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function CustomFoodForm({ onCancel, onSave }) {
  const [f, setF] = useState({ name: '', kcal: '', p: '', c: '', f: '', emoji: '🍽️', portion: 'Portion' });
  const [save, setSave] = useState(true);
  const num = (v) => Math.max(0, Number(String(v).replace(',', '.')) || 0);
  const valid = f.name.trim() && num(f.kcal) > 0;
  const field = (k, label, mode = 'decimal') => (
    <label className="block">
      <span className="text-xs font-semibold text-slate-400">{label}</span>
      <input
        inputMode={mode}
        value={f[k]}
        onChange={(e) => setF({ ...f, [k]: e.target.value })}
        className="mt-1 w-full rounded-xl border border-white/10 bg-ink px-3 py-2.5 text-[15px] outline-none focus:border-red-500"
      />
    </label>
  );
  return (
    <div className="space-y-3 overflow-y-auto px-5 pb-5">
      {field('name', 'Nom (ex. « Bol de riz poulet maison »)', 'text')}
      <div className="grid grid-cols-2 gap-3">
        {field('kcal', 'Calories (kcal)')}
        {field('p', 'Protéines (g)')}
        {field('c', 'Glucides (g)')}
        {field('f', 'Lipides (g)')}
      </div>
      <Toggle checked={save} onChange={setSave} label="Enregistrer dans « Mes aliments »" />
      <div className="grid grid-cols-2 gap-2">
        <Button variant="ghost" onClick={onCancel}>Annuler</Button>
        <Button disabled={!valid} onClick={() => onSave({ name: f.name.trim(), emoji: f.emoji, portion: f.portion, kcal: num(f.kcal), p: num(f.p), c: num(f.c), f: num(f.f) }, save)}>Ajouter</Button>
      </div>
    </div>
  );
}

/* ───────────────────────────── Poids ───────────────────────────── */

function Weight() {
  const { state, setWeight, setProfile } = useStore();
  const todayKey = toKey(new Date());
  const series = weightSeries(state);
  const last = series[series.length - 1];
  const [value, setValue] = useState(() => (state.weights[todayKey] ?? last?.kg ?? state.profile.weight).toFixed(1));
  const rate = weeklyRate(state);
  const suggestion = adjustmentSuggestion(state);
  const t = targets(state);
  const start = series[0];
  const goalHint = GOALS.find((g) => g.id === state.profile.goal)?.hint;
  const kg = Number(String(value).replace(',', '.'));

  const bump = (d) => setValue((Math.round((kg + d) * 10) / 10).toFixed(1));

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-300"><Scale size={18} className="text-red-400" /> Pesée du jour</div>
        <div className="mt-4 flex items-center justify-center gap-4">
          <button onClick={() => bump(-0.1)} className="grid h-12 w-12 place-items-center rounded-full bg-white/[0.06]" aria-label="-100 g"><Minus size={20} /></button>
          <div className="flex items-baseline gap-1">
            <input
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-28 bg-transparent text-center text-5xl font-black tabular-nums outline-none"
              aria-label="Poids en kg"
            />
            <span className="text-lg font-bold text-slate-500">kg</span>
          </div>
          <button onClick={() => bump(0.1)} className="grid h-12 w-12 place-items-center rounded-full bg-white/[0.06]" aria-label="+100 g"><Plus size={20} /></button>
        </div>
        <Button className="mt-5 w-full" disabled={!(kg > 30 && kg < 200)} onClick={() => setWeight(todayKey, Math.round(kg * 10) / 10)}>
          {state.weights[todayKey] != null ? 'Mettre à jour la pesée' : 'Enregistrer'}
        </Button>
        <p className="mt-3 text-center text-xs text-slate-500">Le matin, à jeun, après les toilettes. Le poids varie de ±1 kg d’un jour à l’autre : seule la moyenne compte.</p>
      </Card>

      <div className="grid grid-cols-3 gap-2">
        <Tile label="Moyenne 7 j" value={last ? `${last.avg.toFixed(1)}` : '—'} unit="kg" />
        <Tile label="Depuis le début" value={start && last ? `${last.avg - start.kg >= 0 ? '+' : ''}${(last.avg - start.kg).toFixed(1)}` : '—'} unit="kg" />
        <Tile
          label="Rythme"
          value={rate == null ? '—' : `${rate >= 0 ? '+' : ''}${rate.toFixed(2)}`}
          unit="kg/sem"
          icon={rate == null ? null : rate >= 0 ? <TrendingUp size={14} className="text-emerald-400" /> : <TrendingDown size={14} className="text-red-400" />}
        />
      </div>

      {suggestion && (
        <Card className="p-5 ring-1 ring-amber-500/30">
          <div className="flex gap-3">
            <Sparkles size={20} className="mt-0.5 shrink-0 text-amber-400" />
            <div className="min-w-0 flex-1">
              <div className="font-bold">Ajustement conseillé : {suggestion.delta > 0 ? '+' : ''}{suggestion.delta} kcal / jour</div>
              <p className="mt-1 text-sm leading-relaxed text-slate-400">
                {suggestion.reason} Rythme mesuré : {suggestion.rate >= 0 ? '+' : ''}{suggestion.rate.toFixed(2)} kg/sem ({goalHint}). Nouvel objectif : {t.kcal + suggestion.delta} kcal.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button variant="ghost" onClick={() => setProfile({ lastAdjustAt: todayKey })}>Plus tard</Button>
                <Button onClick={() => setProfile({ adjustment: (state.profile.adjustment || 0) + suggestion.delta, lastAdjustAt: todayKey })}>Appliquer</Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div>
        <SectionTitle>Courbe</SectionTitle>
        <Card className="p-4">
          <WeightChart series={series.slice(-60)} />
          {rate == null && series.length >= 2 && <p className="mt-2 text-xs text-slate-500">Le rythme et les ajustements automatiques s’affichent après ~1 semaine de pesées (4 minimum).</p>}
        </Card>
      </div>

      {series.length > 0 && (
        <div>
          <SectionTitle>Historique</SectionTitle>
          <Card className="divide-y divide-white/[0.05] px-4">
            {[...series].reverse().slice(0, 14).map((p) => (
              <div key={p.key} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-slate-300">{formatShort(p.date)}</span>
                <span className="flex items-center gap-3">
                  <span className="font-bold tabular-nums">{p.kg.toFixed(1)} kg</span>
                  <button onClick={() => setWeight(p.key, null)} className="rounded-full p-1.5 text-slate-600 hover:text-red-400" aria-label="Supprimer la pesée"><Trash2 size={14} /></button>
                </span>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}

function Tile({ label, value, unit, icon }) {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">{icon}{label}</div>
      <div className="mt-1 text-lg font-black tabular-nums sm:text-xl">{value}<span className="ml-0.5 block text-[11px] sm:inline font-semibold text-slate-500">{unit}</span></div>
    </Card>
  );
}

/* ───────────────────────────── Profil ───────────────────────────── */

function Profile() {
  const { state, setProfile, setSettings } = useStore();
  const p = state.profile;
  const t = targets(state);
  const goal = GOALS.find((g) => g.id === p.goal);

  const num = (k, label, unit, min, max) => (
    <label className="flex items-center justify-between gap-4 py-3">
      <span className="text-[15px] font-medium">{label}</span>
      <span className="flex items-center gap-1.5">
        <input
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={p[k]}
          onChange={(e) => setProfile({ [k]: e.target.value === '' ? '' : Number(e.target.value) })}
          onBlur={(e) => setProfile({ [k]: Math.min(max, Math.max(min, Number(e.target.value) || min)) })}
          className="w-20 rounded-xl border border-white/10 bg-ink px-3 py-2 text-center font-semibold tabular-nums outline-none focus:border-red-500"
        />
        <span className="w-6 text-sm text-slate-500">{unit}</span>
      </span>
    </label>
  );

  const enableMealReminders = async (on) => {
    if (!on) return setSettings({ mealReminders: false });
    const perm = await requestPermission();
    if (perm === 'granted') setSettings({ mealReminders: true, notifications: true });
  };

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden p-5">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-red-500/20 blur-3xl" />
        <div className="relative">
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-red-400">Tes objectifs du jour</div>
          <div className="mt-1 text-4xl font-black tabular-nums">{t.kcal} <span className="text-lg text-slate-400">kcal</span></div>
          <div className="mt-3 grid grid-cols-4 gap-2 text-center">
            <Mini label="Protéines" value={`${t.protein} g`} />
            <Mini label="Glucides" value={`${t.carbs} g`} />
            <Mini label="Lipides" value={`${t.fat} g`} />
            <Mini label="Eau" value={`${(t.water / 1000).toFixed(1).replace('.', ',')} L`} />
          </div>
          <div className="mt-4 space-y-1.5 text-[13px] text-slate-400">
            <Row label="Métabolisme de base (Mifflin-St Jeor)" value={`${t.bmr} kcal`} />
            <Row label={`Dépense estimée (× ${ACTIVITY_LEVELS.find((a) => a.id === p.activity)?.factor})`} value={`${t.maintenance} kcal`} />
            <Row label={`Surplus « ${goal.label} »`} value={`+${goal.surplus} kcal`} />
            {!!p.adjustment && <Row label="Ajustements selon ta courbe" value={`${p.adjustment > 0 ? '+' : ''}${p.adjustment} kcal`} />}
            <Row label="Cible finale" value={`${t.full} kcal`} strong />
            {t.rampWeek && <Row label={`Montée progressive (sem. ${t.rampWeek})`} value={`${t.kcal} kcal aujourd’hui`} />}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">Estimation de départ. La vraie dépense se lit sur ta courbe de poids : l’app propose d’ajuster toutes les 2 semaines.</p>
        </div>
      </Card>

      <div>
        <SectionTitle>Profil</SectionTitle>
        <Card className="divide-y divide-white/[0.06] px-5">
          <label className="flex items-center justify-between gap-4 py-3">
            <span className="text-[15px] font-medium">Prénom</span>
            <input value={p.name} onChange={(e) => setProfile({ name: e.target.value })} className="w-36 rounded-xl border border-white/10 bg-ink px-3 py-2 text-right font-semibold outline-none focus:border-red-500" />
          </label>
          {num('age', 'Âge', 'ans', 14, 80)}
          {num('height', 'Taille', 'cm', 140, 220)}
          {num('weight', 'Poids de départ', 'kg', 35, 200)}
        </Card>
        <p className="mt-2 px-1 text-xs text-slate-500">Dès que tu te pèses, les calculs utilisent ta dernière pesée.</p>
      </div>

      <div>
        <SectionTitle>Activité</SectionTitle>
        <div className="grid gap-2">
          {ACTIVITY_LEVELS.map((a) => (
            <Choice key={a.id} active={p.activity === a.id} onClick={() => setProfile({ activity: a.id })} title={a.label} hint={`${a.hint} · × ${a.factor}`} />
          ))}
        </div>
      </div>

      <div>
        <SectionTitle>Objectif</SectionTitle>
        <div className="grid gap-2">
          {GOALS.map((g) => (
            <Choice key={g.id} active={p.goal === g.id} onClick={() => setProfile({ goal: g.id })} title={g.label} hint={`${g.surplus ? `+${g.surplus} kcal` : '±0 kcal'} · ${g.hint}`} />
          ))}
        </div>
      </div>

      <div>
        <SectionTitle>Petit appétit</SectionTitle>
        <Card className="divide-y divide-white/[0.06] px-5">
          <Toggle
            checked={p.ramp.enabled}
            onChange={(v) => setProfile({ ramp: { ...p.ramp, enabled: v, startDate: toKey(new Date()) } })}
            label="Montée progressive"
            hint={`Démarre à ce que tu manges aujourd’hui et ajoute ${RAMP_STEP} kcal par semaine jusqu’à la cible.`}
          />
          {p.ramp.enabled && (
            <label className="flex items-center justify-between gap-4 py-3">
              <span>
                <span className="block text-[15px] font-medium">Ce que tu manges aujourd’hui</span>
                <span className="block text-[13px] text-slate-400">Estimation, point de départ</span>
              </span>
              <span className="flex items-center gap-1.5">
                <input
                  type="number"
                  inputMode="numeric"
                  step="50"
                  value={p.ramp.startKcal}
                  onChange={(e) => setProfile({ ramp: { ...p.ramp, startKcal: Number(e.target.value) || 0 } })}
                  className="w-24 rounded-xl border border-white/10 bg-ink px-3 py-2 text-center font-semibold tabular-nums outline-none focus:border-red-500"
                />
                <span className="text-sm text-slate-500">kcal</span>
              </span>
            </label>
          )}
          <Toggle
            checked={state.settings.mealReminders && state.settings.notifications}
            onChange={enableMealReminders}
            label={<span className="flex items-center gap-2"><Bell size={16} className="text-slate-400" />Rappels de collation</span>}
            hint="Notification avec les kcal restantes."
          />
          {state.settings.mealReminders && (
            <div className="flex flex-wrap gap-2 py-3">
              {state.settings.mealTimes.map((time, i) => (
                <input
                  key={i}
                  type="time"
                  value={time}
                  onChange={(e) => {
                    const next = [...state.settings.mealTimes];
                    next[i] = e.target.value;
                    setSettings({ mealTimes: next });
                  }}
                  className="rounded-xl border border-white/10 bg-ink px-3 py-2 text-sm tabular-nums outline-none [color-scheme:dark] focus:border-red-500"
                />
              ))}
            </div>
          )}
        </Card>
        {!!p.adjustment && (
          <button onClick={() => setProfile({ adjustment: 0, lastAdjustAt: null })} className="mt-3 w-full rounded-2xl py-2.5 text-sm font-semibold text-slate-400 hover:bg-white/5">
            Réinitialiser les ajustements ({p.adjustment > 0 ? '+' : ''}{p.adjustment} kcal)
          </button>
        )}
      </div>
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/[0.05] px-1 py-2.5">
      <div className="text-[15px] font-black tabular-nums">{value}</div>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
}

function Row({ label, value, strong }) {
  return (
    <div className={`flex justify-between gap-3 ${strong ? 'font-semibold text-slate-200' : ''}`}>
      <span>{label}</span>
      <span className="shrink-0 tabular-nums">{value}</span>
    </div>
  );
}

function Choice({ active, onClick, title, hint }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors ${active ? 'border-red-500/50 bg-red-500/10' : 'border-white/[0.06] bg-ink-800/60 hover:bg-white/[0.03]'}`}
    >
      <span>
        <span className="block text-[15px] font-semibold">{title}</span>
        <span className="block text-xs text-slate-400">{hint}</span>
      </span>
      <span className={`h-5 w-5 rounded-full border-2 ${active ? 'border-red-500 bg-red-500 shadow-[inset_0_0_0_3px_#0D1320]' : 'border-ink-500'}`} />
    </motion.button>
  );
}
