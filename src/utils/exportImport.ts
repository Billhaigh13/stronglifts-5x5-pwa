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

export async function getBackupData(): Promise<BackupData> {
  const settings = await getUserSettings();
  const exerciseProgress = await db.exerciseProgress.toArray();
  const workouts = await db.workouts.toArray();

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    app: 'StrongLifts 5x5 Tracker',
    settings,
    exerciseProgress,
    workouts,
  };
}

export async function getBackupJSONString(): Promise<string> {
  const data = await getBackupData();
  return JSON.stringify(data, null, 2);
}

export async function exportDatabaseToJSON(): Promise<{ method: 'share' | 'download' | 'clipboard' | 'modal'; success: boolean }> {
  const backupData = await getBackupData();
  const jsonString = JSON.stringify(backupData, null, 2);
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `stronglifts5x5-backup-${dateStr}.json`;
  const blob = new Blob([jsonString], { type: 'application/json' });

  // 1. Try Web Share API with File (Native Android share sheet - Save to Drive/Files/Email)
  try {
    const file = new File([blob], filename, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: 'StrongLifts 5x5 Backup',
        text: `StrongLifts 5x5 workout history and progression backup (${backupData.workouts.length} workouts).`,
        files: [file],
      });
      return { method: 'share', success: true };
    }
  } catch (e: any) {
    if (e.name === 'AbortError') {
      // User cancelled share dialog
      return { method: 'share', success: false };
    }
    console.warn('Navigator share file not available, falling back to data URL download', e);
  }

  // 2. Fallback to data: URL download (works reliably across browsers)
  try {
    const encodedData = encodeURIComponent(jsonString);
    const dataUri = `data:application/json;charset=utf-8,${encodedData}`;
    const a = document.createElement('a');
    a.href = dataUri;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return { method: 'download', success: true };
  } catch (e) {
    console.warn('Data URI download failed', e);
  }

  // 3. Fallback: Copy to Clipboard
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(jsonString);
      return { method: 'clipboard', success: true };
    }
  } catch (e) {
    console.warn('Clipboard write failed', e);
  }

  return { method: 'modal', success: true };
}

export async function importDatabaseFromJSON(jsonInput: string | File): Promise<{ success: boolean; message: string; count?: number }> {
  try {
    let text: string;
    if (typeof jsonInput === 'string') {
      text = jsonInput.trim();
    } else {
      text = await jsonInput.text();
    }

    if (!text) {
      throw new Error('Empty backup data provided.');
    }

    const data: BackupData = JSON.parse(text);

    if (!data.workouts || !Array.isArray(data.workouts)) {
      throw new Error('Invalid backup file format: Missing workout history array.');
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
      message: `Successfully restored ${data.workouts.length} workouts and progression data.`,
      count: data.workouts.length,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Failed to import JSON data. Please verify the JSON format.',
    };
  }
}
