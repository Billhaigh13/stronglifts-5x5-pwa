import type { ExerciseId, ExerciseMode, ExerciseProgressState, InactivityDeloadSuggestion, UserSettings } from '../types';
import { DEFAULT_DUMBBELL_INVENTORY, EXERCISE_DEFINITIONS } from './constants';

export interface InactivityOptions {
  now?: number | Date;
  barWeight?: number;
  dumbbellInventory?: number[];
  mode?: ExerciseMode;
}

/**
 * Calculates a deload suggestion for an exercise based on days elapsed since it was last completed.
 * Tiers:
 * - 0–7 days: 0% (null)
 * - 8–14 days (1–2 weeks): -10%
 * - 15–21 days (2–3 weeks): -20%
 * - 22–30 days (3–4 weeks): -30%
 * - 31+ days (> 1 month): -50%
 */
export function calculateInactivityDeload(
  exerciseId: ExerciseId,
  currentWeight: number,
  lastCompletedDate: string | undefined | null,
  options: InactivityOptions = {}
): InactivityDeloadSuggestion | null {
  if (!lastCompletedDate) {
    return null;
  }

  const lastTime = new Date(lastCompletedDate).getTime();
  if (isNaN(lastTime)) {
    return null;
  }

  const currentTime = options.now ? new Date(options.now).getTime() : Date.now();
  const diffMs = currentTime - lastTime;
  if (diffMs < 0) {
    return null;
  }

  const daysElapsed = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (daysElapsed < 8) {
    return null;
  }

  // Determine tiered deload percentage
  let percent: number;
  if (daysElapsed <= 14) {
    percent = 10;
  } else if (daysElapsed <= 21) {
    percent = 20;
  } else if (daysElapsed <= 30) {
    percent = 30;
  } else {
    percent = 50;
  }

  const def = EXERCISE_DEFINITIONS[exerciseId];
  const barWeight = options.barWeight ?? 20;
  const isSkullcrushers = exerciseId === 'skullcrushers';
  const skullcrusherMode = isSkullcrushers
    ? (options.mode === 'barbell' || (currentWeight >= 20 && options.mode !== 'dumbbell') ? 'barbell' : 'dumbbell')
    : undefined;

  const isDumbbell = isSkullcrushers
    ? skullcrusherMode === 'dumbbell'
    : def?.category === 'dumbbell_accessory' || options.mode === 'dumbbell';

  const isBodyweight = (exerciseId === 'pullups' || exerciseId === 'dips' || options.mode === 'bodyweight' || def?.category === 'bodyweight_accessory') && options.mode !== 'weighted';

  // 1. Unweighted Bodyweight Exercises: cannot deload 0 kg added weight
  if (isBodyweight) {
    return null;
  }

  // 2. Weighted Pull-ups / Dips: deload the added load
  if ((exerciseId === 'pullups' || exerciseId === 'dips') && options.mode === 'weighted') {
    if (currentWeight <= 0) return null;
    const rawDeload = currentWeight * ((100 - percent) / 100);
    const suggestedWeight = Math.max(0, Math.round(rawDeload / 1.25) * 1.25);
    if (suggestedWeight >= currentWeight) return null;

    return {
      exerciseId,
      exerciseName: def?.name || exerciseId,
      daysElapsed,
      percent,
      currentWeight,
      suggestedWeight,
    };
  }

  // 3. Dumbbell Exercises
  if (isDumbbell) {
    const rawInv = options.dumbbellInventory && options.dumbbellInventory.length > 0
      ? options.dumbbellInventory
      : DEFAULT_DUMBBELL_INVENTORY;
    const sortedInv = [...rawInv].sort((a, b) => a - b);
    const currentIndex = sortedInv.findIndex((w) => w >= currentWeight);

    if (currentIndex <= 0) {
      // Already at or below lowest dumbbell in inventory
      return null;
    }

    let targetIndex: number;
    if (percent === 10) {
      targetIndex = Math.max(0, currentIndex - 1);
    } else if (percent === 20) {
      targetIndex = Math.max(0, currentIndex - 2);
    } else if (percent === 30) {
      targetIndex = Math.max(0, currentIndex - 3);
    } else {
      // 50% deload: find closest dumbbell to half the current weight
      const halfWeight = currentWeight * 0.5;
      let closestIdx = 0;
      let minDiff = Infinity;
      sortedInv.forEach((w, idx) => {
        const diff = Math.abs(w - halfWeight);
        if (diff < minDiff && idx < currentIndex) {
          minDiff = diff;
          closestIdx = idx;
        }
      });
      targetIndex = closestIdx;
    }

    const suggestedWeight = sortedInv[targetIndex];
    if (suggestedWeight >= currentWeight) {
      return null;
    }

    return {
      exerciseId,
      exerciseName: def?.name || exerciseId,
      daysElapsed,
      percent,
      currentWeight,
      suggestedWeight,
    };
  }

  // 4. Barbell Compound Lifts
  const isFloorLift = def?.isFloorLift || exerciseId === 'deadlift' || exerciseId === 'row';
  const minFloor = isFloorLift ? 40 : barWeight;

  if (currentWeight <= minFloor) {
    return null;
  }

  const rawDeload = currentWeight * ((100 - percent) / 100);
  const suggestedWeight = Math.max(minFloor, Math.round(rawDeload / 2.5) * 2.5);

  if (suggestedWeight >= currentWeight) {
    return null;
  }

  return {
    exerciseId,
    exerciseName: def?.name || exerciseId,
    daysElapsed,
    percent,
    currentWeight,
    suggestedWeight,
  };
}

/**
 * Checks all exercises in a routine and returns all inactivity deload suggestions.
 */
export function checkRoutineInactivitySuggestions(
  routineExerciseIds: ExerciseId[],
  exerciseProgress: Record<ExerciseId, ExerciseProgressState>,
  userSettings: UserSettings,
  lastWorkoutDate?: string,
  now?: number | Date
): InactivityDeloadSuggestion[] {
  if (userSettings.enableInactivityDeload === false) {
    return [];
  }

  const suggestions: InactivityDeloadSuggestion[] = [];

  for (const exId of routineExerciseIds) {
    const prog = exerciseProgress[exId];
    const def = EXERCISE_DEFINITIONS[exId];
    if (!def) continue;

    const lastCompleted = prog?.lastCompletedDate || lastWorkoutDate;
    if (!lastCompleted) continue;

    const baseWeight = prog ? prog.currentWeight : def.defaultWeight;
    const mode = prog?.mode;

    const suggestion = calculateInactivityDeload(exId, baseWeight, lastCompleted, {
      now,
      barWeight: userSettings.barWeight,
      dumbbellInventory: userSettings.dumbbellInventory,
      mode,
    });

    if (suggestion) {
      suggestions.push(suggestion);
    }
  }

  return suggestions;
}
