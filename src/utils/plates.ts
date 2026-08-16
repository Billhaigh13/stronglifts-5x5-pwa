import type { PlateCalculationResult, PlateCount } from '../types';
import { OLYMPIC_PLATE_COLORS } from './constants';

export function calculatePlates(
  targetWeight: number,
  barWeight = 20,
  availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25]
): PlateCalculationResult {
  if (targetWeight <= barWeight) {
    return {
      targetWeight,
      barWeight,
      weightPerSide: 0,
      plates: [],
      remainder: 0
    };
  }

  const weightToDistribute = targetWeight - barWeight;
  let perSide = weightToDistribute / 2;
  const platesResult: PlateCount[] = [];

  const sortedPlates = [...availablePlates].sort((a, b) => b - a);

  for (const plate of sortedPlates) {
    if (perSide >= plate) {
      const count = Math.floor(Number((perSide / plate).toFixed(4)));
      if (count > 0) {
        const colorConfig = OLYMPIC_PLATE_COLORS[plate] || { bg: '#64748b', text: '#ffffff' };
        platesResult.push({
          weight: plate,
          countPerSide: count,
          color: colorConfig.bg,
          textColor: colorConfig.text
        });
        perSide = Number((perSide - count * plate).toFixed(4));
      }
    }
  }

  return {
    targetWeight,
    barWeight,
    weightPerSide: (targetWeight - barWeight) / 2,
    plates: platesResult,
    remainder: perSide
  };
}
