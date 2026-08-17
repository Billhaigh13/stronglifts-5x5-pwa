import Dexie, { type Table } from 'dexie';
import type { ExerciseId, ExerciseProgressState, UserSettings, WorkoutSession } from '../types';
import { DEFAULT_USER_SETTINGS, EXERCISE_DEFINITIONS } from '../utils/constants';

export class StrongLiftsDB extends Dexie {
  workouts!: Table<WorkoutSession, number>;
  exerciseProgress!: Table<ExerciseProgressState, string>;
  settings!: Table<{ key: string; value: any }, string>;

  constructor() {
    super('StrongLifts5x5DB');
    this.version(1).stores({
      workouts: '++id, type, date, completed',
      exerciseProgress: 'exerciseId, currentWeight',
      settings: 'key'
    });
  }
}

export const db = new StrongLiftsDB();

export async function initializeDatabase(): Promise<void> {
  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.put({ key: 'userSettings', value: DEFAULT_USER_SETTINGS });
  }

  const progressCount = await db.exerciseProgress.count();
  if (progressCount === 0) {
    const initialProgress: ExerciseProgressState[] = (Object.keys(EXERCISE_DEFINITIONS) as ExerciseId[]).map(id => {
      const def = EXERCISE_DEFINITIONS[id];
      return {
        exerciseId: id,
        currentWeight: def.defaultWeight,
        consecutiveFailures: 0,
        mode: id === 'pullups' ? 'bodyweight' : undefined,
        targetRepsPerSet: id === 'bicep_curl' ? 8 : (Array.isArray(def.defaultTargetReps) ? def.defaultTargetReps[0] : def.defaultTargetReps),
        allTimePRWeight: def.defaultWeight,
        allTimePRReps: typeof def.defaultTargetReps === 'number' ? def.defaultTargetReps : 5
      };
    });
    await db.exerciseProgress.bulkPut(initialProgress);
  }
}

export async function getUserSettings(): Promise<UserSettings> {
  const record = await db.settings.get('userSettings');
  if (record && record.value) {
    return {
      ...DEFAULT_USER_SETTINGS,
      ...record.value,
      activeProgramId: record.value.activeProgramId || DEFAULT_USER_SETTINGS.activeProgramId,
      plateInventory: record.value.plateInventory || DEFAULT_USER_SETTINGS.plateInventory,
    };
  }
  return DEFAULT_USER_SETTINGS;
}

export async function saveUserSettings(settings: UserSettings): Promise<void> {
  await db.settings.put({ key: 'userSettings', value: settings });
}

export async function getExerciseProgress(exerciseId: ExerciseId): Promise<ExerciseProgressState | undefined> {
  return await db.exerciseProgress.get(exerciseId);
}

export async function getAllExerciseProgress(): Promise<Record<ExerciseId, ExerciseProgressState>> {
  const list = await db.exerciseProgress.toArray();
  const map = {} as Record<ExerciseId, ExerciseProgressState>;
  list.forEach(p => {
    map[p.exerciseId] = p;
  });
  return map;
}

export async function updateExerciseProgress(progress: ExerciseProgressState): Promise<void> {
  await db.exerciseProgress.put(progress);
}

export async function getRecentWorkouts(limit = 50): Promise<WorkoutSession[]> {
  return await db.workouts.orderBy('date').reverse().limit(limit).toArray();
}

export async function getLastWorkout(): Promise<WorkoutSession | undefined> {
  return await db.workouts.orderBy('date').reverse().first();
}

export async function saveWorkout(workout: WorkoutSession): Promise<number> {
  if (workout.id) {
    await db.workouts.put(workout);
    return workout.id;
  } else {
    return await db.workouts.add(workout);
  }
}

export async function deleteWorkout(id: number): Promise<void> {
  await db.workouts.delete(id);
}

export async function seedSampleHistory(): Promise<void> {
  await db.workouts.clear();
  
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  
  const sampleWorkouts: WorkoutSession[] = [
    {
      type: 'A',
      date: new Date(now - oneDay * 14).toISOString(),
      startTime: now - oneDay * 14,
      endTime: now - oneDay * 14 + 45 * 60 * 1000,
      durationSeconds: 2700,
      completed: true,
      notes: 'Great first session, energy high',
      exerciseLogs: [
        { exerciseId: 'squat', exerciseName: 'Barbell Squat', targetWeight: 30, targetReps: [5,5,5,5,5], completedReps: [5,5,5,5,5], completed: true },
        { exerciseId: 'bench', exerciseName: 'Barbell Bench Press', targetWeight: 30, targetReps: [5,5,5,5,5], completedReps: [5,5,5,5,5], completed: true },
        { exerciseId: 'row', exerciseName: 'Barbell Row', targetWeight: 30, targetReps: [5,5,5,5,5], completedReps: [5,5,5,5,5], completed: true },
        { exerciseId: 'bicep_curl', exerciseName: 'Dumbbell Bicep Curls', targetWeight: 7.5, targetReps: [8,8,8], completedReps: [8,8,8], completed: true }
      ]
    },
    {
      type: 'B',
      date: new Date(now - oneDay * 12).toISOString(),
      startTime: now - oneDay * 12,
      endTime: now - oneDay * 12 + 42 * 60 * 1000,
      durationSeconds: 2520,
      completed: true,
      notes: 'OHP felt solid',
      exerciseLogs: [
        { exerciseId: 'squat', exerciseName: 'Barbell Squat', targetWeight: 32.5, targetReps: [5,5,5,5,5], completedReps: [5,5,5,5,5], completed: true },
        { exerciseId: 'ohp', exerciseName: 'Overhead Press', targetWeight: 20, targetReps: [5,5,5,5,5], completedReps: [5,5,5,5,5], completed: true },
        { exerciseId: 'deadlift', exerciseName: 'Barbell Deadlift', targetWeight: 40, targetReps: [5], completedReps: [5], completed: true },
        { exerciseId: 'pullups', exerciseName: 'Pull-ups / Chin-ups', targetWeight: 0, targetReps: [10,10,10], completedReps: [7,6,5], completed: true, mode: 'bodyweight' }
      ]
    },
    {
      type: 'A',
      date: new Date(now - oneDay * 9).toISOString(),
      startTime: now - oneDay * 9,
      endTime: now - oneDay * 9 + 48 * 60 * 1000,
      durationSeconds: 2880,
      completed: true,
      notes: 'Squats feeling heavier but manageable',
      exerciseLogs: [
        { exerciseId: 'squat', exerciseName: 'Barbell Squat', targetWeight: 35, targetReps: [5,5,5,5,5], completedReps: [5,5,5,5,5], completed: true },
        { exerciseId: 'bench', exerciseName: 'Barbell Bench Press', targetWeight: 32.5, targetReps: [5,5,5,5,5], completedReps: [5,5,5,5,5], completed: true },
        { exerciseId: 'row', exerciseName: 'Barbell Row', targetWeight: 32.5, targetReps: [5,5,5,5,5], completedReps: [5,5,5,5,5], completed: true },
        { exerciseId: 'bicep_curl', exerciseName: 'Dumbbell Bicep Curls', targetWeight: 7.5, targetReps: [10,10,10], completedReps: [10,10,10], completed: true }
      ]
    },
    {
      type: 'B',
      date: new Date(now - oneDay * 7).toISOString(),
      startTime: now - oneDay * 7,
      endTime: now - oneDay * 7 + 46 * 60 * 1000,
      durationSeconds: 2760,
      completed: true,
      notes: 'Deadlift PR!',
      exerciseLogs: [
        { exerciseId: 'squat', exerciseName: 'Barbell Squat', targetWeight: 37.5, targetReps: [5,5,5,5,5], completedReps: [5,5,5,5,5], completed: true },
        { exerciseId: 'ohp', exerciseName: 'Overhead Press', targetWeight: 22.5, targetReps: [5,5,5,5,5], completedReps: [5,5,5,5,5], completed: true },
        { exerciseId: 'deadlift', exerciseName: 'Barbell Deadlift', targetWeight: 45, targetReps: [5], completedReps: [5], isPR: true, completed: true },
        { exerciseId: 'pullups', exerciseName: 'Pull-ups / Chin-ups', targetWeight: 0, targetReps: [10,10,10], completedReps: [8,7,6], completed: true, mode: 'bodyweight' }
      ]
    },
    {
      type: 'A',
      date: new Date(now - oneDay * 4).toISOString(),
      startTime: now - oneDay * 4,
      endTime: now - oneDay * 4 + 50 * 60 * 1000,
      durationSeconds: 3000,
      completed: true,
      notes: 'Hit 3x12 on bicep curls, ready to level up to 9kg next time!',
      exerciseLogs: [
        { exerciseId: 'squat', exerciseName: 'Barbell Squat', targetWeight: 40, targetReps: [5,5,5,5,5], completedReps: [5,5,5,5,5], completed: true },
        { exerciseId: 'bench', exerciseName: 'Barbell Bench Press', targetWeight: 35, targetReps: [5,5,5,5,5], completedReps: [5,5,5,5,5], completed: true },
        { exerciseId: 'row', exerciseName: 'Barbell Row', targetWeight: 35, targetReps: [5,5,5,5,5], completedReps: [5,5,5,5,5], completed: true },
        { exerciseId: 'bicep_curl', exerciseName: 'Dumbbell Bicep Curls', targetWeight: 7.5, targetReps: [12,12,12], completedReps: [12,12,12], isPR: true, completed: true }
      ]
    },
    {
      type: 'B',
      date: new Date(now - oneDay * 2).toISOString(),
      startTime: now - oneDay * 2,
      endTime: now - oneDay * 2 + 52 * 60 * 1000,
      durationSeconds: 3120,
      completed: true,
      notes: 'Squats at 42.5kg felt powerful.',
      exerciseLogs: [
        { exerciseId: 'squat', exerciseName: 'Barbell Squat', targetWeight: 42.5, targetReps: [5,5,5,5,5], completedReps: [5,5,5,5,5], isPR: true, completed: true },
        { exerciseId: 'ohp', exerciseName: 'Overhead Press', targetWeight: 25, targetReps: [5,5,5,5,5], completedReps: [5,5,5,4,3], completed: true },
        { exerciseId: 'deadlift', exerciseName: 'Barbell Deadlift', targetWeight: 50, targetReps: [5], completedReps: [5], isPR: true, completed: true },
        { exerciseId: 'pullups', exerciseName: 'Pull-ups / Chin-ups', targetWeight: 0, targetReps: [10,10,10], completedReps: [8,8,7], completed: true, mode: 'bodyweight' }
      ]
    }
  ];

  await db.workouts.bulkAdd(sampleWorkouts);

  await db.exerciseProgress.put({ exerciseId: 'squat', currentWeight: 45, consecutiveFailures: 0, allTimePRWeight: 42.5, allTimePRReps: 5 });
  await db.exerciseProgress.put({ exerciseId: 'bench', currentWeight: 37.5, consecutiveFailures: 0, allTimePRWeight: 35, allTimePRReps: 5 });
  await db.exerciseProgress.put({ exerciseId: 'row', currentWeight: 37.5, consecutiveFailures: 0, allTimePRWeight: 35, allTimePRReps: 5 });
  await db.exerciseProgress.put({ exerciseId: 'ohp', currentWeight: 25, consecutiveFailures: 1, allTimePRWeight: 22.5, allTimePRReps: 5 });
  await db.exerciseProgress.put({ exerciseId: 'deadlift', currentWeight: 55, consecutiveFailures: 0, allTimePRWeight: 50, allTimePRReps: 5 });
  await db.exerciseProgress.put({ exerciseId: 'bicep_curl', currentWeight: 9, consecutiveFailures: 0, targetRepsPerSet: 8, allTimePRWeight: 7.5, allTimePRReps: 12 });
  await db.exerciseProgress.put({ exerciseId: 'pullups', currentWeight: 0, consecutiveFailures: 0, mode: 'bodyweight', targetRepsPerSet: 10, allTimePRWeight: 0, allTimePRReps: 8 });
}
