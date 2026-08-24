import type {
  ExerciseDefinition,
  ExerciseId,
  ExerciseProgressionConfig,
  PlateInventoryItem,
  ProgramDefinition,
  ProgramId,
  SchedulePreference,
  UserSettings,
  WorkoutType
} from '../types';

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

export const DEFAULT_PROGRESSION_CONFIGS: Record<ExerciseId, ExerciseProgressionConfig> = {
  squat: {
    exerciseId: 'squat',
    strategy: 'linear',
    increment: 2.5,
    deloadPercentage: 10,
    failuresBeforeDeload: 3,
  },
  bench: {
    exerciseId: 'bench',
    strategy: 'linear',
    increment: 2.5,
    deloadPercentage: 10,
    failuresBeforeDeload: 3,
  },
  row: {
    exerciseId: 'row',
    strategy: 'linear',
    increment: 2.5,
    deloadPercentage: 10,
    failuresBeforeDeload: 3,
  },
  ohp: {
    exerciseId: 'ohp',
    strategy: 'linear',
    increment: 2.5,
    deloadPercentage: 10,
    failuresBeforeDeload: 3,
  },
  deadlift: {
    exerciseId: 'deadlift',
    strategy: 'linear',
    increment: 5.0,
    deloadPercentage: 10,
    failuresBeforeDeload: 3,
  },
  bicep_curl: {
    exerciseId: 'bicep_curl',
    strategy: 'double_progression',
    increment: 0,
    repRangeMin: 8,
    repRangeMax: 12,
    repStep: 2,
    deloadPercentage: 10,
    failuresBeforeDeload: 3,
  },
  pullups: {
    exerciseId: 'pullups',
    strategy: 'bodyweight_reps',
    increment: 1.25,
    repRangeMax: 10,
    deloadPercentage: 10,
    failuresBeforeDeload: 3,
  },
  dips: {
    exerciseId: 'dips',
    strategy: 'bodyweight_reps',
    increment: 1.25,
    repRangeMax: 10,
    deloadPercentage: 10,
    failuresBeforeDeload: 3,
  },
  skullcrushers: {
    exerciseId: 'skullcrushers',
    strategy: 'linear',
    increment: 2.5,
    deloadPercentage: 10,
    failuresBeforeDeload: 3,
  },
  incline_bench: {
    exerciseId: 'incline_bench',
    strategy: 'linear',
    increment: 2.5,
    deloadPercentage: 10,
    failuresBeforeDeload: 3,
  },
  plank: {
    exerciseId: 'plank',
    strategy: 'time',
    increment: 15,
    repRangeMax: 60,
    deloadPercentage: 10,
    failuresBeforeDeload: 3,
  },
  hanging_leg_raises: {
    exerciseId: 'hanging_leg_raises',
    strategy: 'bodyweight_reps',
    increment: 2.5,
    repRangeMax: 12,
    deloadPercentage: 10,
    failuresBeforeDeload: 3,
  },
  barbell_curl: {
    exerciseId: 'barbell_curl',
    strategy: 'linear',
    increment: 2.5,
    deloadPercentage: 10,
    failuresBeforeDeload: 3,
  },
};

export const PROGRAM_DEFINITIONS: Record<ProgramId, ProgramDefinition> = {
  bill_lifts: {
    id: 'bill_lifts',
    name: 'BillLifts',
    tagline: '5×5 Compounds + DB Curls & Pull-ups',
    description: 'The complete signature program: 5×5 core compounds plus high-value bicep curl and pull-up accessories.',
    badge: 'Recommended',
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
    tagline: 'Pure 3-Compound Workouts (0 Accessories)',
    description: 'The timeless minimalist strength routine: 3 compound barbell exercises per workout.',
    badge: 'Pure 5×5',
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
    tagline: 'Compounds + Dips, Skullcrushers & Curls',
    description: 'Full 5×5 compound lifting paired with dedicated direct arm volume for hypertrophy.',
    badge: 'Popular',
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
    tagline: '3×5 Work Sets for Heavy Lifters',
    description: 'Lower volume variation allowing for continuous strength gains when 5×5 recovery becomes difficult.',
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

export const DEFAULT_SCHEDULE_PREFERENCE: SchedulePreference = {
  pattern: 'mon_wed_fri',
  workoutDays: [1, 3, 5], // Mon, Wed, Fri
  mobilityDays: [2, 4, 6], // Tue, Thu, Sat
  restDays: [0], // Sun
};

export const DEFAULT_USER_SETTINGS: UserSettings = {
  unit: 'kg',
  barWeight: 20,
  activeProgramId: 'bill_lifts',
  dumbbellInventory: DEFAULT_DUMBBELL_INVENTORY,
  plateInventory: DEFAULT_PLATE_INVENTORY,
  availablePlates: DEFAULT_AVAILABLE_PLATES,
  progressionConfigs: DEFAULT_PROGRESSION_CONFIGS,
  schedulePreference: DEFAULT_SCHEDULE_PREFERENCE,
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
