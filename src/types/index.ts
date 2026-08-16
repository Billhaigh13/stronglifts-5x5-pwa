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
  defaultTargetReps: number | number[];
  increment: number;
  defaultWeight: number;
  isFloorLift?: boolean;
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
  currentWeight: number;
  consecutiveFailures: number;
  mode?: 'bodyweight' | 'weighted';
  targetRepsPerSet?: number;
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
  date: string;
  startTime: number;
  endTime?: number;
  durationSeconds: number;
  completed: boolean;
  notes?: string;
  exerciseLogs: ExerciseLog[];
}

export interface PlateInventoryItem {
  weight: number; // in kg (or lbs)
  count: number; // total count owned in gym
}

export interface UserSettings {
  unit: 'kg' | 'lbs';
  barWeight: number; // Default 20 kg
  dumbbellInventory: number[]; // e.g. [2, 4, 5, 7.5, 9, 10, 12.5, 15, 17.5, 20]
  plateInventory: PlateInventoryItem[]; // e.g. [{ weight: 20, count: 2 }, { weight: 15, count: 2 }, ...]
  availablePlates?: number[]; // backwards compatibility fallback
  defaultRestSecondsSuccess: number;
  defaultRestSecondsFailure: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  autoStartRestTimer: boolean;
  githubToken?: string;
}

export interface PlateCount {
  weight: number;
  countPerSide: number;
  totalUsed: number;
  availablePerSide: number;
  color: string;
  textColor?: string;
}

export interface PlateCalculationResult {
  targetWeight: number;
  barWeight: number;
  weightPerSide: number;
  loadedWeight: number;
  plates: PlateCount[];
  remainder: number;
  isExactMatch: boolean;
  maxLoadableWeight: number;
}

export interface ProgressionResult {
  nextWeight: number;
  consecutiveFailures: number;
  isDeload: boolean;
  deloadPercent?: number;
  message: string;
  nextTargetReps?: number;
}
