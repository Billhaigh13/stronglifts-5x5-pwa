import { db, getUserSettings } from '../db';
import type { UserSettings, WorkoutSession, ExerciseProgressState } from '../types';

export interface BackupData {
  version: number;
  exportedAt: string;
  app: string;
  settings: UserSettings;
  exerciseProgress: ExerciseProgressState[];
  workouts: WorkoutSession[];
}

export async function exportDatabaseToJSON(): Promise<void> {
  const settings = await getUserSettings();
  const exerciseProgress = await db.exerciseProgress.toArray();
  const workouts = await db.workouts.toArray();

  const backupData: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    app: 'StrongLifts 5x5 Tracker',
    settings,
    exerciseProgress,
    workouts
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().split('T')[0];
  a.download = `stronglifts5x5-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importDatabaseFromJSON(file: File): Promise<{ success: boolean; message: string; count?: number }> {
  try {
    const text = await file.text();
    const data: BackupData = JSON.parse(text);

    if (!data.workouts || !Array.isArray(data.workouts)) {
      throw new Error('Invalid backup file format: Missing workout history.');
    }

    await db.workouts.clear();
    await db.exerciseProgress.clear();

    if (data.workouts.length > 0) {
      await db.workouts.bulkAdd(data.workouts);
    }

    if (data.exerciseProgress && data.exerciseProgress.length > 0) {
      await db.exerciseProgress.bulkPut(data.exerciseProgress);
    }

    if (data.settings) {
      await db.settings.put({ key: 'userSettings', value: data.settings });
    }

    return {
      success: true,
      message: `Successfully restored ${data.workouts.length} workouts and user progression.`,
      count: data.workouts.length
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Failed to import JSON file. Please check the file structure.'
    };
  }
}
