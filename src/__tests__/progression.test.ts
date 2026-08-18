import { describe, it, expect } from 'vitest';
import { calculateNextProgression } from '../utils/progression';
import type { ExerciseLog, ExerciseProgressState, ExerciseProgressionConfig } from '../types';

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

    it('supports custom microloading increment (e.g. +1.25kg on OHP)', () => {
      const log: ExerciseLog = {
        exerciseId: 'ohp',
        exerciseName: 'Overhead Press',
        targetWeight: 40,
        targetReps: [5, 5, 5, 5, 5],
        completedReps: [5, 5, 5, 5, 5],
        completed: true,
      };
      const prog: ExerciseProgressState = {
        exerciseId: 'ohp',
        currentWeight: 40,
        consecutiveFailures: 0,
        allTimePRWeight: 40,
        allTimePRReps: 5,
      };
      const customConfigs: Record<string, ExerciseProgressionConfig> = {
        ohp: {
          exerciseId: 'ohp',
          strategy: 'linear',
          increment: 1.25,
          deloadPercentage: 10,
          failuresBeforeDeload: 3,
        },
      };

      const result = calculateNextProgression('ohp', log, prog, defaultInventory, customConfigs);
      expect(result.nextWeight).toBe(41.25);
      expect(result.message).toContain('+1.25 kg added');
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

    it('triggers deload on custom failure threshold (e.g. 2 misses instead of 3)', () => {
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
        consecutiveFailures: 1,
        allTimePRWeight: 100,
        allTimePRReps: 5,
      };
      const customConfigs: Record<string, ExerciseProgressionConfig> = {
        squat: {
          exerciseId: 'squat',
          strategy: 'linear',
          increment: 2.5,
          deloadPercentage: 15,
          failuresBeforeDeload: 2,
        },
      };

      const result = calculateNextProgression('squat', log, prog, defaultInventory, customConfigs);
      expect(result.isDeload).toBe(true);
      expect(result.nextWeight).toBe(85); // 100 * 0.85 = 85
      expect(result.consecutiveFailures).toBe(0);
      expect(result.message).toContain('Auto-deloading 15%');
    });
  });

  describe('Dumbbell Double Progression Ladder', () => {
    it('advances reps from 8 to 10 when 3x8 target is completed', () => {
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
      expect(result.nextTargetReps).toBe(10);
      expect(result.message).toContain('3×10 at 7.5 kg');
    });

    it('advances to next dumbbell in inventory (9kg) and resets to 8 on completing 3x12', () => {
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
      expect(result.nextWeight).toBe(9);
      expect(result.nextTargetReps).toBe(8);
      expect(result.message).toContain('Progressing up to 9 kg');
    });

    it('supports custom rep ranges (e.g. 6 to 10 reps ladder)', () => {
      const log: ExerciseLog = {
        exerciseId: 'bicep_curl',
        exerciseName: 'Dumbbell Bicep Curls',
        targetWeight: 10,
        targetReps: [10, 10, 10],
        completedReps: [10, 10, 10],
        completed: true,
      };
      const prog: ExerciseProgressState = {
        exerciseId: 'bicep_curl',
        currentWeight: 10,
        targetRepsPerSet: 10,
        consecutiveFailures: 0,
        allTimePRWeight: 10,
        allTimePRReps: 10,
      };
      const customConfigs: Record<string, ExerciseProgressionConfig> = {
        bicep_curl: {
          exerciseId: 'bicep_curl',
          strategy: 'double_progression',
          increment: 0,
          repRangeMin: 6,
          repRangeMax: 10,
          repStep: 2,
          deloadPercentage: 10,
          failuresBeforeDeload: 3,
        },
      };

      const result = calculateNextProgression('bicep_curl', log, prog, defaultInventory, customConfigs);
      expect(result.nextWeight).toBe(12.5); // jumps to next weight after 10kg
      expect(result.nextTargetReps).toBe(6); // resets to 6 reps
      expect(result.message).toContain('Progressing up to 12.5 kg');
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
