import { describe, it, expect, beforeEach } from 'vitest';
import {
  db,
  initializeDatabase,
  getUserSettings,
  saveUserSettings,
  saveWorkout,
  getRecentWorkouts,
  getLastWorkout,
  deleteWorkout,
  updateExerciseProgress,
  getAllExerciseProgress,
  seedSampleHistory,
} from '../db';
import type { WorkoutSession } from '../types';
import { DEFAULT_USER_SETTINGS } from '../utils/constants';

describe('IndexedDB operations (db/index.ts)', () => {
  beforeEach(async () => {
    await db.workouts.clear();
    await db.exerciseProgress.clear();
    await db.settings.clear();
  });

  it('initializes default settings and exercise progression table', async () => {
    await initializeDatabase();

    const settings = await getUserSettings();
    expect(settings.barWeight).toBe(20);
    expect(settings.activeProgramId).toBe('bill_lifts');

    const progressMap = await getAllExerciseProgress();
    expect(progressMap.squat).toBeDefined();
    expect(progressMap.squat.currentWeight).toBe(30);
    expect(progressMap.deadlift.currentWeight).toBe(40);
  });

  it('saves and retrieves user settings non-destructively', async () => {
    await initializeDatabase();
    await saveUserSettings({
      ...DEFAULT_USER_SETTINGS,
      barWeight: 15,
      unit: 'lbs',
    });

    const updated = await getUserSettings();
    expect(updated.barWeight).toBe(15);
    expect(updated.unit).toBe('lbs');
  });

  it('saves, fetches, and deletes workout sessions', async () => {
    const session1: WorkoutSession = {
      type: 'A',
      date: new Date('2026-01-01T10:00:00Z').toISOString(),
      startTime: 1000,
      endTime: 2000,
      durationSeconds: 1000,
      completed: true,
      exerciseLogs: [],
    };
    const session2: WorkoutSession = {
      type: 'B',
      date: new Date('2026-01-03T10:00:00Z').toISOString(),
      startTime: 3000,
      endTime: 4000,
      durationSeconds: 1000,
      completed: true,
      exerciseLogs: [],
    };

    const id1 = await saveWorkout(session1);
    const id2 = await saveWorkout(session2);

    expect(id1).toBeDefined();
    expect(id2).toBeDefined();

    const recent = await getRecentWorkouts(10);
    expect(recent.length).toBe(2);
    expect(recent[0].type).toBe('B'); // Most recent date first

    const latest = await getLastWorkout();
    expect(latest?.type).toBe('B');

    await deleteWorkout(id2);
    const afterDelete = await getRecentWorkouts(10);
    expect(afterDelete.length).toBe(1);
    expect(afterDelete[0].type).toBe('A');
  });

  it('updates exercise progress and retrieves all records', async () => {
    await updateExerciseProgress({
      exerciseId: 'squat',
      currentWeight: 100,
      consecutiveFailures: 0,
      allTimePRWeight: 100,
      allTimePRReps: 5,
    });

    const progress = await getAllExerciseProgress();
    expect(progress.squat.currentWeight).toBe(100);
    expect(progress.squat.allTimePRWeight).toBe(100);
  });

  it('seeds sample workout history successfully', async () => {
    await seedSampleHistory();

    const workouts = await getRecentWorkouts(100);
    expect(workouts.length).toBe(6);

    const progress = await getAllExerciseProgress();
    expect(progress.squat.currentWeight).toBe(45);
    expect(progress.deadlift.currentWeight).toBe(55);
  });
});
