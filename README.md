# THENX Tracker — Callisthénie × Boxe × Foot

**App en ligne : https://mxthispp.github.io/thenx-tracker/**

PWA mobile-first (React 18 + Vite + Tailwind + Framer Motion + Lucide) pour suivre un programme THENX haut du corps de 4 semaines, calé sur la boxe (mardi/jeudi) et le foot (samedi).

## Lancer

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/ statique, déployable tel quel (Netlify, Vercel, GitHub Pages…)
npm run preview  # sert le build (service worker actif)
```

Chaque push sur `main` reconstruit et publie l'app sur la branche `gh-pages` (workflow `.github/workflows/deploy.yml`).

Installation sur téléphone : ouvre l'URL dans Safari/Chrome → « Ajouter à l'écran d'accueil ».

## Fonctionnalités

- **Aujourd'hui** : détection du jour, séance mise en avant, série 🔥, anneaux semaine / programme, bandeau des 7 jours, validation Boxe/Foot.
- **Planning 4 semaines** : sélecteur S1→S4 avec réglages automatiques (30/30 → 40/20 → 45/15 → maintien ou décharge -20 %), repos court 15 s en option, 7 cartes jour.
- **Workout Player** : vidéo YouTube embarquée (IFrame API), timer HIIT généré à partir de la semaine, saut automatique aux timestamps de la vidéo Abdos, checklist (reps, RPE /10, notes), exercices cochés automatiquement à la fin de leur dernière série, combo Épaules → Abdos avec transition.
- **Timer HIIT** : préréglages Débutant 30/15, Intermédiaire 40/15, Avancé 45/15, Perso ; anneau coloré par phase ; bips Web Audio 3-2-1 + bip long ; annonce vocale `speechSynthesis` ; écran maintenu allumé (Wake Lock).
- **Stats & Rappels** : calendrier mensuel (THENX / Boxe / Foot), séries, RPE moyen, répartition, notification quotidienne, export `.ics` (4 semaines, liens YouTube, alerte 30 min), export/import JSON, réinitialisation.

## Planning optimisé boxe

Le planning demandé place **Pectoraux & Triceps le mercredi, veille de la boxe du jeudi**, ce qui contredit la règle « jamais triceps/épaules la veille de la boxe ». L'app garde ce planning par défaut, le signale, et propose un interrupteur **Planning optimisé boxe** (onglet Planning) qui inverse mercredi (Abdos) et vendredi (Push).

## Limites connues

- Les notifications web ne partent que si l'app est ouverte ou active en arrière-plan (pas de serveur push). L'export `.ics` assure des rappels fiables.
- Sur iPhone, les notifications nécessitent iOS 16.4+ et l'app installée sur l'écran d'accueil.

## Structure

```
src/
  data/program.js       vidéos, exercices, timestamps, planning, semaines, préréglages
  lib/                  store localStorage, dates, stats, séquences timer, audio, .ics, notifications
  components/           HiitTimer, WorkoutPlayer, YouTubePlayer, ProgressRing, navigation, UI
  views/                Today, Planning, TimerView, Stats
public/                 manifest, service worker, icônes
```
