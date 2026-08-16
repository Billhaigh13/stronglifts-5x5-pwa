export type WorkoutType = 'A' | 'B';

export type ExerciseId = 
  | 'squat' 
  | 'bench' 
  | 'row' 
  | 'ohp' 
  | 'deadlift' 
  | 'bicep_curl' 
  | 'pullups';

export type ExerciseCategory = 'barbell_compound' | 'dumbbell_accessory' | 'bodyweight_accessory';

export interface ExerciseDefinition {
  id: ExerciseId;
  name: string;
  category: ExerciseCategory;
  defaultSets: number;
  defaultTargetReps: number | number[]; // 5 for 5x5, 12 for db curls, etc.
  increment: number; // 2.5 for bench/squat/row/ohp, 5.0 for deadlift
  defaultWeight: number; // in kg
  isFloorLift?: boolean; // Deadlift & Barbell Row start from floor
  repRangeMin?: number;
  repRangeMax?: number;
}

export interface WarmupSet {
  setNumber: number;
  reps: number;
  weight: number;
  percentageText: string;
  completed: boolean;
}

export interface ExerciseProgressState {
  exerciseId: ExerciseId;
  currentWeight: number; // in kg
  consecutiveFailures: number; // 0, 1, 2, 3 -> triggers 10% deload
  mode?: 'bodyweight' | 'weighted';
  targetRepsPerSet?: number; // for curls: 8..12
  lastCompletedDate?: string;
  allTimePRWeight: number;
  allTimePRReps: number;
}

export interface ExerciseLog {
  id?: number;
  workoutId?: number;
  exerciseId: ExerciseId;
  exerciseName: string;
  targetWeight: number;
  targetReps: number[];
  completedReps: (number | null)[];
  isPR?: boolean;
  isDeload?: boolean;
  mode?: 'bodyweight' | 'weighted';
  completed: boolean;
}

export interface WorkoutSession {
  id?: number;
  type: WorkoutType;
  date: string; // ISO date string
  startTime: number;
  endTime?: number;
  durationSeconds: number;
  completed: boolean;
  notes?: string;
  exerciseLogs: ExerciseLog[];
}

export interface UserSettings {
  unit: 'kg' | 'lbs';
  barWeight: number; // Default 20 kg
  dumbbellInventory: number[]; // e.g. [2, 4, 5, 7.5, 9, 10, 12.5, 15, 17.5, 20]
  availablePlates: number[]; // e.g. [25, 20, 15, 10, 5, 2.5, 1.25]
  defaultRestSecondsSuccess: number; // default 90s
  defaultRestSecondsFailure: number; // default 180s
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  autoStartRestTimer: boolean;
}

export interface PlateCount {
  weight: number;
  countPerSide: number;
  color: string;
  textColor?: string;
}

export interface PlateCalculationResult {
  targetWeight: number;
  barWeight: number;
  weightPerSide: number;
  plates: PlateCount[];
  remainder: number;
}

export interface ProgressionResult {
  nextWeight: number;
  consecutiveFailures: number;
  isDeload: boolean;
  deloadPercent?: number;
  message: string;
  nextTargetReps?: number;
}
