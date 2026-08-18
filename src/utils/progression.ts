import type { ExerciseId, ExerciseLog, ExerciseProgressState, ExerciseProgressionConfig, ProgressionResult } from '../types';
import { DEFAULT_DUMBBELL_INVENTORY, DEFAULT_PROGRESSION_CONFIGS, EXERCISE_DEFINITIONS } from './constants';

export function calculate1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  // Brzycki formula
  return Math.round(weight * (36 / (37 - Math.min(reps, 36))) * 10) / 10;
}

export function calculateNextProgression(
  exerciseId: ExerciseId,
  exerciseLog: ExerciseLog,
  currentProgress: ExerciseProgressState,
  dumbbellInventory: number[] = DEFAULT_DUMBBELL_INVENTORY,
  progressionConfigs?: Partial<Record<ExerciseId, ExerciseProgressionConfig>>
): ProgressionResult {
  const def = EXERCISE_DEFINITIONS[exerciseId] || {
    id: exerciseId,
    name: exerciseId,
    category: 'barbell_compound',
    defaultSets: 5,
    defaultTargetReps: 5,
    increment: 2.5,
    defaultWeight: 20,
  };

  const config: ExerciseProgressionConfig = (progressionConfigs && progressionConfigs[exerciseId]) ||
    DEFAULT_PROGRESSION_CONFIGS[exerciseId] || {
      exerciseId,
      strategy: 'linear',
      increment: def.increment || 2.5,
      deloadPercentage: 10,
      failuresBeforeDeload: 3,
    };

  const { targetReps, completedReps, targetWeight } = exerciseLog;

  // 1. Dumbbell Double Progression Ladder
  if (config.strategy === 'double_progression' || exerciseId === 'bicep_curl') {
    const repRangeMin = config.repRangeMin || 8;
    const repRangeMax = config.repRangeMax || 12;
    const repStep = config.repStep || 2;
    const currentRepTarget = targetReps[0] || repRangeMin;

    const isCurrentTargetMet = completedReps.length >= 3 && completedReps.slice(0, 3).every((r) => (r ?? 0) >= currentRepTarget);

    if (isCurrentTargetMet) {
      if (currentRepTarget < repRangeMax) {
        // Advance reps at current weight
        const nextTargetReps = Math.min(repRangeMax, currentRepTarget + repStep);
        return {
          nextWeight: targetWeight,
          consecutiveFailures: 0,
          isDeload: false,
          nextTargetReps,
          message: `Great set! Target reps advanced to 3×${nextTargetReps} at ${targetWeight} kg.`,
        };
      } else {
        // Top of ladder reached (e.g. 3x12) -> Level up weight and reset reps to min
        const sortedInventory = [...dumbbellInventory].sort((a, b) => a - b);
        const currentIndex = sortedInventory.findIndex((w) => w >= targetWeight);
        const nextIndex = currentIndex >= 0 ? Math.min(currentIndex + 1, sortedInventory.length - 1) : 0;
        const nextWeight = sortedInventory[nextIndex];

        return {
          nextWeight,
          consecutiveFailures: 0,
          isDeload: false,
          nextTargetReps: repRangeMin,
          message: `Outstanding! 3×${repRangeMax} completed! Progressing up to ${nextWeight} kg (Target: 3×${repRangeMin}).`,
        };
      }
    } else {
      const nextFailures = currentProgress.consecutiveFailures + 1;
      const failuresLimit = config.failuresBeforeDeload || 3;

      if (nextFailures >= failuresLimit) {
        const sortedInventory = [...dumbbellInventory].sort((a, b) => a - b);
        const currentIndex = sortedInventory.findIndex((w) => w >= targetWeight);
        const deloadIndex = Math.max(0, currentIndex - 1);
        const deloadWeight = sortedInventory[deloadIndex];

        return {
          nextWeight: deloadWeight,
          consecutiveFailures: 0,
          isDeload: true,
          nextTargetReps: repRangeMin,
          deloadPercent: config.deloadPercentage || 10,
          message: `${failuresLimit} consecutive misses. Deloading down to ${deloadWeight} kg (Target: 3×${repRangeMin}) to rebuild volume.`,
        };
      } else {
        return {
          nextWeight: targetWeight,
          consecutiveFailures: nextFailures,
          isDeload: false,
          nextTargetReps: currentRepTarget,
          message: `Missed target reps (Attempt ${nextFailures}/${failuresLimit}). Keep pushing at ${targetWeight} kg until 3×${repRangeMax} is reached.`,
        };
      }
    }
  }

  // 2. Pull-ups / Chin-ups & Dips (Bodyweight vs Weighted)
  if (config.strategy === 'bodyweight_reps' || exerciseId === 'pullups' || exerciseId === 'dips') {
    if (exerciseLog.mode === 'weighted') {
      const isSuccess = completedReps.every((r, idx) => (r ?? 0) >= (targetReps[idx] || 5));
      const increment = config.increment > 0 ? config.increment : 1.25;

      if (isSuccess) {
        return {
          nextWeight: targetWeight + increment,
          consecutiveFailures: 0,
          isDeload: false,
          message: `Success! Added +${increment} kg for next session (${targetWeight + increment} kg).`,
        };
      } else {
        const nextFailures = currentProgress.consecutiveFailures + 1;
        const failuresLimit = config.failuresBeforeDeload || 3;

        if (nextFailures >= failuresLimit) {
          const rawDeload = targetWeight * ((100 - (config.deloadPercentage || 10)) / 100);
          const deloadedWeight = Math.max(0, Math.floor(rawDeload / 1.25) * 1.25);

          return {
            nextWeight: deloadedWeight,
            consecutiveFailures: 0,
            isDeload: true,
            deloadPercent: config.deloadPercentage || 10,
            message: `${failuresLimit} consecutive misses. Auto-deloading to +${deloadedWeight} kg.`,
          };
        } else {
          return {
            nextWeight: targetWeight,
            consecutiveFailures: nextFailures,
            isDeload: false,
            message: `Missed target reps (Attempt ${nextFailures}/${failuresLimit}). Staying at +${targetWeight} kg for next session.`,
          };
        }
      }
    } else {
      const totalReps = completedReps.reduce<number>((acc, r) => acc + (r || 0), 0);
      const targetPerSet = config.repRangeMax || 10;
      const allSetsHitTarget = completedReps.length >= 3 && completedReps.slice(0, 3).every((r) => (r || 0) >= targetPerSet);
      const increment = config.increment > 0 ? config.increment : 1.25;

      return {
        nextWeight: 0,
        consecutiveFailures: 0,
        isDeload: false,
        message: allSetsHitTarget
          ? `Solid work! ${totalReps} total reps logged. Ready for Weighted (+${increment}kg)!`
          : `Logged ${totalReps} total bodyweight reps. Aim for 3×${targetPerSet}.`,
      };
    }
  }

  // 3. Barbell Compound Lifts (Linear Progression & Auto-Deload)
  const isFullSuccess = completedReps.length >= targetReps.length &&
    completedReps.every((reps, idx) => (reps ?? 0) >= targetReps[idx]);

  if (isFullSuccess) {
    const increment = config.increment ?? def.increment ?? 2.5;
    const nextWeight = targetWeight + increment;

    return {
      nextWeight,
      consecutiveFailures: 0,
      isDeload: false,
      message: `All sets completed! +${increment} kg added (${nextWeight} kg next session).`,
    };
  } else {
    const nextFailures = currentProgress.consecutiveFailures + 1;
    const failuresLimit = config.failuresBeforeDeload || 3;

    if (nextFailures >= failuresLimit) {
      const deloadPercent = config.deloadPercentage || 10;
      const rawDeload = targetWeight * ((100 - deloadPercent) / 100);
      const minWeight = def.id === 'ohp' ? 20 : (def.isFloorLift ? 40 : 20);
      const deloadedWeight = Math.max(
        minWeight,
        Math.floor(rawDeload / 2.5) * 2.5
      );

      return {
        nextWeight: deloadedWeight,
        consecutiveFailures: 0,
        isDeload: true,
        deloadPercent,
        message: `${failuresLimit} consecutive misses. Auto-deloading ${deloadPercent}% to ${deloadedWeight} kg to build momentum back up.`,
      };
    } else {
      return {
        nextWeight: targetWeight,
        consecutiveFailures: nextFailures,
        isDeload: false,
        message: `Missed target reps (Attempt ${nextFailures}/${failuresLimit}). Retrying ${targetWeight} kg next session.`,
      };
    }
  }
}
