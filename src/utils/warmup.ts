import type { ExerciseId, WarmupSet } from '../types';

export function roundToNearestIncrement(weight: number, increment = 2.5): number {
  return Math.round(weight / increment) * increment;
}

export function calculateWarmupSets(
  exerciseId: ExerciseId,
  workWeight: number,
  barWeight = 20
): WarmupSet[] {
  // Accessory / isolation / bodyweight exercises require no barbell warmup
  if (
    exerciseId === 'bicep_curl' ||
    exerciseId === 'pullups' ||
    exerciseId === 'dips' ||
    exerciseId === 'plank'
  ) {
    return [];
  }

  const isFloorLift = exerciseId === 'deadlift' || exerciseId === 'row';

  if (!isFloorLift) {
    // Non-floor lifts: Squat, Bench Press, Overhead Press, Incline Bench, Skullcrushers, Barbell Curl
    // 1. Work weight is empty bar or close to it (e.g. <= 25 kg on 20 kg bar) -> No warmup sets needed
    if (workWeight <= barWeight + 5) {
      return [];
    }

    // 2. Light loads (27.5 kg – 35 kg) -> 1 set of 5 reps with empty bar
    if (workWeight <= barWeight + 15) {
      return [
        { setNumber: 1, reps: 5, weight: barWeight, percentageText: 'Empty Bar', completed: false },
      ];
    }

    // 3. Moderate to heavy loads (> 35 kg) -> Progressive warmup pyramid
    const sets: WarmupSet[] = [
      { setNumber: 1, reps: 5, weight: barWeight, percentageText: 'Empty Bar', completed: false },
      { setNumber: 2, reps: 5, weight: barWeight, percentageText: 'Empty Bar', completed: false },
    ];

    const weight50 = Math.max(barWeight, roundToNearestIncrement(workWeight * 0.5));
    if (weight50 > barWeight && weight50 < workWeight) {
      sets.push({
        setNumber: sets.length + 1,
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

    // Heavy loads (>= 90 kg) -> 1 final primer single at 85%
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
    // Floor lifts: Deadlift & Barbell Row
    const baseFloorWeight = barWeight + 20; // Default 40 kg (bar + standard plates)

    // 1. Work weight is at or close to floor baseline (<= 45 kg) -> No warmup sets needed
    if (workWeight <= baseFloorWeight + 5) {
      return [];
    }

    // 2. Light floor loads (47.5 kg – 60 kg) -> 1 set of 5 reps at floor baseline
    if (workWeight <= baseFloorWeight + 20) {
      return [
        {
          setNumber: 1,
          reps: 5,
          weight: baseFloorWeight,
          percentageText: `Base Floor Weight (${baseFloorWeight} kg)`,
          completed: false,
        },
      ];
    }

    // 3. Moderate to heavy loads (> 60 kg) -> Progressive pyramid
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

    // Heavy deadlifts (>= 100 kg) -> 1 final primer single at 85%
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
