import type { ExerciseId, ExerciseLog, ExerciseProgressState, ProgressionResult } from '../types';
import { EXERCISE_DEFINITIONS } from './constants';

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
  dumbbellInventory: number[] = [2, 4, 5, 7.5, 9, 10, 12.5, 15, 17.5, 20]
): ProgressionResult {
  const def = EXERCISE_DEFINITIONS[exerciseId];
  const { targetReps, completedReps, targetWeight } = exerciseLog;

  // 1. Dumbbell Bicep Curls (Double Progression Ladder)
  if (exerciseId === 'bicep_curl') {
    const is3x12 = completedReps.length >= 3 && completedReps.slice(0, 3).every(r => (r ?? 0) >= 12);

    if (is3x12) {
      const sortedInventory = [...dumbbellInventory].sort((a, b) => a - b);
      const currentIndex = sortedInventory.findIndex(w => w >= targetWeight);
      const nextIndex = currentIndex >= 0 ? Math.min(currentIndex + 1, sortedInventory.length - 1) : 0;
      const nextWeight = sortedInventory[nextIndex];

      return {
        nextWeight,
        consecutiveFailures: 0,
        isDeload: false,
        nextTargetReps: 8,
        message: `Outstanding! 3×12 completed! Progressing up to ${nextWeight} kg (Target: 3×8).`
      };
    } else {
      return {
        nextWeight: targetWeight,
        consecutiveFailures: 0,
        isDeload: false,
        nextTargetReps: currentProgress.targetRepsPerSet || 8,
        message: `Keep pushing at ${targetWeight} kg until 3×12 is reached.`
      };
    }
  }

  // 2. Pull-ups / Chin-ups
  if (exerciseId === 'pullups') {
    if (exerciseLog.mode === 'weighted') {
      const isSuccess = completedReps.every((r, idx) => (r ?? 0) >= (targetReps[idx] || 5));
      if (isSuccess) {
        return {
          nextWeight: targetWeight + 1.25,
          consecutiveFailures: 0,
          isDeload: false,
          message: `Success! Added +1.25 kg for next session (${targetWeight + 1.25} kg).`
        };
      } else {
        const failures = currentProgress.consecutiveFailures + 1;
        return {
          nextWeight: targetWeight,
          consecutiveFailures: failures,
          isDeload: false,
          message: `Missed target reps. Staying at +${targetWeight} kg for next session.`
        };
      }
    } else {
      const totalReps = completedReps.reduce<number>((acc, r) => acc + (r || 0), 0);
      const allSetsHit10 = completedReps.length >= 3 && completedReps.slice(0, 3).every(r => (r || 0) >= 10);

      return {
        nextWeight: 0,
        consecutiveFailures: 0,
        isDeload: false,
        message: allSetsHit10 
          ? `Solid work! ${totalReps} total reps logged. Ready for Weighted Pull-ups (+1.25kg)!` 
          : `Logged ${totalReps} total bodyweight reps. Aim for 3×10.`
      };
    }
  }

  // 3. Barbell Compound Lifts (Linear Progression & Auto-Deload)
  const isFullSuccess = completedReps.length >= targetReps.length &&
    completedReps.every((reps, idx) => (reps ?? 0) >= targetReps[idx]);

  if (isFullSuccess) {
    const increment = def.increment;
    const nextWeight = targetWeight + increment;

    return {
      nextWeight,
      consecutiveFailures: 0,
      isDeload: false,
      message: `All sets completed! +${increment} kg added (${nextWeight} kg next session).`
    };
  } else {
    const nextFailures = currentProgress.consecutiveFailures + 1;

    if (nextFailures >= 3) {
      const rawDeload = targetWeight * 0.9;
      const deloadedWeight = Math.max(
        def.id === 'ohp' ? 20 : (def.isFloorLift ? 40 : 20),
        Math.floor(rawDeload / 2.5) * 2.5
      );

      return {
        nextWeight: deloadedWeight,
        consecutiveFailures: 0,
        isDeload: true,
        deloadPercent: 10,
        message: `3 consecutive misses. Auto-deloading 10% to ${deloadedWeight} kg to build momentum back up.`
      };
    } else {
      return {
        nextWeight: targetWeight,
        consecutiveFailures: nextFailures,
        isDeload: false,
        message: `Missed target reps (Attempt ${nextFailures}/3). Retrying ${targetWeight} kg next session.`
      };
    }
  }
}
