import { describe, it, expect } from 'vitest';
import { calculateWarmupSets } from '../utils/warmup';

describe('calculateWarmupSets', () => {
  const barWeight = 20;

  it('generates a 5-step warmup pyramid for heavy work weight (100kg)', () => {
    const sets = calculateWarmupSets('squat', 100, barWeight);
    expect(sets.length).toBe(5);

    // Set 1: 2x5 with empty bar (20kg)
    expect(sets[0].weight).toBe(20);
    expect(sets[0].reps).toBe(5);

    // Set 2: empty bar (20kg)
    expect(sets[1].weight).toBe(20);
    expect(sets[1].reps).toBe(5);

    // Set 3: 50% (50kg) x3
    expect(sets[2].weight).toBe(50);
    expect(sets[2].reps).toBe(3);

    // Set 4: 70% (70kg) x2
    expect(sets[3].weight).toBe(70);
    expect(sets[3].reps).toBe(2);

    // Set 5: 85% (85kg) x1
    expect(sets[4].weight).toBe(85);
    expect(sets[4].reps).toBe(1);
  });

  it('generates appropriate warmup sets for lighter work weight (40kg)', () => {
    const sets = calculateWarmupSets('bench', 40, barWeight);
    expect(sets.length).toBeGreaterThanOrEqual(2);
    expect(sets[0].weight).toBe(20); // Empty bar
  });

  it('handles floor lifts like deadlift appropriately', () => {
    const sets = calculateWarmupSets('deadlift', 100, barWeight);
    expect(sets.length).toBeGreaterThan(0);
    const maxWarmup = Math.max(...sets.map((s) => s.weight));
    expect(maxWarmup).toBeLessThan(100);
  });
});
