import { describe, it, expect } from 'vitest';
import { calculateWarmupSets } from '../utils/warmup';

describe('calculateWarmupSets', () => {
  const barWeight = 20;

  describe('Non-Floor Compound Lifts (Squat, Bench, OHP)', () => {
    it('returns empty array (0 warmup sets) for empty bar and low loads <= 25kg', () => {
      // 20kg (empty bar)
      expect(calculateWarmupSets('squat', 20, barWeight)).toEqual([]);
      // 22.5kg (bar + 1.25kg plates)
      expect(calculateWarmupSets('squat', 22.5, barWeight)).toEqual([]);
      expect(calculateWarmupSets('bench', 22.5, barWeight)).toEqual([]);
      expect(calculateWarmupSets('ohp', 22.5, barWeight)).toEqual([]);
      // 25kg (bar + 2.5kg plates)
      expect(calculateWarmupSets('squat', 25, barWeight)).toEqual([]);
    });

    it('returns exactly 1 empty bar warmup set for light loads between 27.5kg and 35kg', () => {
      const sets30 = calculateWarmupSets('squat', 30, barWeight);
      expect(sets30.length).toBe(1);
      expect(sets30[0].weight).toBe(20);
      expect(sets30[0].reps).toBe(5);

      const sets35 = calculateWarmupSets('bench', 35, barWeight);
      expect(sets35.length).toBe(1);
      expect(sets35[0].weight).toBe(20);
      expect(sets35[0].reps).toBe(5);
    });

    it('generates a 4-step progressive pyramid for moderate loads (60kg)', () => {
      const sets = calculateWarmupSets('squat', 60, barWeight);
      expect(sets.length).toBe(4);
      expect(sets[0].weight).toBe(20); // Empty bar x5
      expect(sets[1].weight).toBe(20); // Empty bar x5
      expect(sets[2].weight).toBe(30); // 50% (30kg) x3
      expect(sets[3].weight).toBe(42.5); // 70% (42.5kg) x2
    });

    it('generates a 5-step warmup pyramid for heavy work weight (100kg)', () => {
      const sets = calculateWarmupSets('squat', 100, barWeight);
      expect(sets.length).toBe(5);

      expect(sets[0].weight).toBe(20); // Empty bar x5
      expect(sets[1].weight).toBe(20); // Empty bar x5
      expect(sets[2].weight).toBe(50); // 50% (50kg) x3
      expect(sets[3].weight).toBe(70); // 70% (70kg) x2
      expect(sets[4].weight).toBe(85); // 85% primer (85kg) x1
    });
  });

  describe('Floor Lifts (Deadlift & Barbell Row)', () => {
    it('returns empty array (0 warmup sets) for baseline floor loads <= 45kg', () => {
      expect(calculateWarmupSets('deadlift', 40, barWeight)).toEqual([]);
      expect(calculateWarmupSets('deadlift', 42.5, barWeight)).toEqual([]);
      expect(calculateWarmupSets('deadlift', 45, barWeight)).toEqual([]);
      expect(calculateWarmupSets('row', 40, barWeight)).toEqual([]);
    });

    it('returns 1 base floor warmup set for light floor loads (50kg - 60kg)', () => {
      const sets50 = calculateWarmupSets('deadlift', 50, barWeight);
      expect(sets50.length).toBe(1);
      expect(sets50[0].weight).toBe(40);
      expect(sets50[0].reps).toBe(5);

      const sets60 = calculateWarmupSets('row', 60, barWeight);
      expect(sets60.length).toBe(1);
      expect(sets60[0].weight).toBe(40);
    });

    it('generates progressive floor warmup pyramid for heavy deadlifts (120kg)', () => {
      const sets = calculateWarmupSets('deadlift', 120, barWeight);
      expect(sets.length).toBe(3);
      expect(sets[0].weight).toBe(55); // 45% (55kg) x5
      expect(sets[1].weight).toBe(77.5); // 65% (77.5kg) x3
      expect(sets[2].weight).toBe(102.5); // 85% (102.5kg) x1
    });
  });

  describe('Accessories & Bodyweight', () => {
    it('returns empty array for dumbbell curls, pullups, dips, planks', () => {
      expect(calculateWarmupSets('bicep_curl', 15, barWeight)).toEqual([]);
      expect(calculateWarmupSets('pullups', 0, barWeight)).toEqual([]);
      expect(calculateWarmupSets('dips', 0, barWeight)).toEqual([]);
      expect(calculateWarmupSets('plank', 0, barWeight)).toEqual([]);
    });
  });
});
