import { useEffect, useState } from 'react';
import { Sparkles, Download, X, ChevronRight, Dumbbell } from 'lucide-react';
import type { ExerciseId, ExerciseProgressState, MobilityRoutine, UserSettings, WorkoutSession } from './types';
import { DEFAULT_USER_SETTINGS } from './utils/constants';
import {
  getAllExerciseProgress,
  getLastWorkout,
  getRecentWorkouts,
  getUserSettings,
  initializeDatabase,
  saveUserSettings,
  saveWorkout,
} from './db';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { ActiveWorkout, type WorkoutLiveState } from './components/ActiveWorkout';
import { HistoryScreen } from './components/HistoryScreen';
import { AnalyticsScreen } from './components/AnalyticsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { MobilityScreen } from './components/MobilityScreen';
import { MobilityPlayerModal } from './components/MobilityPlayerModal';
import { UpdateModal } from './components/UpdateModal';
import { checkForAppUpdates, type ReleaseInfo } from './utils/version';

export function App() {
  const [activeTab, setActiveTab] = useState<'workout' | 'mobility' | 'history' | 'analytics' | 'settings'>('workout');
  const [isInitialized, setIsInitialized] = useState(false);
  const [userSettings, setUserSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);
  const [exerciseProgress, setExerciseProgress] = useState<Record<ExerciseId, ExerciseProgressState>>(
    {} as Record<ExerciseId, ExerciseProgressState>
  );
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [lastWorkout, setLastWorkout] = useState<WorkoutSession | undefined>(undefined);

  // Live Workout State synchronization
  const [workoutState, setWorkoutState] = useState<WorkoutLiveState>({
    isActive: false,
    duration: 0,
    type: 'A',
  });

  // Mobility Flow state
  const [activeMobilityRoutine, setActiveMobilityRoutine] = useState<MobilityRoutine | null>(null);
  const [isMobilityPlayerOpen, setIsMobilityPlayerOpen] = useState(false);

  // Background update check
  const [availableRelease, setAvailableRelease] = useState<ReleaseInfo | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  const handleStartMobility = (routine: MobilityRoutine) => {
    setActiveMobilityRoutine(routine);
    setIsMobilityPlayerOpen(true);
  };

  const handleSaveMobilitySession = async (routine: MobilityRoutine, durationSeconds: number) => {
    const session: WorkoutSession = {
      type: 'A',
      sessionCategory: 'mobility',
      programName: routine.name,
      date: new Date().toISOString(),
      startTime: Date.now() - durationSeconds * 1000,
      endTime: Date.now(),
      durationSeconds,
      completed: true,
      exerciseLogs: [],
      notes: `Completed guided ${routine.name} active recovery flow (${Math.round(durationSeconds / 60)}m).`,
    };
    await saveWorkout(session);
    await loadData();
    setActiveTab('history');
  };

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

    getUserSettings().then((settings) => {
      checkForAppUpdates(settings.githubToken).then((result) => {
        if (result.success && result.release && result.release.hasUpdate) {
          setAvailableRelease(result.release);
        }
      });
    });
  }, []);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

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
        isWorkoutActive={workoutState.isActive}
        workoutDuration={workoutState.duration}
        workoutType={workoutState.type}
        onNavigateToWorkout={() => setActiveTab('workout')}
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
        {/* Keep ActiveWorkout mounted in DOM to prevent timer drops or state loss when switching tabs */}
        <div className={activeTab === 'workout' ? 'block' : 'hidden'}>
          <ActiveWorkout
            userSettings={userSettings}
            exerciseProgress={exerciseProgress}
            lastWorkout={lastWorkout}
            workouts={workouts}
            onWorkoutStateChange={setWorkoutState}
            onStartMobilityRoutine={handleStartMobility}
            onSelectProgram={async (programId) => {
              const updated = { ...userSettings, activeProgramId: programId };
              setUserSettings(updated);
              await saveUserSettings(updated);
            }}
            onUpdateUserSettings={async (newSettings) => {
              setUserSettings(newSettings);
              await saveUserSettings(newSettings);
            }}
            onWorkoutSaved={() => {
              loadData();
              setActiveTab('history');
            }}
          />
        </div>

        {activeTab === 'mobility' && (
          <MobilityScreen
            onStartRoutine={handleStartMobility}
          />
        )}

        {activeTab === 'history' && (
          <HistoryScreen
            workouts={workouts}
            unit={userSettings.unit}
            schedulePreference={userSettings.schedulePreference}
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

      {/* Floating "Resume Workout in Progress" banner when browsing other tabs */}
      {workoutState.isActive && activeTab !== 'workout' && (
        <div className="fixed bottom-20 left-0 right-0 z-30 px-4 pointer-events-none animate-fadeIn">
          <div className="max-w-md mx-auto pointer-events-auto">
            <button
              type="button"
              onClick={() => setActiveTab('workout')}
              className="w-full bg-gym-card/95 backdrop-blur-md border-2 border-gym-accent/80 p-3 rounded-2xl shadow-glow-emerald flex items-center justify-between tap-active text-left transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gym-accent/20 border border-gym-accent/40 flex items-center justify-center text-gym-accent shadow-glow-emerald/30 shrink-0">
                  <Dumbbell className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase text-gym-text flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gym-accent opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-gym-accent"></span>
                    </span>
                    Workout {workoutState.type} in Progress
                  </div>
                  <div className="text-[11px] font-mono text-gym-accent font-bold mt-0.5">
                    Elapsed: {formatTimer(workoutState.duration)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-gym-accent text-gym-bg font-extrabold text-xs uppercase px-3.5 py-2 rounded-xl shadow-sm shrink-0">
                <span>Resume</span>
                <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </button>
          </div>
        </div>
      )}

      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isWorkoutActive={workoutState.isActive}
      />

      <MobilityPlayerModal
        routine={activeMobilityRoutine}
        isOpen={isMobilityPlayerOpen}
        onClose={() => setIsMobilityPlayerOpen(false)}
        onComplete={handleSaveMobilitySession}
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
