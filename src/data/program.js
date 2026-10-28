// Programme THENX haut du corps + Boxe (mardi/jeudi) + Football (samedi).
// Aucune séance jambes, aucun cardio dédié, tout au poids du corps sans matériel.

export const WORKOUTS = {
  push: {
    id: 'push',
    title: 'Pectoraux & Triceps',
    tag: 'Push',
    videoTitle: 'No Gym? DO THIS Chest Workout From Home (THENX)',
    youtubeId: 'ILIe_KJ_bKk',
    duration: 10,
    accent: 'red',
    muscles: ['Pectoraux', 'Triceps', 'Deltoïdes antérieurs'],
    exercises: [
      { id: 'push-1', name: 'Standard Push-ups', fr: 'Pompes classiques contrôlées', cue: 'Corps gainé, coudes à 45°, poitrine au ras du sol.' },
      { id: 'push-2', name: 'Wide Push-ups', fr: 'Pompes mains larges — pectoraux externes', cue: 'Mains plus larges que les épaules, descente lente.' },
      { id: 'push-3', name: 'Diamond Push-ups', fr: 'Pompes diamant — triceps & intérieur des pecs', cue: 'Index et pouces en losange sous le sternum, coudes serrés.' },
      { id: 'push-4', name: 'Decline / Explosive Push-ups', fr: 'Pompes déclinées ou explosives', cue: 'Pieds surélevés ou poussée explosive, réception amortie.' },
      { id: 'push-5', name: 'Low Plank Hold', fr: 'Maintien isométrique en bas de pompe', cue: 'Bloque à 2–3 cm du sol, respire, ne creuse pas le dos.' },
    ],
  },
  back: {
    id: 'back',
    title: 'Dos & Posture',
    tag: 'Pull',
    videoTitle: 'Do This Back Workout From Home | No Equipment (THENX)',
    youtubeId: 'QqZV3JEoOlc',
    duration: 10,
    accent: 'sky',
    muscles: ['Grand dorsal', 'Rhomboïdes', 'Lombaires', 'Arrière d’épaule'],
    exercises: [
      { id: 'back-1', name: 'Sliding Floor Pulls', fr: 'Tirages au sol sur avant-bras/mains', cue: 'Tire le corps vers l’avant avec les dorsaux, pas les bras.' },
      { id: 'back-2', name: 'Superman / Back Extensions', fr: 'Extensions lombaires — chaîne postérieure', cue: 'Décolle bras et jambes, regard vers le sol, 1 s en haut.' },
      { id: 'back-3', name: 'Prone Scapular Retractions', fr: 'Rétractions scapulaires face au sol', cue: 'Serre les omoplates vers le bas et l’arrière.' },
      { id: 'back-4', name: 'Reverse Snow Angels', fr: 'Anges inversés — arrière d’épaule', cue: 'Bras décollés, grand arc lent des hanches au-dessus de la tête.' },
      { id: 'back-5', name: 'Isometric Back Squeeze', fr: 'Maintien isométrique du dos', cue: 'Contracte tout le dos, coudes vers les hanches, tiens.' },
    ],
  },
  shoulders: {
    id: 'shoulders',
    title: 'Épaules',
    tag: 'Garde & Endurance',
    videoTitle: 'BEST Shoulder Workout With Body Weight ONLY (THENX)',
    youtubeId: 't6GwUVHzTSM',
    duration: 9,
    accent: 'amber',
    muscles: ['Deltoïdes antérieurs', 'Deltoïdes moyens', 'Coiffe des rotateurs'],
    exercises: [
      { id: 'sh-1', name: 'Pike Push-ups', fr: 'Pompes piquées — deltoïdes antérieurs/moyens', cue: 'Hanches hautes, tête vers l’avant des mains en triangle.' },
      { id: 'sh-2', name: 'Pseudo Planche Lean Push-ups', fr: 'Pompes inclinées vers l’avant', cue: 'Mains au niveau des hanches, épaules projetées devant les mains.' },
      { id: 'sh-3', name: 'Scapular Push-ups', fr: 'Pompes scapulaires — stabilité', cue: 'Bras tendus, seules les omoplates bougent.' },
      { id: 'sh-4', name: 'Side Plank Shoulder Taps', fr: 'Planche latérale, taps & rotations', cue: 'Hanches immobiles, épaule d’appui active.' },
      { id: 'sh-5', name: 'Pike Hold', fr: 'Maintien en V inversé', cue: 'Pousse le sol, oreilles entre les bras, tiens.' },
    ],
  },
  abs: {
    id: 'abs',
    title: 'Abdos Express 6 min',
    tag: 'Core & Gainage Boxe',
    videoTitle: '6 Min 6-PACK Abs Workout For Summer 2026 (THENX)',
    youtubeId: 'HYGGcCxbuTY',
    duration: 6,
    accent: 'violet',
    muscles: ['Grand droit', 'Obliques', 'Transverse'],
    fixedFormat: true, // 6 × 1 min (effort + repos) quel que soit le niveau
    exercises: [
      { id: 'abs-1', name: 'Leg Raises', fr: 'Relevés de jambes au sol, mains le long du corps', ts: 124, cue: 'Bas du dos plaqué, descente lente sans toucher le sol.' },
      { id: 'abs-2', name: 'Crunch Reach Throughs', fr: 'Crunch + frappe croisée entre les jambes', ts: 175, cue: 'Grand droit + obliques, alterne les côtés.' },
      { id: 'abs-3', name: 'Switching Mountain Climbers', fr: 'Genou vers coude opposé en croisant', ts: 235, cue: 'Position pompe, hanches basses, rythme régulier.' },
      { id: 'abs-4', name: 'Russian Twists', fr: 'Rotation du buste, pieds décollés ou posés', ts: 297, cue: 'Tourne les épaules, pas seulement les bras.' },
      { id: 'abs-5', name: 'Seated In and Outs', fr: 'Genoux à la poitrine puis jambes tendues', ts: 355, cue: 'Buste légèrement incliné, contrôle le retour.' },
      { id: 'abs-6', name: 'Jumping In and Outs', fr: 'Planche bras tendus, pieds sautés vers les mains', ts: 414, cue: 'Atterris souple, gainage maximal.' },
    ],
  },
};

export const ACTIVITIES = {
  boxe: { id: 'boxe', title: 'Boxe', emoji: '🥊', subtitle: 'Entraînement principal', accent: 'rose' },
  foot: { id: 'foot', title: 'Football', emoji: '⚽', subtitle: 'Match ou entraînement', accent: 'emerald' },
  footRecup: { id: 'footRecup', title: 'Foot / Récupération', emoji: '⚽', subtitle: 'Optionnel', accent: 'emerald', optional: true },
  course: { id: 'course', title: 'Course / Repos', emoji: '🏃', subtitle: 'Optionnel', accent: 'cyan', optional: true },
};

export const DAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
export const DAY_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

// Planning demandé. Attention : le Push du mercredi tombe la veille de la boxe du jeudi,
// ce qui contredit la règle « jamais épaules/triceps la veille de la boxe ».
const ORIGINAL = [
  { session: ['back'], activities: [], note: 'Ne fatigue pas la poussée avant la boxe du mardi.' },
  { session: [], activities: ['boxe'], note: 'Repos callisthénie pour garder la fraîcheur des bras.' },
  {
    session: ['push'],
    activities: ['footRecup'],
    note: 'Veille de boxe : reste 2 reps avant l’échec, pas d’explosif à fond.',
    warning: 'Push la veille de la boxe du jeudi : triceps & épaules sollicités. Active le planning optimisé pour l’éviter.',
  },
  { session: [], activities: ['boxe'], note: 'Repos callisthénie.' },
  { session: ['abs'], activities: ['course'], note: 'Gainage court, idéal avant le foot du samedi.' },
  { session: [], activities: ['foot'], note: 'Travail des jambes et cardio.' },
  { session: ['shoulders', 'abs'], activities: [], note: '48 h avant la boxe du mardi.' },
];

// Variante qui respecte strictement la règle boxe : Push le vendredi (après la boxe du jeudi,
// 4 jours avant celle du mardi) et Abdos le mercredi (le gainage n’entame pas la garde).
const OPTIMIZED = ORIGINAL.map((d, i) => {
  if (i === 2) return { session: ['abs'], activities: ['footRecup'], note: 'Gainage express : n’entame pas la garde pour la boxe du jeudi.' };
  if (i === 4) return { session: ['push'], activities: ['course'], note: 'Lendemain de boxe, 4 jours avant la prochaine : fenêtre idéale pour pousser fort.' };
  return d;
});

export function getSchedule(variant = 'original') {
  return variant === 'optimized' ? OPTIMIZED : ORIGINAL;
}

export const WEEKS = [
  {
    n: 1,
    name: 'Fondations',
    level: 'Débutant',
    work: 30,
    rest: 30,
    shortRest: 15,
    rounds: 2,
    roundRest: 60,
    transition: 120,
    focus: 'Forme propre avant tout : amplitude complète, gainage, respiration.',
    tips: ['Qualité > quantité : arrête la série si la technique se dégrade.', 'Filme-toi une fois pour vérifier l’alignement.'],
  },
  {
    n: 2,
    name: 'Intermédiaire',
    level: 'Intermédiaire',
    work: 40,
    rest: 20,
    shortRest: 15,
    rounds: 3,
    roundRest: 60,
    transition: 120,
    focus: 'Descente contrôlée de 2–3 s sur toutes les pompes (tempo excentrique).',
    tips: ['Compte « 1-2-3 » en descendant, pousse en 1 s.', 'Ajoute 1 tour si la semaine 1 était facile.'],
  },
  {
    n: 3,
    name: 'Surcharge',
    level: 'Intermédiaire+ / Avancé',
    work: 45,
    rest: 15,
    shortRest: 15,
    rounds: 3,
    roundRest: 45,
    transition: 90,
    focus: 'Densité maximale. Dimanche : Épaules → Abdos avec moins de 2 min de pause.',
    tips: ['Variante plus dure sur chaque exercice (déclinées, pike surélevées…).', 'Dors 8 h : la boxe et le foot comptent dans la charge.'],
  },
  {
    n: 4,
    name: 'Consolidation',
    level: 'Maintien / Décharge',
    work: 40,
    rest: 20,
    shortRest: 15,
    rounds: 3,
    roundRest: 60,
    transition: 120,
    deload: { work: 32, rest: 20, rounds: 3, label: '-20 % de volume' },
    focus: 'Maintiens le niveau, ou active la décharge (-20 %) si le foot et la boxe pèsent.',
    tips: ['Décharge = même technique, moins de temps sous tension.', 'Prépare le cycle suivant : note tes meilleures reps.'],
  },
];

export const TIMER_PRESETS = [
  { id: 'beginner', label: 'Débutant', work: 30, rest: 15 },
  { id: 'intermediate', label: 'Intermédiaire', work: 40, rest: 15 },
  { id: 'advanced', label: 'Avancé', work: 45, rest: 15 },
];

export const PREP_SECONDS = 5;

export function weekConfig(weekN, settings = {}) {
  const w = WEEKS[Math.min(Math.max(weekN, 1), 4) - 1];
  let { work, rest, rounds } = w;
  if (w.deload && settings.deload) ({ work, rest, rounds } = w.deload);
  if (settings.shortRest && w.n <= 2) rest = w.shortRest;
  return { ...w, work, rest, rounds };
}

export function youtubeUrl(id, start) {
  return `https://www.youtube.com/watch?v=${id}${start ? `&t=${start}s` : ''}`;
}

export function fmtTs(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
