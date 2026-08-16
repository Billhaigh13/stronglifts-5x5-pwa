import type { ExerciseId, WarmupSet } from '../types';

export function roundToNearestIncrement(weight: number, increment = 2.5): number {
  return Math.round(weight / increment) * increment;
}

export function calculateWarmupSets(
  exerciseId: ExerciseId,
  workWeight: number,
  barWeight = 20
): WarmupSet[] {
  if (exerciseId === 'bicep_curl' || exerciseId === 'pullups') {
    return [];
  }

  const isFloorLift = exerciseId === 'deadlift' || exerciseId === 'row';

  if (!isFloorLift) {
    // Squat, Bench Press, Overhead Press
    if (workWeight <= 30) {
      return [
        { setNumber: 1, reps: 5, weight: barWeight, percentageText: 'Empty Bar', completed: false },
        { setNumber: 2, reps: 5, weight: barWeight, percentageText: 'Empty Bar', completed: false },
      ];
    }

    const sets: WarmupSet[] = [
      { setNumber: 1, reps: 5, weight: barWeight, percentageText: 'Empty Bar', completed: false },
      { setNumber: 2, reps: 5, weight: barWeight, percentageText: 'Empty Bar', completed: false },
    ];

    const weight50 = Math.max(barWeight, roundToNearestIncrement(workWeight * 0.5));
    if (weight50 < workWeight) {
      sets.push({
        setNumber: 3,
        reps: 3,
        weight: weight50,
        percentageText: '50% Work Weight',
        completed: false,
      });
    }

    const weight70 = Math.max(weight50, roundToNearestIncrement(workWeight * 0.7));
    if (weight70 > weight50 && weight70 < workWeight) {
      sets.push({
        setNumber: sets.length + 1,
        reps: 2,
        weight: weight70,
        percentageText: '70% Work Weight',
        completed: false,
      });
    }

    if (workWeight >= 90) {
      const weight85 = Math.max(weight70, roundToNearestIncrement(workWeight * 0.85));
      if (weight85 > weight70 && weight85 < workWeight) {
        sets.push({
          setNumber: sets.length + 1,
          reps: 1,
          weight: weight85,
          percentageText: '85% Work Weight',
          completed: false,
        });
      }
    }

    return sets;
  } else {
    // Deadlift & Barbell Row
    const baseFloorWeight = Math.min(workWeight, 40);

    if (workWeight <= 50) {
      return [
        { setNumber: 1, reps: 5, weight: baseFloorWeight, percentageText: 'Base Floor Weight', completed: false },
      ];
    }

    const sets: WarmupSet[] = [];

    const weight45 = Math.max(baseFloorWeight, roundToNearestIncrement(workWeight * 0.45));
    sets.push({
      setNumber: 1,
      reps: 5,
      weight: weight45,
      percentageText: '45% Work Weight',
      completed: false,
    });

    const weight65 = Math.max(weight45, roundToNearestIncrement(workWeight * 0.65));
    if (weight65 > weight45 && weight65 < workWeight) {
      sets.push({
        setNumber: 2,
        reps: 3,
        weight: weight65,
        percentageText: '65% Work Weight',
        completed: false,
      });
    }

    if (workWeight >= 100) {
      const weight85 = Math.max(weight65, roundToNearestIncrement(workWeight * 0.85));
      if (weight85 > weight65 && weight85 < workWeight) {
        sets.push({
          setNumber: sets.length + 1,
          reps: 1,
          weight: weight85,
          percentageText: '85% Work Weight',
          completed: false,
        });
      }
    }

    return sets;
  }
}
