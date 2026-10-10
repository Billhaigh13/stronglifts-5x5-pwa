import type { ExerciseId, ExerciseMode, ExerciseProgressState, ExerciseProgressionConfig, InactivityDeloadSuggestion, UserSettings } from '../types';
import { DEFAULT_DUMBBELL_INVENTORY, DEFAULT_PROGRESSION_CONFIGS, EXERCISE_DEFINITIONS } from './constants';

export interface InactivityOptions {
  now?: number | Date;
  barWeight?: number;
  dumbbellInventory?: number[];
  mode?: ExerciseMode;
  currentReps?: number;
  progressionConfig?: ExerciseProgressionConfig;
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

    const isDoubleProg = (def?.category === 'dumbbell_accessory' || options.progressionConfig?.strategy === 'double_progression' || exerciseId === 'bicep_curl' || exerciseId === 'hammer_curl') && !isSkullcrushers;

    if (isDoubleProg) {
      const repRangeMin = options.progressionConfig?.repRangeMin ?? def?.repRangeMin ?? 8;
      const repRangeMax = options.progressionConfig?.repRangeMax ?? def?.repRangeMax ?? 12;
      const repStep = options.progressionConfig?.repStep ?? 2;
      const currentReps = options.currentReps ?? repRangeMin;

      // Tier 1: 8–14 days (1–2 weeks off / 10%)
      if (percent === 10) {
        if (currentReps > repRangeMin) {
          // Option 1: Step down 1 rung on the rep ladder at the SAME weight! (e.g. 12 -> 10, or 10 -> 8)
          const suggestedReps = Math.max(repRangeMin, currentReps - repStep);
          return {
            exerciseId,
            exerciseName: def?.name || exerciseId,
            daysElapsed,
            percent,
            currentWeight,
            suggestedWeight: currentWeight,
            currentReps,
            suggestedReps,
          };
        } else {
          // Already at bottom of ladder (e.g. 8 reps) -> drop 1 dumbbell size in rack
          if (currentIndex <= 0) return null;
          const suggestedWeight = sortedInv[currentIndex - 1];
          const suggestedReps = Math.max(repRangeMin, repRangeMax - repStep);
          return {
            exerciseId,
            exerciseName: def?.name || exerciseId,
            daysElapsed,
            percent,
            currentWeight,
            suggestedWeight,
            currentReps,
            suggestedReps,
          };
        }
      }

      // Tier 2: 15–21 days (2–3 weeks off / 20%)
      if (percent === 20) {
        if (currentReps >= repRangeMax) {
          // Step down 2 rungs to min reps at SAME weight (e.g. 12 -> 8 reps @ 10kg)
          return {
            exerciseId,
            exerciseName: def?.name || exerciseId,
            daysElapsed,
            percent,
            currentWeight,
            suggestedWeight: currentWeight,
            currentReps,
            suggestedReps: repRangeMin,
          };
        } else {
          // Drop 1 dumbbell size in rack
          if (currentIndex <= 0) {
            if (currentReps > repRangeMin) {
              return {
                exerciseId,
                exerciseName: def?.name || exerciseId,
                daysElapsed,
                percent,
                currentWeight,
                suggestedWeight: currentWeight,
                currentReps,
                suggestedReps: repRangeMin,
              };
            }
            return null;
          }
          const suggestedWeight = sortedInv[currentIndex - 1];
          const suggestedReps = currentReps > repRangeMin ? Math.max(repRangeMin, repRangeMax - repStep) : repRangeMin;
          return {
            exerciseId,
            exerciseName: def?.name || exerciseId,
            daysElapsed,
            percent,
            currentWeight,
            suggestedWeight,
            currentReps,
            suggestedReps,
          };
        }
      }

      // Tier 3: 22–30 days (3–4 weeks off / 30%)
      if (percent === 30) {
        if (currentIndex <= 0) {
          if (currentReps > repRangeMin) {
            return {
              exerciseId,
              exerciseName: def?.name || exerciseId,
              daysElapsed,
              percent,
              currentWeight,
              suggestedWeight: currentWeight,
              currentReps,
              suggestedReps: repRangeMin,
            };
          }
          return null;
        }
        const suggestedWeight = sortedInv[currentIndex - 1];
        return {
          exerciseId,
          exerciseName: def?.name || exerciseId,
          daysElapsed,
          percent,
          currentWeight,
          suggestedWeight,
          currentReps,
          suggestedReps: repRangeMin,
        };
      }

      // Tier 4: 31+ days (> 1 month / 50%)
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
      const suggestedWeight = sortedInv[closestIdx];
      if (suggestedWeight >= currentWeight && currentReps <= repRangeMin) {
        return null;
      }
      return {
        exerciseId,
        exerciseName: def?.name || exerciseId,
        daysElapsed,
        percent,
        currentWeight,
        suggestedWeight: suggestedWeight < currentWeight ? suggestedWeight : currentWeight,
        currentReps,
        suggestedReps: repRangeMin,
      };
    }

    // Fixed Dumbbell Exercises (e.g. Skullcrushers 3x10 in dumbbell mode):
    if (currentIndex <= 0) {
      return null;
    }

    let targetIndex: number;
    if (percent <= 20) {
      // 8–21 days: cap at 1 dumbbell size drop
      targetIndex = Math.max(0, currentIndex - 1);
    } else if (percent === 30) {
      // 22–30 days: drop 2 dumbbell sizes
      targetIndex = Math.max(0, currentIndex - 2);
    } else {
      // 50% deload
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
    const config = userSettings.progressionConfigs?.[exId] || DEFAULT_PROGRESSION_CONFIGS[exId];
    const currentReps = prog?.targetRepsPerSet || config?.repRangeMin || def?.repRangeMin;

    const suggestion = calculateInactivityDeload(exId, baseWeight, lastCompleted, {
      now,
      barWeight: userSettings.barWeight,
      dumbbellInventory: userSettings.dumbbellInventory,
      mode,
      currentReps,
      progressionConfig: config,
    });

    if (suggestion) {
      suggestions.push(suggestion);
    }
  }

  return suggestions;
}
