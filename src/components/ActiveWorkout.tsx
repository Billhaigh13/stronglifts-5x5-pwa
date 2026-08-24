import React, { useState, useEffect, useRef } from 'react';
import { Play, CheckCircle2, Award, ChevronRight } from 'lucide-react';
import type { ExerciseId, ExerciseLog, ExerciseProgressState, ProgramId, ProgressionResult, UserSettings, WarmupSet, WorkoutSession, WorkoutType } from '../types';
import { DEFAULT_PROGRESSION_CONFIGS, EXERCISE_DEFINITIONS, PROGRAM_DEFINITIONS } from '../utils/constants';
import { calculateWarmupSets } from '../utils/warmup';
import { calculateNextProgression } from '../utils/progression';
import { ExerciseCard } from './ExerciseCard';
import { RestTimer } from './RestTimer';
import { WorkoutSummaryModal } from './WorkoutSummaryModal';
import { ProgramSelectorModal } from './ProgramSelectorModal';
import { ProgressionSettingsModal } from './ProgressionSettingsModal';
import { ExerciseGuideModal } from './ExerciseGuideModal';
import { WeeklyScheduleStrip } from './WeeklyScheduleStrip';
import { ScheduleSettingsModal } from './ScheduleSettingsModal';
import { saveWorkout, updateExerciseProgress } from '../db';
import { triggerHaptic } from '../utils/haptics';

export interface WorkoutLiveState {
  isActive: boolean;
  duration: number;
  type: WorkoutType;
}

interface ActiveWorkoutProps {
  userSettings: UserSettings;
  exerciseProgress: Record<ExerciseId, ExerciseProgressState>;
  onWorkoutSaved: () => void;
  onSelectProgram: (programId: ProgramId) => void;
  onWorkoutStateChange?: (state: WorkoutLiveState) => void;
  onUpdateUserSettings?: (settings: UserSettings) => Promise<void>;
  lastWorkout?: WorkoutSession;
  workouts?: WorkoutSession[];
}

export const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({
  userSettings,
  exerciseProgress,
  onWorkoutSaved,
  onSelectProgram,
  onWorkoutStateChange,
  onUpdateUserSettings,
  lastWorkout,
  workouts = [],
}) => {
  const activeProgram = PROGRAM_DEFINITIONS[userSettings.activeProgramId || 'bill_lifts'] || PROGRAM_DEFINITIONS.bill_lifts;

  const suggestedWorkout: WorkoutType = lastWorkout ? (lastWorkout.type === 'A' ? 'B' : 'A') : 'A';
  const [selectedType, setSelectedType] = useState<WorkoutType>(suggestedWorkout);

  const [isActive, setIsActive] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [warmupSetsMap, setWarmupSetsMap] = useState<Record<string, WarmupSet[]>>({});

  const [isRestTimerActive, setIsRestTimerActive] = useState<boolean>(false);
  const [restTimerSeconds, setRestTimerSeconds] = useState<number>(90);

  const [isSummaryOpen, setIsSummaryOpen] = useState<boolean>(false);
  const [isProgramModalOpen, setIsProgramModalOpen] = useState<boolean>(false);
  const [isProgressionModalOpen, setIsProgressionModalOpen] = useState<boolean>(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);
  const [guideExerciseId, setGuideExerciseId] = useState<ExerciseId | null>(null);
  const [activeProgressionExId, setActiveProgressionExId] = useState<ExerciseId>('squat');
  const [progressionResults, setProgressionResults] = useState<Record<string, ProgressionResult>>({});

  const timerIntervalRef = useRef<any>(null);

  // Auto-restore active workout draft if app was closed or interrupted
  useEffect(() => {
    try {
      const saved = localStorage.getItem('stronglifts_active_draft');
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft && draft.isActive && Array.isArray(draft.exerciseLogs) && draft.exerciseLogs.length > 0) {
          const draftType: WorkoutType = draft.selectedType || 'A';
          const draftStart: number = draft.startTime || Date.now();
          const currentElapsed = Math.floor((Date.now() - draftStart) / 1000);

          setSelectedType(draftType);
          setStartTime(draftStart);
          setExerciseLogs(draft.exerciseLogs);
          setWarmupSetsMap(draft.warmupSetsMap || {});
          setIsActive(true);
          setElapsedSeconds(currentElapsed);

          onWorkoutStateChange?.({
            isActive: true,
            duration: currentElapsed,
            type: draftType,
          });
        }
      }
    } catch (e) {
      console.warn('Failed to parse active workout draft', e);
    }
  }, []);

  // Auto-persist active workout draft on every set or weight change
  useEffect(() => {
    if (isActive && exerciseLogs.length > 0) {
      localStorage.setItem(
        'stronglifts_active_draft',
        JSON.stringify({
          selectedType,
          startTime,
          exerciseLogs,
          warmupSetsMap,
          isActive: true,
        })
      );
    }
  }, [isActive, selectedType, startTime, exerciseLogs, warmupSetsMap]);

  // Timer loop & state sync
  useEffect(() => {
    if (isActive) {
      timerIntervalRef.current = setInterval(() => {
        const duration = Math.floor((Date.now() - startTime) / 1000);
        setElapsedSeconds(duration);
        onWorkoutStateChange?.({
          isActive: true,
          duration,
          type: selectedType,
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      onWorkoutStateChange?.({
        isActive: false,
        duration: 0,
        type: selectedType,
      });
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isActive, startTime, selectedType, onWorkoutStateChange]);

  const resetWorkoutState = () => {
    localStorage.removeItem('stronglifts_active_draft');
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setIsActive(false);
    setIsRestTimerActive(false);
    setIsSummaryOpen(false);
    setExerciseLogs([]);
    setWarmupSetsMap({});
    setStartTime(0);
    setElapsedSeconds(0);
    setProgressionResults({});
    onWorkoutStateChange?.({
      isActive: false,
      duration: 0,
      type: selectedType,
    });
  };

  const handleStartWorkout = (type: WorkoutType) => {
    setSelectedType(type);
    const routine = activeProgram.routines[type];
    const initialLogs: ExerciseLog[] = routine.exerciseIds.map((exId) => {
      const def = EXERCISE_DEFINITIONS[exId] || {
        id: exId,
        name: exId,
        category: 'barbell_compound',
        defaultSets: 5,
        defaultTargetReps: 5,
        increment: 2.5,
        defaultWeight: 20,
      };
      const prog = exerciseProgress[exId];
      const weight = prog ? prog.currentWeight : def.defaultWeight;
      const targetRepsCount = def.defaultSets;

      let targetReps: number[];
      if (exId === 'bicep_curl') {
        const targetPerSet = prog?.targetRepsPerSet || 8;
        targetReps = Array(targetRepsCount).fill(targetPerSet);
      } else if (exId === 'pullups') {
        targetReps = Array(targetRepsCount).fill(10);
      } else if (exId === 'dips') {
        targetReps = Array(targetRepsCount).fill(10);
      } else if (exId === 'skullcrushers' || exId === 'incline_bench' || exId === 'barbell_curl') {
        targetReps = Array(targetRepsCount).fill(8);
      } else if (exId === 'plank') {
        targetReps = Array(targetRepsCount).fill(60);
      } else {
        targetReps = Array(targetRepsCount).fill(5);
      }

      return {
        exerciseId: exId,
        exerciseName: def.name,
        targetWeight: weight,
        targetReps,
        completedReps: Array(targetRepsCount).fill(null),
        completed: false,
        mode: (exId === 'pullups' || exId === 'dips') ? (prog?.mode || 'bodyweight') : undefined,
      };
    });

    const initialWarmups: Record<string, WarmupSet[]> = {};
    routine.exerciseIds.forEach((exId) => {
      const def = EXERCISE_DEFINITIONS[exId];
      if (def && def.category === 'barbell_compound') {
        const prog = exerciseProgress[exId];
        const weight = prog ? prog.currentWeight : def.defaultWeight;
        initialWarmups[exId] = calculateWarmupSets(exId, weight, userSettings.barWeight);
      }
    });

    const now = Date.now();
    setExerciseLogs(initialLogs);
    setWarmupSetsMap(initialWarmups);
    setStartTime(now);
    setElapsedSeconds(0);
    setIsActive(true);
    triggerHaptic('heavy');

    onWorkoutStateChange?.({
      isActive: true,
      duration: 0,
      type,
    });
  };

  const handleCycleSetReps = (exerciseId: ExerciseId, setIndex: number) => {
    setExerciseLogs((prev) =>
      prev.map((log) => {
        if (log.exerciseId !== exerciseId) return log;

        const targetRep = log.targetReps[setIndex] ?? 5;
        const currentRep = log.completedReps[setIndex];
        let nextRep: number | null;

        if (currentRep === null) {
          nextRep = targetRep;
        } else if (currentRep === targetRep) {
          nextRep = Math.max(0, targetRep - 1);
        } else if (currentRep > 0) {
          nextRep = currentRep - 1;
        } else {
          nextRep = null;
        }

        const nextCompleted = [...log.completedReps];
        nextCompleted[setIndex] = nextRep;

        if (nextRep !== null && userSettings.autoStartRestTimer) {
          const isSuccess = nextRep >= targetRep;
          const restSeconds = isSuccess
            ? userSettings.defaultRestSecondsSuccess
            : userSettings.defaultRestSecondsFailure;

          setRestTimerSeconds(restSeconds);
          setIsRestTimerActive(true);
        }

        return {
          ...log,
          completedReps: nextCompleted,
        };
      })
    );
  };

  const handleUpdateWeight = (exerciseId: ExerciseId, newWeight: number) => {
    setExerciseLogs((prev) =>
      prev.map((log) => {
        if (log.exerciseId !== exerciseId) return log;
        return { ...log, targetWeight: newWeight };
      })
    );

    const def = EXERCISE_DEFINITIONS[exerciseId];
    if (def && def.category === 'barbell_compound') {
      setWarmupSetsMap((prev) => ({
        ...prev,
        [exerciseId]: calculateWarmupSets(exerciseId, newWeight, userSettings.barWeight),
      }));
    }
  };

  const handleTogglePullupMode = (exerciseId: ExerciseId, mode: 'bodyweight' | 'weighted') => {
    setExerciseLogs((prev) =>
      prev.map((log) => {
        if (log.exerciseId !== exerciseId) return log;
        const targetReps = mode === 'weighted' ? [5, 5, 5] : [10, 10, 10];
        return {
          ...log,
          mode,
          targetReps,
          targetWeight: mode === 'weighted' ? (log.targetWeight || 2.5) : 0,
          completedReps: Array(targetReps.length).fill(null),
        };
      })
    );
  };

  const handleToggleWarmupSet = (exerciseId: ExerciseId, setIndex: number) => {
    setWarmupSetsMap((prev) => {
      const sets = prev[exerciseId] ? [...prev[exerciseId]] : [];
      if (sets[setIndex]) {
        sets[setIndex] = { ...sets[setIndex], completed: !sets[setIndex].completed };
      }
      return { ...prev, [exerciseId]: sets };
    });
  };

  const handleFinishWorkout = () => {
    const results: Record<string, ProgressionResult> = {};

    exerciseLogs.forEach((log) => {
      const prog = exerciseProgress[log.exerciseId] || {
        exerciseId: log.exerciseId,
        currentWeight: log.targetWeight,
        consecutiveFailures: 0,
        allTimePRWeight: 0,
        allTimePRReps: 0,
      };

      const result = calculateNextProgression(
        log.exerciseId,
        log,
        prog,
        userSettings.dumbbellInventory,
        userSettings.progressionConfigs
      );
      results[log.exerciseId] = result;
    });

    setProgressionResults(results);
    setIsSummaryOpen(true);
  };

  const handleSaveWorkoutToDB = async (notes: string) => {
    const session: WorkoutSession = {
      type: selectedType,
      programId: activeProgram.id,
      programName: activeProgram.name,
      date: new Date().toISOString(),
      startTime,
      endTime: Date.now(),
      durationSeconds: elapsedSeconds,
      completed: true,
      notes,
      exerciseLogs: exerciseLogs.map((l) => ({
        ...l,
        completed: true,
      })),
    };

    await saveWorkout(session);

    for (const log of exerciseLogs) {
      const prog = progressionResults[log.exerciseId];
      const current = exerciseProgress[log.exerciseId] || {
        exerciseId: log.exerciseId,
        currentWeight: log.targetWeight,
        consecutiveFailures: 0,
        allTimePRWeight: 0,
        allTimePRReps: 0,
      };

      if (prog) {
        const maxRep = Math.max(...log.completedReps.map((r) => r || 0));

        await updateExerciseProgress({
          ...current,
          currentWeight: prog.nextWeight,
          consecutiveFailures: prog.consecutiveFailures,
          targetRepsPerSet: prog.nextTargetReps || current.targetRepsPerSet,
          mode: log.mode,
          allTimePRWeight: Math.max(current.allTimePRWeight, log.targetWeight),
          allTimePRReps: Math.max(current.allTimePRReps, maxRep),
          lastCompletedDate: new Date().toISOString(),
        });
      }
    }

    resetWorkoutState();
    onWorkoutSaved();
  };

  const handleCancelWorkout = () => {
    if (confirm('Cancel active workout? Unsaved sets will be lost.')) {
      triggerHaptic('medium');
      resetWorkoutState();
    }
  };

  const totalTargetSets = exerciseLogs.reduce((acc, l) => acc + l.targetReps.length, 0);
  const totalCompletedSets = exerciseLogs.reduce(
    (acc, l) => acc + l.completedReps.filter((r) => r !== null).length,
    0
  );

  return (
    <div className="pb-28 max-w-md mx-auto px-4 pt-3">
      {!isActive ? (
        <div className="space-y-4 animate-fadeIn">
          {/* Weekly Schedule Strip */}
          <WeeklyScheduleStrip
            schedulePreference={userSettings.schedulePreference}
            workouts={workouts}
            lastWorkout={lastWorkout}
            onOpenScheduleSettings={() => setIsScheduleModalOpen(true)}
          />

          {/* Active Program Header Card */}
          <div
            onClick={() => setIsProgramModalOpen(true)}
            className="bg-gym-card hover:bg-gym-cardHover rounded-2xl border border-gym-border/80 p-3.5 shadow-md flex items-center justify-between cursor-pointer tap-active transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gym-accent/15 border border-gym-accent/30 flex items-center justify-center text-gym-accent shadow-glow-emerald/20 shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-gym-text">
                    {activeProgram.name}
                  </span>
                  {activeProgram.badge && (
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-gym-accent/20 text-gym-accent border border-gym-accent/30">
                      {activeProgram.badge}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-gym-dimmed truncate max-w-[240px]">
                  {activeProgram.tagline}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-bold text-gym-cyan shrink-0">
              <span>Change</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="bg-gym-card rounded-3xl border border-gym-border/80 p-5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase font-bold text-gym-accent tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gym-accent animate-pulse" />
                Recommended Next Session
              </span>
              {lastWorkout && (
                <span className="text-[11px] text-gym-muted font-medium">
                  Last: Workout {lastWorkout.type}
                </span>
              )}
            </div>

            <h2 className="text-2xl font-black text-gym-text tracking-tight mb-1">
              Ready for Workout {selectedType}?
            </h2>
            <p className="text-xs text-gym-muted leading-relaxed mb-5">
              {activeProgram.name} · 3-day weekly cadence with automated progression.
            </p>

            <div className="grid grid-cols-2 gap-2 bg-gym-surface/80 p-1.5 rounded-2xl border border-gym-border/60 mb-5">
              <button
                type="button"
                onClick={() => setSelectedType('A')}
                className={`py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                  selectedType === 'A'
                    ? 'bg-gym-accent text-gym-bg shadow-glow-emerald font-extrabold'
                    : 'text-gym-muted hover:text-gym-text'
                }`}
              >
                Workout A
              </button>
              <button
                type="button"
                onClick={() => setSelectedType('B')}
                className={`py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                  selectedType === 'B'
                    ? 'bg-gym-accent text-gym-bg shadow-glow-emerald font-extrabold'
                    : 'text-gym-muted hover:text-gym-text'
                }`}
              >
                Workout B
              </button>
            </div>

            <div className="space-y-2 mb-6">
              <div className="text-[11px] font-bold text-gym-muted uppercase tracking-wider">
                Scheduled Routine ({activeProgram.routines[selectedType]?.exerciseIds.length || 0} Exercises):
              </div>
              {(activeProgram.routines[selectedType]?.exerciseIds || []).map((exId, idx) => {
                const def = EXERCISE_DEFINITIONS[exId] || {
                  id: exId,
                  name: exId,
                  category: 'barbell_compound',
                  defaultSets: 5,
                  defaultTargetReps: 5,
                  increment: 2.5,
                  defaultWeight: 20,
                };
                const prog = exerciseProgress[exId];
                const weight = prog ? prog.currentWeight : def.defaultWeight;

                return (
                  <div
                    key={exId}
                    className="flex items-center justify-between bg-gym-bg/80 px-3.5 py-2.5 rounded-xl border border-gym-border/40"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-lg bg-gym-surface text-gym-muted text-xs font-mono font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-gym-text">
                        {def.name}
                      </span>
                    </div>
                    <div className="text-xs font-mono font-black text-gym-cyan">
                      {(exId === 'pullups' || exId === 'dips') && (!prog?.mode || prog.mode === 'bodyweight')
                        ? '3×AMRAP'
                        : exId === 'plank'
                        ? '3×60s'
                        : `${weight} ${userSettings.unit}`}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => handleStartWorkout(selectedType)}
              className="w-full py-4 bg-gym-accent hover:bg-emerald-500 text-gym-bg font-black text-base uppercase tracking-wider rounded-2xl shadow-glow-emerald transition-all duration-150 flex items-center justify-center gap-2 tap-active"
            >
              <Play className="w-5 h-5 fill-current stroke-[2.5]" />
              Start Workout {selectedType}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between bg-gym-card/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-gym-border shadow-md">
            <div>
              <div className="text-xs font-black uppercase text-gym-text flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gym-accent animate-pulse" />
                {activeProgram.name} · Workout {selectedType}
              </div>
              <div className="text-[11px] font-mono text-gym-muted mt-0.5">
                {totalCompletedSets} of {totalTargetSets} sets checked
              </div>
            </div>
            <button
              type="button"
              onClick={handleCancelWorkout}
              className="px-2.5 py-1.5 rounded-xl bg-gym-surface text-gym-dimmed hover:text-gym-danger text-[11px] font-bold border border-gym-border/60 tap-active"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-3.5">
            {exerciseLogs.map((log) => (
              <ExerciseCard
                key={log.exerciseId}
                exerciseLog={log}
                progressState={exerciseProgress[log.exerciseId]}
                progressionConfig={userSettings.progressionConfigs?.[log.exerciseId] || DEFAULT_PROGRESSION_CONFIGS[log.exerciseId]}
                warmupSets={warmupSetsMap[log.exerciseId] || []}
                unit={userSettings.unit}
                barWeight={userSettings.barWeight}
                plateInventory={userSettings.plateInventory}
                dumbbellInventory={userSettings.dumbbellInventory}
                onCycleSetReps={handleCycleSetReps}
                onUpdateWeight={handleUpdateWeight}
                onTogglePullupMode={handleTogglePullupMode}
                onToggleWarmupSet={handleToggleWarmupSet}
                onOpenProgressionModal={(exId) => {
                  setActiveProgressionExId(exId);
                  setIsProgressionModalOpen(true);
                }}
                onOpenGuideModal={(exId) => {
                  setGuideExerciseId(exId);
                }}
              />
            ))}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleFinishWorkout}
              className="w-full py-4 bg-gym-accent hover:bg-emerald-500 text-gym-bg font-black text-base uppercase tracking-wider rounded-2xl shadow-glow-emerald transition-all duration-150 flex items-center justify-center gap-2 tap-active"
            >
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              Finish Workout ({totalCompletedSets}/{totalTargetSets})
            </button>
          </div>
        </div>
      )}

      <RestTimer
        isActive={isRestTimerActive}
        initialSeconds={restTimerSeconds}
        soundEnabled={userSettings.soundEnabled}
        vibrationEnabled={userSettings.vibrationEnabled}
        onClose={() => setIsRestTimerActive(false)}
      />

      <WorkoutSummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        workoutType={selectedType}
        durationSeconds={elapsedSeconds}
        exerciseLogs={exerciseLogs}
        progressionResults={progressionResults}
        unit={userSettings.unit}
        onSave={handleSaveWorkoutToDB}
      />

      <ProgramSelectorModal
        isOpen={isProgramModalOpen}
        onClose={() => setIsProgramModalOpen(false)}
        activeProgramId={userSettings.activeProgramId || 'bill_lifts'}
        onSelectProgram={onSelectProgram}
      />

      <ProgressionSettingsModal
        isOpen={isProgressionModalOpen}
        onClose={() => setIsProgressionModalOpen(false)}
        progressionConfigs={userSettings.progressionConfigs}
        dumbbellInventory={userSettings.dumbbellInventory}
        unit={userSettings.unit}
        initialExerciseId={activeProgressionExId}
        onSaveConfigs={async (newConfigs) => {
          if (onUpdateUserSettings) {
            await onUpdateUserSettings({ ...userSettings, progressionConfigs: newConfigs });
          }
        }}
      />

      <ExerciseGuideModal
        exerciseId={guideExerciseId}
        onClose={() => setGuideExerciseId(null)}
      />

      <ScheduleSettingsModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        schedulePreference={userSettings.schedulePreference}
        onSavePreference={async (newPref) => {
          if (onUpdateUserSettings) {
            await onUpdateUserSettings({ ...userSettings, schedulePreference: newPref });
          }
        }}
      />
    </div>
  );
};
