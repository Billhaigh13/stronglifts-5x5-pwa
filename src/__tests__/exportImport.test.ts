import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../db';
import { importDatabaseFromJSON, type BackupData } from '../utils/exportImport';
import { DEFAULT_USER_SETTINGS } from '../utils/constants';

describe('exportImport', () => {
  beforeEach(async () => {
    await db.workouts.clear();
    await db.exerciseProgress.clear();
    await db.settings.clear();
  });

  it('successfully imports valid JSON backup payload', async () => {
    const backup: BackupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      app: 'StrongLifts 5x5 Tracker',
      settings: DEFAULT_USER_SETTINGS,
      exerciseProgress: [
        {
          exerciseId: 'squat',
          currentWeight: 75,
          consecutiveFailures: 0,
          allTimePRWeight: 75,
          allTimePRReps: 5,
        },
      ],
      workouts: [
        {
          type: 'A',
          date: new Date().toISOString(),
          startTime: Date.now() - 3600000,
          endTime: Date.now(),
          durationSeconds: 3600,
          completed: true,
          exerciseLogs: [
            {
              exerciseId: 'squat',
              exerciseName: 'Barbell Squat',
              targetWeight: 75,
              targetReps: [5, 5, 5, 5, 5],
              completedReps: [5, 5, 5, 5, 5],
              completed: true,
            },
          ],
        },
      ],
    };

    const file = new File([JSON.stringify(backup)], 'backup.json', { type: 'application/json' });
    const result = await importDatabaseFromJSON(file);

    expect(result.success).toBe(true);
    expect(result.count).toBe(1);

    const workouts = await db.workouts.toArray();
    expect(workouts.length).toBe(1);
    expect(workouts[0].type).toBe('A');

    const progress = await db.exerciseProgress.get('squat');
    expect(progress?.currentWeight).toBe(75);
  });

  it('rejects corrupted or invalid JSON file with helpful error message', async () => {
    const file = new File(['not valid json'], 'corrupted.json', { type: 'application/json' });
    const result = await importDatabaseFromJSON(file);

    expect(result.success).toBe(false);
    expect(result.message).toBeDefined();
  });

  it('rejects backup with missing workouts array', async () => {
    const invalidBackup = {
      version: 1,
      app: 'Wrong App',
    };
    const file = new File([JSON.stringify(invalidBackup)], 'invalid.json', { type: 'application/json' });
    const result = await importDatabaseFromJSON(file);

    expect(result.success).toBe(false);
    expect(result.message).toContain('Missing workout history');
  });
});
