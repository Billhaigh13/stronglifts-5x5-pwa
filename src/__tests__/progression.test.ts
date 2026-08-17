import { describe, it, expect } from 'vitest';
import { calculateNextProgression } from '../utils/progression';
import type { ExerciseLog, ExerciseProgressState } from '../types';

describe('calculateNextProgression', () => {
  const defaultInventory = [2, 4, 5, 7.5, 9, 10, 12.5, 15, 17.5, 20];

  describe('Barbell Compound 5x5 Progression', () => {
    it('increases squat weight by 2.5kg on 5x5 success', () => {
      const log: ExerciseLog = {
        exerciseId: 'squat',
        exerciseName: 'Barbell Squat',
        targetWeight: 60,
        targetReps: [5, 5, 5, 5, 5],
        completedReps: [5, 5, 5, 5, 5],
        completed: true,
      };
      const prog: ExerciseProgressState = {
        exerciseId: 'squat',
        currentWeight: 60,
        consecutiveFailures: 0,
        allTimePRWeight: 60,
        allTimePRReps: 5,
      };

      const result = calculateNextProgression('squat', log, prog, defaultInventory);
      expect(result.nextWeight).toBe(62.5);
      expect(result.consecutiveFailures).toBe(0);
      expect(result.isDeload).toBe(false);
      expect(result.message).toContain('+2.5 kg added');
    });

    it('increases deadlift weight by 5.0kg on 1x5 success', () => {
      const log: ExerciseLog = {
        exerciseId: 'deadlift',
        exerciseName: 'Barbell Deadlift',
        targetWeight: 100,
        targetReps: [5],
        completedReps: [5],
        completed: true,
      };
      const prog: ExerciseProgressState = {
        exerciseId: 'deadlift',
        currentWeight: 100,
        consecutiveFailures: 0,
        allTimePRWeight: 100,
        allTimePRReps: 5,
      };

      const result = calculateNextProgression('deadlift', log, prog, defaultInventory);
      expect(result.nextWeight).toBe(105);
      expect(result.consecutiveFailures).toBe(0);
      expect(result.message).toContain('+5 kg added');
    });

    it('keeps weight and increments failure counter on first failure', () => {
      const log: ExerciseLog = {
        exerciseId: 'bench',
        exerciseName: 'Barbell Bench Press',
        targetWeight: 50,
        targetReps: [5, 5, 5, 5, 5],
        completedReps: [5, 5, 5, 4, 3],
        completed: true,
      };
      const prog: ExerciseProgressState = {
        exerciseId: 'bench',
        currentWeight: 50,
        consecutiveFailures: 0,
        allTimePRWeight: 50,
        allTimePRReps: 5,
      };

      const result = calculateNextProgression('bench', log, prog, defaultInventory);
      expect(result.nextWeight).toBe(50);
      expect(result.consecutiveFailures).toBe(1);
      expect(result.isDeload).toBe(false);
      expect(result.message).toContain('Attempt 1/3');
    });

    it('keeps weight and increments to 2 on second consecutive failure', () => {
      const log: ExerciseLog = {
        exerciseId: 'ohp',
        exerciseName: 'Overhead Press',
        targetWeight: 40,
        targetReps: [5, 5, 5, 5, 5],
        completedReps: [5, 5, 4, 3, 3],
        completed: true,
      };
      const prog: ExerciseProgressState = {
        exerciseId: 'ohp',
        currentWeight: 40,
        consecutiveFailures: 1,
        allTimePRWeight: 40,
        allTimePRReps: 5,
      };

      const result = calculateNextProgression('ohp', log, prog, defaultInventory);
      expect(result.nextWeight).toBe(40);
      expect(result.consecutiveFailures).toBe(2);
      expect(result.isDeload).toBe(false);
      expect(result.message).toContain('Attempt 2/3');
    });

    it('triggers a 10% auto-deload on 3 consecutive failures (rounded to 2.5kg)', () => {
      const log: ExerciseLog = {
        exerciseId: 'squat',
        exerciseName: 'Barbell Squat',
        targetWeight: 100,
        targetReps: [5, 5, 5, 5, 5],
        completedReps: [5, 5, 4, 3, 2],
        completed: true,
      };
      const prog: ExerciseProgressState = {
        exerciseId: 'squat',
        currentWeight: 100,
        consecutiveFailures: 2,
        allTimePRWeight: 100,
        allTimePRReps: 5,
      };

      const result = calculateNextProgression('squat', log, prog, defaultInventory);
      expect(result.isDeload).toBe(true);
      expect(result.nextWeight).toBe(90); // 100 * 0.9 = 90
      expect(result.consecutiveFailures).toBe(0);
      expect(result.message).toContain('Auto-deloading 10%');
    });
  });

  describe('Dumbbell Double Progression Ladder', () => {
    it('stays at current weight when sets are below 3x12', () => {
      const log: ExerciseLog = {
        exerciseId: 'bicep_curl',
        exerciseName: 'Dumbbell Bicep Curls',
        targetWeight: 7.5,
        targetReps: [8, 8, 8],
        completedReps: [8, 8, 8],
        completed: true,
      };
      const prog: ExerciseProgressState = {
        exerciseId: 'bicep_curl',
        currentWeight: 7.5,
        targetRepsPerSet: 8,
        consecutiveFailures: 0,
        allTimePRWeight: 7.5,
        allTimePRReps: 8,
      };

      const result = calculateNextProgression('bicep_curl', log, prog, defaultInventory);
      expect(result.nextWeight).toBe(7.5);
      expect(result.message).toContain('Keep pushing at 7.5 kg until 3×12 is reached');
    });

    it('advances to next weight in inventory (9kg) and resets target reps to 8 on hitting 3x12', () => {
      const log: ExerciseLog = {
        exerciseId: 'bicep_curl',
        exerciseName: 'Dumbbell Bicep Curls',
        targetWeight: 7.5,
        targetReps: [12, 12, 12],
        completedReps: [12, 12, 12],
        completed: true,
      };
      const prog: ExerciseProgressState = {
        exerciseId: 'bicep_curl',
        currentWeight: 7.5,
        targetRepsPerSet: 12,
        consecutiveFailures: 0,
        allTimePRWeight: 7.5,
        allTimePRReps: 12,
      };

      const result = calculateNextProgression('bicep_curl', log, prog, defaultInventory);
      expect(result.nextWeight).toBe(9); // Next weight in ladder after 7.5
      expect(result.nextTargetReps).toBe(8);
      expect(result.message).toContain('Progressing up to 9 kg');
    });
  });

  describe('Pull-ups & Chin-ups Progression', () => {
    it('maintains bodyweight AMRAP mode when incomplete', () => {
      const log: ExerciseLog = {
        exerciseId: 'pullups',
        exerciseName: 'Pull-ups / Chin-ups',
        targetWeight: 0,
        mode: 'bodyweight',
        targetReps: [10, 10, 10],
        completedReps: [8, 7, 6],
        completed: true,
      };
      const prog: ExerciseProgressState = {
        exerciseId: 'pullups',
        currentWeight: 0,
        mode: 'bodyweight',
        consecutiveFailures: 0,
        allTimePRWeight: 0,
        allTimePRReps: 8,
      };

      const result = calculateNextProgression('pullups', log, prog, defaultInventory);
      expect(result.nextWeight).toBe(0);
      expect(result.message).toContain('Logged 21 total bodyweight reps');
    });

    it('advances weighted pull-ups by 1.25kg on 3x5 success', () => {
      const log: ExerciseLog = {
        exerciseId: 'pullups',
        exerciseName: 'Pull-ups / Chin-ups',
        targetWeight: 5,
        mode: 'weighted',
        targetReps: [5, 5, 5],
        completedReps: [5, 5, 5],
        completed: true,
      };
      const prog: ExerciseProgressState = {
        exerciseId: 'pullups',
        currentWeight: 5,
        mode: 'weighted',
        consecutiveFailures: 0,
        allTimePRWeight: 5,
        allTimePRReps: 5,
      };

      const result = calculateNextProgression('pullups', log, prog, defaultInventory);
      expect(result.nextWeight).toBe(6.25);
      expect(result.message).toContain('+1.25 kg');
    });
  });
});
