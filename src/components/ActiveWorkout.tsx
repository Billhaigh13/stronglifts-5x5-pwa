import React, { useState, useEffect, useRef } from 'react';
import { Play, CheckCircle2 } from 'lucide-react';
import type { ExerciseId, ExerciseLog, ExerciseProgressState, ProgressionResult, UserSettings, WarmupSet, WorkoutSession, WorkoutType } from '../types';
import { EXERCISE_DEFINITIONS, WORKOUT_ROUTINES } from '../utils/constants';
import { calculateWarmupSets } from '../utils/warmup';
import { calculateNextProgression } from '../utils/progression';
import { ExerciseCard } from './ExerciseCard';
import { RestTimer } from './RestTimer';
import { WorkoutSummaryModal } from './WorkoutSummaryModal';
import { saveWorkout, updateExerciseProgress } from '../db';
import { triggerHaptic } from '../utils/haptics';

interface ActiveWorkoutProps {
  userSettings: UserSettings;
  exerciseProgress: Record<ExerciseId, ExerciseProgressState>;
  onWorkoutSaved: () => void;
  lastWorkout?: WorkoutSession;
}

export const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({
  userSettings,
  exerciseProgress,
  onWorkoutSaved,
  lastWorkout,
}) => {
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
  const [progressionResults, setProgressionResults] = useState<Record<string, ProgressionResult>>({});

  const timerIntervalRef = useRef<any>(null);

  // Auto-restore active workout draft if app was closed or interrupted
  useEffect(() => {
    try {
      const saved = localStorage.getItem('stronglifts_active_draft');
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft && draft.isActive && Array.isArray(draft.exerciseLogs) && draft.exerciseLogs.length > 0) {
          setSelectedType(draft.selectedType || 'A');
          setStartTime(draft.startTime || Date.now());
          setExerciseLogs(draft.exerciseLogs);
          setWarmupSetsMap(draft.warmupSetsMap || {});
          setIsActive(true);
          setElapsedSeconds(Math.floor((Date.now() - (draft.startTime || Date.now())) / 1000));
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

  useEffect(() => {
    if (isActive) {
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isActive, startTime]);

  const handleStartWorkout = (type: WorkoutType) => {
    setSelectedType(type);
    const routine = WORKOUT_ROUTINES[type];
    const initialLogs: ExerciseLog[] = routine.exerciseIds.map((exId) => {
      const def = EXERCISE_DEFINITIONS[exId];
      const prog = exerciseProgress[exId];
      const weight = prog ? prog.currentWeight : def.defaultWeight;
      const targetRepsCount = def.defaultSets;

      let targetReps: number[];
      if (exId === 'bicep_curl') {
        const targetPerSet = prog?.targetRepsPerSet || 8;
        targetReps = Array(targetRepsCount).fill(targetPerSet);
      } else if (exId === 'pullups') {
        targetReps = Array(targetRepsCount).fill(10);
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
        mode: exId === 'pullups' ? (prog?.mode || 'bodyweight') : undefined,
      };
    });

    const initialWarmups: Record<string, WarmupSet[]> = {};
    routine.exerciseIds.forEach((exId) => {
      const def = EXERCISE_DEFINITIONS[exId];
      if (def.category === 'barbell_compound') {
        const prog = exerciseProgress[exId];
        const weight = prog ? prog.currentWeight : def.defaultWeight;
        initialWarmups[exId] = calculateWarmupSets(exId, weight, userSettings.barWeight);
      }
    });

    setExerciseLogs(initialLogs);
    setWarmupSetsMap(initialWarmups);
    setStartTime(Date.now());
    setElapsedSeconds(0);
    setIsActive(true);
    triggerHaptic('medium');
  };

  const handleCycleSetReps = (exerciseId: ExerciseId, setIndex: number) => {
    setExerciseLogs((prev) =>
      prev.map((log) => {
        if (log.exerciseId !== exerciseId) return log;

        const targetRep = log.targetReps[setIndex];
        const currentVal = log.completedReps[setIndex];
        let nextVal: number | null;

        if (currentVal === null) {
          nextVal = targetRep;
        } else if (currentVal > 0) {
          nextVal = currentVal - 1;
        } else {
          nextVal = null;
        }

        const newCompleted = [...log.completedReps];
        newCompleted[setIndex] = nextVal;

        if (userSettings.autoStartRestTimer && nextVal !== null) {
          if (nextVal >= targetRep) {
            setRestTimerSeconds(userSettings.defaultRestSecondsSuccess || 90);
          } else {
            setRestTimerSeconds(userSettings.defaultRestSecondsFailure || 180);
          }
          setIsRestTimerActive(true);
        }

        const isPR = log.targetWeight > (exerciseProgress[exerciseId]?.allTimePRWeight || 0) &&
          newCompleted.every((r) => r !== null && r >= targetRep);

        return {
          ...log,
          completedReps: newCompleted,
          isPR,
        };
      })
    );
  };

  const handleUpdateWeight = (exerciseId: ExerciseId, newWeight: number) => {
    setExerciseLogs((prev) =>
      prev.map((log) => (log.exerciseId === exerciseId ? { ...log, targetWeight: newWeight } : log))
    );

    const def = EXERCISE_DEFINITIONS[exerciseId];
    if (def.category === 'barbell_compound') {
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
        userSettings.dumbbellInventory
      );
      results[log.exerciseId] = result;
    });

    setProgressionResults(results);
    setIsSummaryOpen(true);
  };

  const handleSaveWorkoutToDB = async (notes: string) => {
    const session: WorkoutSession = {
      type: selectedType,
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

    localStorage.removeItem('stronglifts_active_draft');
    setIsSummaryOpen(false);
    setIsActive(false);
    setIsRestTimerActive(false);
    onWorkoutSaved();
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
              3-day weekly cadence with automated progression and warm-up checklist.
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
                Scheduled Routine:
              </div>
              {WORKOUT_ROUTINES[selectedType].exerciseIds.map((exId, idx) => {
                const def = EXERCISE_DEFINITIONS[exId];
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
                      {exId === 'pullups' && (!prog?.mode || prog.mode === 'bodyweight')
                        ? '3×AMRAP'
                        : `${weight} ${userSettings.unit}`}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => handleStartWorkout(selectedType)}
              className="w-full py-4 bg-gym-accent hover:bg-emerald-500 text-gym-bg font-black text-sm uppercase tracking-wider rounded-2xl shadow-glow-emerald transition-all tap-active flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              Start Workout {selectedType}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-gym-card rounded-2xl border border-gym-border/80 p-3.5 shadow-md flex items-center justify-between">
            <div>
              <div className="text-xs font-black uppercase text-gym-text flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gym-accent animate-pulse" />
                Workout {selectedType} in Progress
              </div>
              <div className="text-[11px] font-mono text-gym-muted mt-0.5">
                {totalCompletedSets} of {totalTargetSets} sets checked
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (confirm('Cancel active workout? Unsaved sets will be lost.')) {
                  localStorage.removeItem('stronglifts_active_draft');
                  setIsActive(false);
                  setIsRestTimerActive(false);
                }
              }}
              className="px-2.5 py-1.5 rounded-xl bg-gym-surface text-gym-dimmed hover:text-gym-danger text-[11px] font-bold border border-gym-border/60"
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
                warmupSets={warmupSetsMap[log.exerciseId] || []}
                unit={userSettings.unit}
                barWeight={userSettings.barWeight}
                plateInventory={userSettings.plateInventory}
                dumbbellInventory={userSettings.dumbbellInventory}
                onCycleSetReps={handleCycleSetReps}
                onUpdateWeight={handleUpdateWeight}
                onTogglePullupMode={handleTogglePullupMode}
                onToggleWarmupSet={handleToggleWarmupSet}
                soundEnabled={userSettings.soundEnabled}
                vibrationEnabled={userSettings.vibrationEnabled}
              />
            ))}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleFinishWorkout}
              className="w-full py-4 bg-gym-accent hover:bg-emerald-500 text-gym-bg font-black text-sm uppercase tracking-wider rounded-2xl shadow-glow-emerald transition-all tap-active flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              Finish Workout
            </button>
          </div>
        </div>
      )}

      <RestTimer
        initialSeconds={restTimerSeconds}
        isActive={isRestTimerActive}
        onClose={() => setIsRestTimerActive(false)}
        soundEnabled={userSettings.soundEnabled}
        vibrationEnabled={userSettings.vibrationEnabled}
      />

      <WorkoutSummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        onSave={handleSaveWorkoutToDB}
        workoutType={selectedType}
        durationSeconds={elapsedSeconds}
        exerciseLogs={exerciseLogs}
        progressionResults={progressionResults}
        unit={userSettings.unit}
      />
    </div>
  );
};
