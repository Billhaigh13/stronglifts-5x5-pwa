import { describe, it, expect } from 'vitest';
import { calculateInactivityDeload, checkRoutineInactivitySuggestions } from '../../utils/inactivity';
import { DEFAULT_USER_SETTINGS } from '../../utils/constants';
import type { ExerciseProgressState } from '../../types';

describe('calculateInactivityDeload', () => {
  const baseDate = new Date('2026-10-15T12:00:00Z');

  const daysAgo = (days: number): string => {
    const d = new Date(baseDate.getTime() - days * 24 * 60 * 60 * 1000);
    return d.toISOString();
  };

  describe('Thresholds & Tiers', () => {
    it('returns null if lastCompletedDate is missing or invalid', () => {
      expect(calculateInactivityDeload('squat', 100, undefined, { now: baseDate })).toBeNull();
      expect(calculateInactivityDeload('squat', 100, null, { now: baseDate })).toBeNull();
      expect(calculateInactivityDeload('squat', 100, 'invalid-date', { now: baseDate })).toBeNull();
    });

    it('returns null if break is less than 8 days (e.g. 5 days, 7 days)', () => {
      expect(calculateInactivityDeload('squat', 100, daysAgo(5), { now: baseDate })).toBeNull();
      expect(calculateInactivityDeload('squat', 100, daysAgo(7), { now: baseDate })).toBeNull();
    });

    it('applies 10% deload for 8–14 days break (1–2 weeks)', () => {
      const result = calculateInactivityDeload('squat', 100, daysAgo(10), { now: baseDate });
      expect(result).not.toBeNull();
      expect(result?.daysElapsed).toBe(10);
      expect(result?.percent).toBe(10);
      expect(result?.currentWeight).toBe(100);
      expect(result?.suggestedWeight).toBe(90);
    });

    it('applies 20% deload for 15–21 days break (2–3 weeks)', () => {
      const result = calculateInactivityDeload('squat', 100, daysAgo(18), { now: baseDate });
      expect(result).not.toBeNull();
      expect(result?.daysElapsed).toBe(18);
      expect(result?.percent).toBe(20);
      expect(result?.suggestedWeight).toBe(80);
    });

    it('applies 30% deload for 22–30 days break (3–4 weeks)', () => {
      const result = calculateInactivityDeload('squat', 100, daysAgo(25), { now: baseDate });
      expect(result).not.toBeNull();
      expect(result?.daysElapsed).toBe(25);
      expect(result?.percent).toBe(30);
      expect(result?.suggestedWeight).toBe(70);
    });

    it('applies 50% deload for 31+ days break (> 1 month)', () => {
      const result = calculateInactivityDeload('squat', 100, daysAgo(40), { now: baseDate });
      expect(result).not.toBeNull();
      expect(result?.daysElapsed).toBe(40);
      expect(result?.percent).toBe(50);
      expect(result?.suggestedWeight).toBe(50);
    });
  });

  describe('Rounding & Safety Floor Clamping', () => {
    it('rounds deloaded weight to nearest 2.5kg increment', () => {
      // 60 kg with -10% = 54 kg -> rounds to 55 kg
      const result = calculateInactivityDeload('squat', 60, daysAgo(10), { now: baseDate });
      expect(result?.suggestedWeight).toBe(55);
    });

    it('clamps non-floor barbell lifts to minimum 20kg bar weight', () => {
      // 22.5 kg with -20% = 18 kg -> clamped to 20 kg
      const result = calculateInactivityDeload('bench', 22.5, daysAgo(18), { now: baseDate });
      expect(result?.suggestedWeight).toBe(20);
    });

    it('returns null if barbell lift is already at or below 20kg bar weight', () => {
      const result = calculateInactivityDeload('ohp', 20, daysAgo(20), { now: baseDate });
      expect(result).toBeNull();
    });

    it('clamps deadlifts and barbell rows to minimum 40kg floor baseline', () => {
      // 45 kg with -20% = 36 kg -> clamped to 40 kg
      const dlResult = calculateInactivityDeload('deadlift', 45, daysAgo(20), { now: baseDate });
      expect(dlResult?.suggestedWeight).toBe(40);

      // Already at 40 kg -> cannot deload further
      const rowResult = calculateInactivityDeload('row', 40, daysAgo(20), { now: baseDate });
      expect(rowResult).toBeNull();
    });
  });

  describe('Dumbbell Exercises (Double Progression Ladder - Option 1)', () => {
    const dumbbellRack = [2, 4, 5, 7.5, 9, 10, 12.5, 15, 17.5, 20];

    it('steps down 1 rep ladder rung at SAME weight for 10% deload when at 12 reps', () => {
      const result = calculateInactivityDeload('bicep_curl', 10, daysAgo(10), {
        now: baseDate,
        dumbbellInventory: dumbbellRack,
        currentReps: 12,
      });
      expect(result).not.toBeNull();
      expect(result?.percent).toBe(10);
      expect(result?.currentWeight).toBe(10);
      expect(result?.suggestedWeight).toBe(10);
      expect(result?.currentReps).toBe(12);
      expect(result?.suggestedReps).toBe(10);
    });

    it('steps down 1 rep ladder rung at SAME weight for 10% deload when at 10 reps', () => {
      const result = calculateInactivityDeload('bicep_curl', 10, daysAgo(10), {
        now: baseDate,
        dumbbellInventory: dumbbellRack,
        currentReps: 10,
      });
      expect(result).not.toBeNull();
      expect(result?.suggestedWeight).toBe(10);
      expect(result?.suggestedReps).toBe(8);
    });

    it('drops 1 dumbbell size in rack when already at min reps (8 reps) for 10% deload', () => {
      const result = calculateInactivityDeload('bicep_curl', 10, daysAgo(10), {
        now: baseDate,
        dumbbellInventory: dumbbellRack,
        currentReps: 8,
      });
      expect(result).not.toBeNull();
      expect(result?.suggestedWeight).toBe(9);
      expect(result?.suggestedReps).toBe(10);
    });

    it('steps down to min reps (8 reps) at SAME weight for 20% deload when at 12 reps', () => {
      const result = calculateInactivityDeload('bicep_curl', 10, daysAgo(18), {
        now: baseDate,
        dumbbellInventory: dumbbellRack,
        currentReps: 12,
      });
      expect(result).not.toBeNull();
      expect(result?.percent).toBe(20);
      expect(result?.suggestedWeight).toBe(10);
      expect(result?.suggestedReps).toBe(8);
    });

    it('drops 1 dumbbell size in rack for 20% deload when at 8 reps', () => {
      const result = calculateInactivityDeload('bicep_curl', 10, daysAgo(18), {
        now: baseDate,
        dumbbellInventory: dumbbellRack,
        currentReps: 8,
      });
      expect(result).not.toBeNull();
      expect(result?.suggestedWeight).toBe(9);
      expect(result?.suggestedReps).toBe(8);
    });

    it('returns null if dumbbell is already at lowest available weight and min reps', () => {
      const result = calculateInactivityDeload('bicep_curl', 2, daysAgo(20), {
        now: baseDate,
        dumbbellInventory: dumbbellRack,
        currentReps: 8,
      });
      expect(result).toBeNull();
    });

    it('handles fixed dumbbell mode (skullcrushers) capping at 1 dumbbell drop for 8–21 days', () => {
      const result = calculateInactivityDeload('skullcrushers', 15, daysAgo(16), {
        now: baseDate,
        mode: 'dumbbell',
        dumbbellInventory: dumbbellRack,
      });
      expect(result).not.toBeNull();
      expect(result?.suggestedWeight).toBe(12.5);
    });

    it('handles fixed dumbbell mode (skullcrushers) dropping 2 dumbbell sizes for 22–30 days', () => {
      const result = calculateInactivityDeload('skullcrushers', 15, daysAgo(25), {
        now: baseDate,
        mode: 'dumbbell',
        dumbbellInventory: dumbbellRack,
      });
      expect(result).not.toBeNull();
      expect(result?.suggestedWeight).toBe(10);
    });
  });

  describe('Bodyweight Exercises', () => {
    it('returns null for unweighted bodyweight exercises (0 kg)', () => {
      expect(calculateInactivityDeload('pullups', 0, daysAgo(14), { now: baseDate, mode: 'bodyweight' })).toBeNull();
      expect(calculateInactivityDeload('dips', 0, daysAgo(20), { now: baseDate, mode: 'bodyweight' })).toBeNull();
      expect(calculateInactivityDeload('plank', 0, daysAgo(30), { now: baseDate })).toBeNull();
    });

    it('deloads added load for weighted pull-ups', () => {
      // 10 kg with -20% = 8 kg -> rounds to 7.5 or 8.75 kg
      const result = calculateInactivityDeload('pullups', 10, daysAgo(18), {
        now: baseDate,
        mode: 'weighted',
      });
      expect(result).not.toBeNull();
      expect(result?.percent).toBe(20);
      expect(result?.suggestedWeight).toBe(7.5);
    });
  });
});

describe('checkRoutineInactivitySuggestions', () => {
  const baseDate = new Date('2026-10-15T12:00:00Z');
  const daysAgo = (days: number): string => {
    return new Date(baseDate.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
  };

  const progress: Record<string, ExerciseProgressState> = {
    squat: {
      exerciseId: 'squat',
      currentWeight: 100,
      consecutiveFailures: 1,
      allTimePRWeight: 100,
      allTimePRReps: 5,
      lastCompletedDate: daysAgo(16), // 16 days ago -> 20% deload
    },
    bench: {
      exerciseId: 'bench',
      currentWeight: 70,
      consecutiveFailures: 0,
      allTimePRWeight: 70,
      allTimePRReps: 5,
      lastCompletedDate: daysAgo(4), // 4 days ago -> active, no deload
    },
    row: {
      exerciseId: 'row',
      currentWeight: 60,
      consecutiveFailures: 0,
      allTimePRWeight: 60,
      allTimePRReps: 5,
      lastCompletedDate: daysAgo(25), // 25 days ago -> 30% deload
    },
  };

  it('identifies inactive exercises in a routine', () => {
    const suggestions = checkRoutineInactivitySuggestions(
      ['squat', 'bench', 'row'],
      progress as any,
      DEFAULT_USER_SETTINGS,
      undefined,
      baseDate
    );

    expect(suggestions).toHaveLength(2);
    expect(suggestions[0].exerciseId).toBe('squat');
    expect(suggestions[0].suggestedWeight).toBe(80);
    expect(suggestions[1].exerciseId).toBe('row');
    expect(suggestions[1].suggestedWeight).toBe(42.5); // 60 * 0.7 = 42 -> 42.5 kg
  });

  it('returns empty array when enableInactivityDeload is false', () => {
    const settings = {
      ...DEFAULT_USER_SETTINGS,
      enableInactivityDeload: false,
    };

    const suggestions = checkRoutineInactivitySuggestions(
      ['squat', 'bench', 'row'],
      progress as any,
      settings,
      undefined,
      baseDate
    );

    expect(suggestions).toEqual([]);
  });
});
