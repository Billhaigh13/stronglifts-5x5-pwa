import { describe, it, expect } from 'vitest';
import { calculatePlates } from '../utils/plates';
import { DEFAULT_PLATE_INVENTORY } from '../utils/constants';

describe('calculatePlates', () => {
  const barWeight = 20; // 20kg Olympic Bar
  // Inventory: 2x20, 2x15, 2x10, 4x5, 4x2.5, 4x1.25 (145kg max total)

  it('returns empty plate setup when target weight equals bar weight (20kg)', () => {
    const result = calculatePlates(20, barWeight, DEFAULT_PLATE_INVENTORY);
    expect(result.weightPerSide).toBe(0);
    expect(result.loadedWeight).toBe(20);
    expect(result.plates.length).toBe(0);
    expect(result.remainder).toBe(0);
    expect(result.isExactMatch).toBe(true);
  });

  it('correctly calculates 60kg barbell load (1x20kg plate per side)', () => {
    const result = calculatePlates(60, barWeight, DEFAULT_PLATE_INVENTORY);
    expect(result.weightPerSide).toBe(20);
    expect(result.loadedWeight).toBe(60);
    expect(result.isExactMatch).toBe(true);
    expect(result.remainder).toBe(0);

    const plate20 = result.plates.find((p) => p.weight === 20);
    expect(plate20).toBeDefined();
    expect(plate20?.countPerSide).toBe(1);
    expect(plate20?.totalUsed).toBe(2);
  });

  it('correctly calculates 85kg barbell load (20kg + 10kg + 2.5kg per side)', () => {
    const result = calculatePlates(85, barWeight, DEFAULT_PLATE_INVENTORY);
    expect(result.weightPerSide).toBe(32.5);
    expect(result.loadedWeight).toBe(85);
    expect(result.isExactMatch).toBe(true);

    const p20 = result.plates.find((p) => p.weight === 20);
    const p10 = result.plates.find((p) => p.weight === 10);
    const p2_5 = result.plates.find((p) => p.weight === 2.5);

    expect(p20?.countPerSide).toBe(1);
    expect(p10?.countPerSide).toBe(1);
    expect(p2_5?.countPerSide).toBe(1);
  });

  it('strictly respects inventory limits when heavier single plates are exhausted', () => {
    // Only 2x20kg (1 per side) exists. For 80kg (30kg per side), it must use 1x20 + 1x10
    const result = calculatePlates(80, barWeight, DEFAULT_PLATE_INVENTORY);
    expect(result.weightPerSide).toBe(30);
    expect(result.loadedWeight).toBe(80);
    expect(result.isExactMatch).toBe(true);

    const p20 = result.plates.find((p) => p.weight === 20);
    const p10 = result.plates.find((p) => p.weight === 10);
    expect(p20?.countPerSide).toBe(1);
    expect(p10?.countPerSide).toBe(1);
  });

  it('calculates total max loadable barbell capacity correctly (145kg)', () => {
    const result = calculatePlates(145, barWeight, DEFAULT_PLATE_INVENTORY);
    expect(result.maxLoadableWeight).toBe(145);
    expect(result.loadedWeight).toBe(145);
    expect(result.isExactMatch).toBe(true);
  });

  it('flags remainder when requested weight exceeds physical inventory capacity', () => {
    const result = calculatePlates(160, barWeight, DEFAULT_PLATE_INVENTORY);
    expect(result.loadedWeight).toBe(145); // Max loadable
    expect(result.isExactMatch).toBe(false);
    expect(result.remainder).toBe(15); // (160 - 145) = 15kg total remainder
  });
});
