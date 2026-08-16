# StrongLifts 5×5 — Offline-First Mobile Workout Tracker

A mobile-first, 100% offline-capable Progressive Web Application (PWA) built specifically for Android and mobile browsers. Designed with high-contrast gym dark mode, large touch targets, automated StrongLifts linear progression, double progression dumbbell ladders, dynamic warm-up calculations, and visual barbell plate loading.

---

## Key Features

### 1. High-Contrast Gym Dark Theme & Mobile-First UX
- **Zinc/Slate Dark Palette**: Optimized for bright gym lighting and AMOLED displays.
- **Large Touch Targets**: 56px interactive set bubbles designed for quick single-tap logging while resting between sets.
- **Set Cycling Logic**: Tap to cycle `[Target] -> [Target - 1] -> ... -> [0] -> [Pending]`.
  - **Completed Sets**: High-contrast glowing emerald badges.
  - **Missed Reps**: Amber / Ruby badges.
  - **Pending Sets**: Slate neutral badge.

### 2. Full Routine Engine & Workout Alternation
- Alternates automatically between **Workout A** and **Workout B** on a 3-day weekly cadence:
  - **Workout A**: Barbell Squat (5×5), Barbell Bench Press (5×5), Barbell Row (5×5), Dumbbell Bicep Curls (3×8–12).
  - **Workout B**: Barbell Squat (5×5), Overhead Press (5×5), Barbell Deadlift (1×5), Pull-ups / Chin-ups (3×AMRAP or 3×5–8 Weighted).

### 3. Automated Progression & Deload Engine
- **Barbell Compound Lifts**:
  - **Success (all target reps achieved)**: Adds +2.5 kg (+5 kg for Deadlift) for the next session.
  - **Failure**: Maintains current weight and logs attempt count (`Attempt 1/3`, `Attempt 2/3`).
  - **Auto-Deload**: After 3 consecutive failed sessions on the same lift, automatically reduces weight by 10% (rounded down to the nearest 2.5 kg) to break through plateaus.
- **Dumbbell Bicep Curls (Double Progression Ladder)**:
  - Default ladder: `[2, 4, 5, 7.5, 9, 10, 12.5, 15, 17.5, 20] kg` (customizable in Settings).
  - Fixed weight until all 3 sets hit 12 reps (`12, 12, 12`).
  - Upon achieving 3×12, automatically jumps to the **next index in the dumbbell inventory array** and resets target reps to 8 for the next session.
- **Pull-ups / Chin-ups**:
  - Toggle between **Bodyweight AMRAP** and **Weighted (+X kg)** mode with custom increments.

### 4. Dynamic Warm-Up Sets Generator
Calculates and presents warm-up sets dynamically based on the day's working weight:
- **Squat / Bench / OHP**:
  - `≤ 30 kg`: 2×5 with empty bar (20 kg).
  - `> 30 kg`: 2×5 @ 20 kg, 1×3 @ ~50%, 1×2 @ ~70%, 1×1 @ ~85% (if work weight ≥ 90 kg).
- **Deadlift / Barbell Row**:
  - `≤ 50 kg`: 1×5 @ 40 kg (or base floor weight).
  - `> 50 kg`: 1×5 @ ~45%, 1×3 @ ~65%, 1×1 @ ~85% (if work weight ≥ 100 kg).
- Warm-up sets are displayed in an expandable checklist above work sets and do **not** count towards session volume or progression.

### 5. Barbell Plate Calculator Modal
- Tap on any barbell exercise weight to open the visual plate loader.
- Graphic barbell sleeve rendering with Olympic standard color-coded plates:
  - 25 kg (Red), 20 kg (Blue), 15 kg (Yellow), 10 kg (Green), 5 kg (White), 2.5 kg (Black), 1.25 kg (Silver).
- Shows exact plate breakdown required per side: `(Total Weight - Bar Weight) / 2`.

### 6. Auto Rest Timer with Audio & Haptics
- Starts automatically upon checking off a set.
  - **90s default** for completed work sets.
  - **Auto-switches to 180s** (3 minutes) if target reps were missed.
- Includes `+30s` button, Skip button, and Play/Pause.
- **Audio & Haptic Alerts**: Uses Web Audio synthesizer chimes (works 100% offline without external mp3s) and HTML5 Vibration API.

### 7. Offline Storage, Analytics & Backup
- **Dexie.js / IndexedDB**: Zero backend or cloud dependencies required. All data persists permanently on your device.
- **Analytics & Progression Graphs**: Interactive SVG line charts tracking weight trends and Estimated 1RM (Brzycki formula) per exercise.
- **Personal Records (PR) Board**: Tracks all-time best weights and rep achievements with gold celebration badges.
- **JSON Export / Import**: One-click local backup and restore to JSON file.

---

## Tech Stack
- **Framework**: React 18 + TypeScript + Vite
- **PWA / Offline**: `vite-plugin-pwa` + Service Worker caching
- **Database**: IndexedDB via `dexie` & `dexie-react-hooks`
- **Styling**: Tailwind CSS + Custom Dark Gym Theme
- **Icons**: Lucide React
- **Celebration Animations**: `canvas-confetti`

---

## Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle with PWA service worker
npm run build
```
