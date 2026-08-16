import { useEffect, useState } from 'react';
import { Sparkles, Download, X } from 'lucide-react';
import type { ExerciseId, ExerciseProgressState, UserSettings, WorkoutSession } from './types';
import { DEFAULT_USER_SETTINGS } from './utils/constants';
import {
  getAllExerciseProgress,
  getLastWorkout,
  getRecentWorkouts,
  getUserSettings,
  initializeDatabase,
} from './db';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { ActiveWorkout } from './components/ActiveWorkout';
import { HistoryScreen } from './components/HistoryScreen';
import { AnalyticsScreen } from './components/AnalyticsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { UpdateModal } from './components/UpdateModal';
import { checkForAppUpdates, type ReleaseInfo } from './utils/version';

export function App() {
  const [activeTab, setActiveTab] = useState<'workout' | 'history' | 'analytics' | 'settings'>('workout');
  const [isInitialized, setIsInitialized] = useState(false);
  const [userSettings, setUserSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);
  const [exerciseProgress, setExerciseProgress] = useState<Record<ExerciseId, ExerciseProgressState>>(
    {} as Record<ExerciseId, ExerciseProgressState>
  );
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [lastWorkout, setLastWorkout] = useState<WorkoutSession | undefined>(undefined);

  // Background update check
  const [availableRelease, setAvailableRelease] = useState<ReleaseInfo | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  const loadData = async () => {
    try {
      await initializeDatabase();
      const settings = await getUserSettings();
      const progress = await getAllExerciseProgress();
      const historyList = await getRecentWorkouts(100);
      const latest = await getLastWorkout();

      setUserSettings(settings);
      setExerciseProgress(progress);
      setWorkouts(historyList);
      setLastWorkout(latest);
      setIsInitialized(true);
    } catch (err) {
      console.error('Failed to load local DB', err);
      setIsInitialized(true);
    }
  };

  useEffect(() => {
    loadData();

    // Silently check for app update in background
    checkForAppUpdates().then((release) => {
      if (release && release.hasUpdate) {
        setAvailableRelease(release);
      }
    });
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gym-bg flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gym-accent/20 border-2 border-gym-accent flex items-center justify-center text-gym-accent animate-bounce">
          <svg className="w-6 h-6 stroke-current stroke-[2.5]" viewBox="0 0 24 24" fill="none">
            <path d="M6 5v14M18 5v14M2 9h4M2 15h4M18 9h4M18 15h4M6 12h12" />
          </svg>
        </div>
        <div className="text-sm font-bold text-gym-text mt-3 tracking-wide">
          Loading StrongLifts 5×5...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gym-bg text-gym-text flex flex-col justify-between selection:bg-gym-accent selection:text-gym-bg">
      <Header
        activeTab={activeTab}
        isWorkoutActive={false}
        workoutDuration={0}
      />

      {/* New Version Floating Alert Banner */}
      {availableRelease && !isBannerDismissed && (
        <div className="bg-gym-card border-b border-gym-accent/40 px-4 py-2.5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 text-xs">
            <Sparkles className="w-4 h-4 text-gym-accent animate-spin" />
            <span className="font-bold text-gym-text">
              Update Available: <span className="text-gym-accent">{availableRelease.tagName}</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsUpdateModalOpen(true)}
              className="py-1 px-2.5 bg-gym-accent text-gym-bg font-extrabold text-[11px] uppercase tracking-wider rounded-lg shadow-sm tap-active flex items-center gap-1"
            >
              <Download className="w-3 h-3 stroke-[3]" />
              Update
            </button>
            <button
              onClick={() => setIsBannerDismissed(true)}
              className="p-1 rounded-lg text-gym-muted hover:text-gym-text"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 w-full">
        {activeTab === 'workout' && (
          <ActiveWorkout
            userSettings={userSettings}
            exerciseProgress={exerciseProgress}
            lastWorkout={lastWorkout}
            onWorkoutSaved={() => {
              loadData();
              setActiveTab('history');
            }}
          />
        )}

        {activeTab === 'history' && (
          <HistoryScreen
            workouts={workouts}
            unit={userSettings.unit}
            onRefresh={loadData}
            onStartWorkout={() => setActiveTab('workout')}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsScreen
            workouts={workouts}
            exerciseProgress={exerciseProgress}
            unit={userSettings.unit}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsScreen
            userSettings={userSettings}
            exerciseProgress={exerciseProgress}
            onSettingsUpdated={loadData}
          />
        )}
      </main>

      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isWorkoutActive={false}
      />

      <UpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        releaseInfo={availableRelease}
      />
    </div>
  );
}

export default App;
