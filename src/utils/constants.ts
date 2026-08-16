import type { ExerciseDefinition, ExerciseId, PlateInventoryItem, UserSettings, WorkoutType } from '../types';

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
  }
};

export const WORKOUT_ROUTINES: Record<WorkoutType, { name: string; exerciseIds: ExerciseId[] }> = {
  A: {
    name: 'Workout A',
    exerciseIds: ['squat', 'bench', 'row', 'bicep_curl']
  },
  B: {
    name: 'Workout B',
    exerciseIds: ['squat', 'ohp', 'deadlift', 'pullups']
  }
};

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
  25: { bg: '#ef4444', text: '#ffffff', height: 'h-24' }, // Red (25kg)
  20: { bg: '#3b82f6', text: '#ffffff', height: 'h-24' }, // Blue (20kg)
  15: { bg: '#eab308', text: '#000000', height: 'h-20' }, // Yellow (15kg)
  10: { bg: '#10b981', text: '#ffffff', height: 'h-18' }, // Green (10kg)
  5: { bg: '#f8fafc', text: '#0f172a', border: '#cbd5e1', height: 'h-14' }, // White (5kg)
  2.5: { bg: '#1e293b', text: '#ffffff', border: '#475569', height: 'h-12' }, // Black (2.5kg)
  1.25: { bg: '#94a3b8', text: '#0f172a', height: 'h-10' }, // Silver / Grey (1.25kg)
  0.5: { bg: '#64748b', text: '#ffffff', height: 'h-8' },
};
