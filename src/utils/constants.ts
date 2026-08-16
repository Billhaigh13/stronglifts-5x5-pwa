import type { ExerciseDefinition, ExerciseId, PlateInventoryItem, ProgramDefinition, ProgramId, UserSettings, WorkoutType } from '../types';

export const EXERCISE_DEFINITIONS: Record<ExerciseId, ExerciseDefinition> = {
  squat: {
    id: 'squat',
    name: 'Barbell Squat',
    category: 'barbell_compound',
    defaultSets: 5,
    defaultTargetReps: 5,
    increment: 2.5,
    defaultWeight: 30, // kg
    isFloorLift: false,
  },
  bench: {
    id: 'bench',
    name: 'Barbell Bench Press',
    category: 'barbell_compound',
    defaultSets: 5,
    defaultTargetReps: 5,
    increment: 2.5,
    defaultWeight: 30, // kg
    isFloorLift: false,
  },
  row: {
    id: 'row',
    name: 'Barbell Row',
    category: 'barbell_compound',
    defaultSets: 5,
    defaultTargetReps: 5,
    increment: 2.5,
    defaultWeight: 30, // kg
    isFloorLift: true,
  },
  ohp: {
    id: 'ohp',
    name: 'Overhead Press',
    category: 'barbell_compound',
    defaultSets: 5,
    defaultTargetReps: 5,
    increment: 2.5,
    defaultWeight: 20, // kg (empty bar)
    isFloorLift: false,
  },
  deadlift: {
    id: 'deadlift',
    name: 'Barbell Deadlift',
    category: 'barbell_compound',
    defaultSets: 1,
    defaultTargetReps: 5,
    increment: 5.0,
    defaultWeight: 40, // kg
    isFloorLift: true,
  },
  bicep_curl: {
    id: 'bicep_curl',
    name: 'Dumbbell Bicep Curls',
    category: 'dumbbell_accessory',
    defaultSets: 3,
    defaultTargetReps: 8,
    increment: 0,
    defaultWeight: 7.5, // kg
    repRangeMin: 8,
    repRangeMax: 12,
  },
  pullups: {
    id: 'pullups',
    name: 'Pull-ups / Chin-ups',
    category: 'bodyweight_accessory',
    defaultSets: 3,
    defaultTargetReps: 10,
    increment: 1.25,
    defaultWeight: 0,
    repRangeMin: 5,
    repRangeMax: 10,
  },
  dips: {
    id: 'dips',
    name: 'Tricep Dips',
    category: 'bodyweight_accessory',
    defaultSets: 3,
    defaultTargetReps: 10,
    increment: 1.25,
    defaultWeight: 0,
    repRangeMin: 5,
    repRangeMax: 12,
  },
  skullcrushers: {
    id: 'skullcrushers',
    name: 'Barbell Skullcrushers',
    category: 'barbell_compound',
    defaultSets: 3,
    defaultTargetReps: 10,
    increment: 2.5,
    defaultWeight: 15,
    isFloorLift: false,
  },
  incline_bench: {
    id: 'incline_bench',
    name: 'Incline Barbell Bench',
    category: 'barbell_compound',
    defaultSets: 3,
    defaultTargetReps: 8,
    increment: 2.5,
    defaultWeight: 25,
    isFloorLift: false,
  },
  plank: {
    id: 'plank',
    name: 'Plank Holds',
    category: 'bodyweight_accessory',
    defaultSets: 3,
    defaultTargetReps: 60,
    increment: 0,
    defaultWeight: 0,
  },
  hanging_leg_raises: {
    id: 'hanging_leg_raises',
    name: 'Hanging Leg Raises',
    category: 'bodyweight_accessory',
    defaultSets: 3,
    defaultTargetReps: 12,
    increment: 0,
    defaultWeight: 0,
  },
  barbell_curl: {
    id: 'barbell_curl',
    name: 'Barbell Bicep Curls',
    category: 'barbell_compound',
    defaultSets: 3,
    defaultTargetReps: 8,
    increment: 2.5,
    defaultWeight: 15,
    isFloorLift: false,
  }
};

export const PROGRAM_DEFINITIONS: Record<ProgramId, ProgramDefinition> = {
  bill_lifts: {
    id: 'bill_lifts',
    name: 'BillLifts',
    tagline: 'StrongLifts 5×5 + DB Bicep Curls & Pull-ups',
    description: 'The signature routine: 5×5 barbell compounds paired with dumbbell bicep double progression ladder and pull-up AMRAPs.',
    badge: 'Popular',
    routines: {
      A: {
        name: 'Workout A',
        exerciseIds: ['squat', 'bench', 'row', 'bicep_curl']
      },
      B: {
        name: 'Workout B',
        exerciseIds: ['squat', 'ohp', 'deadlift', 'pullups']
      }
    }
  },
  classic_5x5: {
    id: 'classic_5x5',
    name: 'StrongLifts 5×5 (Classic)',
    tagline: 'Original pure 3-compound linear progression',
    description: 'The foundational program: 3 heavy barbell exercises per session with zero accessories for maximum recovery and raw strength.',
    badge: 'Classic',
    routines: {
      A: {
        name: 'Workout A',
        exerciseIds: ['squat', 'bench', 'row']
      },
      B: {
        name: 'Workout B',
        exerciseIds: ['squat', 'ohp', 'deadlift']
      }
    }
  },
  sl_plus_arms: {
    id: 'sl_plus_arms',
    name: 'StrongLifts 5×5 + Arms',
    tagline: '5×5 Compounds with Dips, Curls & Skullcrushers',
    description: 'Adds direct arm hypertrophy (biceps & triceps) to the 5×5 strength routine.',
    badge: 'Hypertrophy',
    routines: {
      A: {
        name: 'Workout A',
        exerciseIds: ['squat', 'bench', 'row', 'skullcrushers', 'bicep_curl']
      },
      B: {
        name: 'Workout B',
        exerciseIds: ['squat', 'ohp', 'deadlift', 'dips', 'pullups']
      }
    }
  },
  sl_3x5: {
    id: 'sl_3x5',
    name: 'StrongLifts 3×5 (Intermediate)',
    tagline: 'Lower volume when 5×5 gets too heavy to recover from',
    description: 'Reduces barbell work sets from 5×5 to 3×5 so you can continue adding 2.5kg each session past the beginner stage.',
    badge: 'Intermediate',
    routines: {
      A: {
        name: 'Workout A',
        exerciseIds: ['squat', 'bench', 'row', 'bicep_curl']
      },
      B: {
        name: 'Workout B',
        exerciseIds: ['squat', 'ohp', 'deadlift', 'pullups']
      }
    }
  },
  sl_hypertrophy: {
    id: 'sl_hypertrophy',
    name: 'StrongLifts Full Body Mass',
    tagline: 'Compounds + Incline Bench, Dips & Accessories',
    description: 'Heavy compound volume blended with upper chest and arm accessory exercises.',
    badge: 'Advanced',
    routines: {
      A: {
        name: 'Workout A',
        exerciseIds: ['squat', 'bench', 'row', 'incline_bench', 'bicep_curl']
      },
      B: {
        name: 'Workout B',
        exerciseIds: ['squat', 'ohp', 'deadlift', 'dips', 'pullups']
      }
    }
  }
};

export const WORKOUT_ROUTINES: Record<WorkoutType, { name: string; exerciseIds: ExerciseId[] }> = PROGRAM_DEFINITIONS.bill_lifts.routines;

export const DEFAULT_DUMBBELL_INVENTORY: number[] = [2, 4, 5, 7.5, 9, 10, 12.5, 15, 17.5, 20];

// User's specific plate inventory: 4x1.25, 4x2.5, 4x5, 2x10, 2x15, 2x20
export const DEFAULT_PLATE_INVENTORY: PlateInventoryItem[] = [
  { weight: 20, count: 2 },
  { weight: 15, count: 2 },
  { weight: 10, count: 2 },
  { weight: 5, count: 4 },
  { weight: 2.5, count: 4 },
  { weight: 1.25, count: 4 },
];

export const DEFAULT_AVAILABLE_PLATES: number[] = [20, 15, 10, 5, 2.5, 1.25];

export const DEFAULT_USER_SETTINGS: UserSettings = {
  unit: 'kg',
  barWeight: 20,
  activeProgramId: 'bill_lifts',
  dumbbellInventory: DEFAULT_DUMBBELL_INVENTORY,
  plateInventory: DEFAULT_PLATE_INVENTORY,
  availablePlates: DEFAULT_AVAILABLE_PLATES,
  defaultRestSecondsSuccess: 90,
  defaultRestSecondsFailure: 180,
  soundEnabled: true,
  vibrationEnabled: true,
  autoStartRestTimer: true,
};

export const OLYMPIC_PLATE_COLORS: Record<number, { bg: string; text: string; border?: string; height: string }> = {
  25: { bg: '#ef4444', text: '#ffffff', height: 'h-24' },
  20: { bg: '#3b82f6', text: '#ffffff', height: 'h-24' },
  15: { bg: '#eab308', text: '#000000', height: 'h-20' },
  10: { bg: '#10b981', text: '#ffffff', height: 'h-18' },
  5: { bg: '#f8fafc', text: '#0f172a', border: '#cbd5e1', height: 'h-14' },
  2.5: { bg: '#1e293b', text: '#ffffff', border: '#475569', height: 'h-12' },
  1.25: { bg: '#94a3b8', text: '#0f172a', height: 'h-10' },
  0.5: { bg: '#64748b', text: '#ffffff', height: 'h-8' },
};
