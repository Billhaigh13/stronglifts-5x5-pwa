import type { PlateCalculationResult, PlateCount, PlateInventoryItem } from '../types';
import { DEFAULT_PLATE_INVENTORY, OLYMPIC_PLATE_COLORS } from './constants';

export function calculatePlates(
  targetWeight: number,
  barWeight = 20,
  plateInventory: PlateInventoryItem[] | number[] = DEFAULT_PLATE_INVENTORY
): PlateCalculationResult {
  // Normalize plate inventory items
  let normalizedInventory: PlateInventoryItem[];
  if (plateInventory.length > 0 && typeof plateInventory[0] === 'number') {
    normalizedInventory = (plateInventory as number[]).map((weight) => ({
      weight,
      count: 99, // unlimited fallback
    }));
  } else {
    normalizedInventory = (plateInventory as PlateInventoryItem[]).map((item) => ({ ...item }));
  }

  // Sort plates descending by weight
  normalizedInventory.sort((a, b) => b.weight - a.weight);

  // Calculate maximum possible weight with current inventory
  const totalPlatesWeight = normalizedInventory.reduce((acc, p) => {
    const pairs = Math.floor(p.count / 2);
    return acc + pairs * 2 * p.weight;
  }, 0);
  const maxLoadableWeight = barWeight + totalPlatesWeight;

  if (targetWeight <= barWeight) {
    return {
      targetWeight,
      barWeight,
      weightPerSide: 0,
      loadedWeight: barWeight,
      plates: [],
      remainder: 0,
      isExactMatch: true,
      maxLoadableWeight,
    };
  }

  const desiredPerSide = (targetWeight - barWeight) / 2;
  let remainingPerSide = desiredPerSide;
  const platesResult: PlateCount[] = [];

  for (const item of normalizedInventory) {
    const availablePerSide = Math.floor(item.count / 2);
    if (availablePerSide > 0 && remainingPerSide >= item.weight) {
      const neededCount = Math.floor(Number((remainingPerSide / item.weight).toFixed(4)));
      const countToUse = Math.min(availablePerSide, neededCount);

      if (countToUse > 0) {
        const colorConfig = OLYMPIC_PLATE_COLORS[item.weight] || { bg: '#64748b', text: '#ffffff' };
        platesResult.push({
          weight: item.weight,
          countPerSide: countToUse,
          totalUsed: countToUse * 2,
          availablePerSide,
          color: colorConfig.bg,
          textColor: colorConfig.text,
        });

        remainingPerSide = Number((remainingPerSide - countToUse * item.weight).toFixed(4));
      }
    }
  }

  const loadedPerSide = desiredPerSide - remainingPerSide;
  const loadedWeight = barWeight + loadedPerSide * 2;
  const isExactMatch = remainingPerSide === 0;

  return {
    targetWeight,
    barWeight,
    weightPerSide: desiredPerSide,
    loadedWeight,
    plates: platesResult,
    remainder: remainingPerSide * 2,
    isExactMatch,
    maxLoadableWeight,
  };
}
