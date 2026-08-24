export type WorkoutType = 'A' | 'B';

export type ExerciseId = 
  | 'squat' 
  | 'bench' 
  | 'row' 
  | 'ohp' 
  | 'deadlift' 
  | 'bicep_curl' 
  | 'pullups'
  | 'dips'
  | 'skullcrushers'
  | 'incline_bench'
  | 'plank'
  | 'hanging_leg_raises'
  | 'barbell_curl';

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

export type ProgramId = 
  | 'bill_lifts'
  | 'classic_5x5'
  | 'sl_plus_arms'
  | 'sl_3x5'
  | 'sl_hypertrophy';

export interface ProgramRoutine {
  name: string;
  exerciseIds: ExerciseId[];
}

export interface ProgramDefinition {
  id: ProgramId;
  name: string;
  tagline: string;
  description: string;
  badge?: string;
  routines: Record<WorkoutType, ProgramRoutine>;
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

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sun, 1 = Mon, ..., 6 = Sat
export type SchedulePattern = 'mon_wed_fri' | 'tue_thu_sat' | 'every_other_day' | 'custom';

export interface SchedulePreference {
  pattern: SchedulePattern;
  workoutDays: DayOfWeek[];
  mobilityDays: DayOfWeek[];
  restDays: DayOfWeek[];
}

export interface WorkoutSession {
  id?: number;
  type: WorkoutType;
  programId?: ProgramId;
  programName?: string;
  sessionCategory?: 'strength' | 'mobility';
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

export type ProgressionStrategy = 'linear' | 'double_progression' | 'bodyweight_reps' | 'time';

export interface ExerciseProgressionConfig {
  exerciseId: ExerciseId;
  strategy: ProgressionStrategy;
  increment: number; // e.g. 2.5 kg, 5.0 kg, 1.25 kg
  deloadPercentage: number; // e.g. 10%, 15%, 20%
  failuresBeforeDeload: number; // e.g. 3 failures
  
  // Dumbbell & Bodyweight parameters
  repRangeMin?: number; // e.g. 8 reps
  repRangeMax?: number; // e.g. 12 reps
  repStep?: number; // e.g. +2 reps per tier (8 -> 10 -> 12)
}

export interface UserSettings {
  unit: 'kg' | 'lbs';
  barWeight: number; // Default 20 kg
  activeProgramId: ProgramId; // 'bill_lifts' by default
  dumbbellInventory: number[]; // e.g. [2, 4, 5, 7.5, 9, 10, 12.5, 15, 17.5, 20]
  plateInventory: PlateInventoryItem[]; // e.g. [{ weight: 20, count: 2 }, { weight: 15, count: 2 }, ...]
  availablePlates?: number[]; // backwards compatibility fallback
  progressionConfigs?: Partial<Record<ExerciseId, ExerciseProgressionConfig>>;
  schedulePreference?: SchedulePreference;
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

export type MobilityCategory = 'yoga' | 'stretching' | 'pilates' | 'mobility';

export interface MobilityPose {
  id: string;
  name: string;
  category: MobilityCategory;
  targetMuscles: string[];
  defaultDurationSeconds: number;
  isBilateral: boolean;
  cues: string[];
  whereYouShouldFeelIt: string;
  beginnerModification: string;
  breathingCue: string;
}

export interface MobilityRoutinePose {
  poseId: string;
  durationSeconds?: number;
}

export interface MobilityRoutine {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  category: MobilityCategory;
  estimatedMinutes: number;
  badge?: string;
  poses: MobilityRoutinePose[];
}
