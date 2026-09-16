import React, { useEffect, useState } from 'react';
import { Trophy, CheckCircle2, TrendingUp, AlertTriangle, ArrowRight, Sparkles, Clock, Dumbbell } from 'lucide-react';
import type { ExerciseLog, ProgressionResult, WorkoutType } from '../types';
import { soundEngine } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { CelebrationBurst } from './CelebrationBurst';

interface WorkoutSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (notes: string) => void;
  workoutType: WorkoutType;
  durationSeconds: number;
  exerciseLogs: ExerciseLog[];
  progressionResults: Record<string, ProgressionResult>;
  unit?: string;
}

export const WorkoutSummaryModal: React.FC<WorkoutSummaryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  workoutType,
  durationSeconds,
  exerciseLogs,
  progressionResults,
  unit = 'kg',
}) => {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      soundEngine.playVictory();
      triggerHaptic('pr');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}m ${remainder}s`;
  };

  const totalVolume = exerciseLogs.reduce((acc, log) => {
    const repsSum = log.completedReps.reduce<number>((rAcc, r) => rAcc + (r || 0), 0);
    return acc + repsSum * log.targetWeight;
  }, 0);

  return (
    <div
      data-testid="workout-summary-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 animate-fadeIn overflow-y-auto"
    >
      <div className="bg-gym-card w-full max-w-md rounded-3xl border border-gym-border shadow-2xl p-5 my-auto max-h-[92vh] flex flex-col relative overflow-hidden">
        <div className="text-center pb-4 border-b border-gym-border/60 shrink-0 relative">
          {/* Zero-lag GPU celebration burst */}
          <CelebrationBurst />

          {/* Tada Trophy Pop */}
          <div className="w-16 h-16 rounded-2xl bg-gym-accent/20 border-2 border-gym-accent/40 text-gym-accent mx-auto flex items-center justify-center mb-2.5 shadow-glow-emerald animate-tada relative z-10">
            <Trophy className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-gym-text tracking-tight relative z-10">
            Workout {workoutType} Complete!
          </h2>
          <p className="text-xs font-semibold text-gym-accent flex items-center justify-center gap-1 mt-0.5 relative z-10">
            <Sparkles className="w-3.5 h-3.5" /> Great job crushing your session today!
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 my-4 shrink-0">
          <div className="bg-gym-surface/80 p-3 rounded-2xl border border-gym-border/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gym-cyan/20 text-gym-cyan flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-gym-muted">Duration</div>
              <div className="text-sm font-mono font-black text-gym-text">
                {formatDuration(durationSeconds)}
              </div>
            </div>
          </div>

          <div className="bg-gym-surface/80 p-3 rounded-2xl border border-gym-border/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gym-accent/20 text-gym-accent flex items-center justify-center">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-gym-muted">Total Volume</div>
              <div className="text-sm font-mono font-black text-gym-text">
                {Math.round(totalVolume)} <span className="text-xs font-normal text-gym-muted">{unit}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-1 no-scrollbar">
          <div className="text-xs font-bold uppercase tracking-wider text-gym-muted mb-2">
            Next Session Progression Updates:
          </div>

          {exerciseLogs.map((log) => {
            const prog = progressionResults[log.exerciseId];
            const isWeightUp = prog && prog.nextWeight > log.targetWeight;
            const isDeload = prog && prog.isDeload;

            return (
              <div
                key={log.exerciseId}
                className="bg-gym-bg p-3 rounded-xl border border-gym-border/60 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-gym-text">
                    {log.exerciseName}
                  </span>
                  {log.isPR && (
                    <span className="bg-gym-gold/20 text-gym-gold border border-gym-gold/40 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-glow-gold">
                      <Sparkles className="w-3 h-3" /> NEW PR!
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="text-gym-dimmed font-mono">
                    Today: <span className="text-gym-text font-bold">{log.targetWeight} {unit}</span>
                    <span className="ml-1 text-[11px]">
                      ({log.completedReps.filter((r) => r !== null).join('-')})
                    </span>
                  </div>

                  {prog && (
                    <div className="flex items-center gap-1 font-mono font-bold">
                      <ArrowRight className="w-3.5 h-3.5 text-gym-dimmed" />
                      <span className={isWeightUp ? 'text-gym-accent' : isDeload ? 'text-gym-warning' : 'text-gym-muted'}>
                        {prog.nextWeight} {unit}
                      </span>
                    </div>
                  )}
                </div>

                {prog && (
                  <div className={`text-[11px] font-medium flex items-center gap-1 ${
                    isWeightUp ? 'text-emerald-400' : isDeload ? 'text-amber-400' : 'text-gym-dimmed'
                  }`}>
                    {isDeload ? <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> : <TrendingUp className="w-3.5 h-3.5 shrink-0" />}
                    <span>{prog.message}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-3 shrink-0">
          <label className="text-[11px] font-bold text-gym-muted uppercase block mb-1">
            Workout Notes (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Energy felt great, warmups felt smooth..."
            className="w-full bg-gym-bg px-3 py-2.5 rounded-xl border border-gym-border/80 text-xs text-gym-text placeholder-gym-dimmed focus:outline-none focus:border-gym-accent"
          />
        </div>

        <div className="mt-4 flex gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-gym-surface hover:bg-gym-cardHover text-gym-muted font-bold text-xs uppercase rounded-xl border border-gym-border tap-active"
          >
            Review Sets
          </button>
          <button
            type="button"
            onClick={() => onSave(notes)}
            className="flex-2 py-3 bg-gym-accent hover:bg-emerald-500 text-gym-bg font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-glow-emerald tap-active flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            Save & Finish Workout
          </button>
        </div>
      </div>
    </div>
  );
};
