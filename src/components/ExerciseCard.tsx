import React, { useState } from 'react';
import { Layers, Plus, Minus, Sparkles } from 'lucide-react';
import type { ExerciseId, ExerciseLog, ExerciseProgressState, WarmupSet } from '../types';
import { SetBubble } from './SetBubble';
import { WarmupSection } from './WarmupSection';
import { PlateCalculatorModal } from './PlateCalculatorModal';
import { EXERCISE_DEFINITIONS } from '../utils/constants';

interface ExerciseCardProps {
  exerciseLog: ExerciseLog;
  progressState?: ExerciseProgressState;
  warmupSets: WarmupSet[];
  unit: string;
  barWeight: number;
  availablePlates: number[];
  dumbbellInventory: number[];
  onCycleSetReps: (exerciseId: ExerciseId, setIndex: number) => void;
  onUpdateWeight: (exerciseId: ExerciseId, newWeight: number) => void;
  onTogglePullupMode?: (exerciseId: ExerciseId, mode: 'bodyweight' | 'weighted') => void;
  onToggleWarmupSet: (exerciseId: ExerciseId, setIndex: number) => void;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exerciseLog,
  progressState,
  warmupSets,
  unit,
  barWeight,
  availablePlates,
  dumbbellInventory,
  onCycleSetReps,
  onUpdateWeight,
  onTogglePullupMode,
  onToggleWarmupSet,
  soundEnabled = true,
  vibrationEnabled = true,
}) => {
  const [isPlateModalOpen, setIsPlateModalOpen] = useState(false);
  const def = EXERCISE_DEFINITIONS[exerciseLog.exerciseId];
  const isBarbell = def.category === 'barbell_compound';
  const isDumbbell = def.category === 'dumbbell_accessory';
  const isPullups = exerciseLog.exerciseId === 'pullups';

  const handleAdjustWeight = (delta: number) => {
    if (isDumbbell) {
      const sorted = [...dumbbellInventory].sort((a, b) => a - b);
      const curIdx = sorted.findIndex((w) => w >= exerciseLog.targetWeight);
      if (delta > 0) {
        const nextIdx = Math.min(curIdx + 1, sorted.length - 1);
        onUpdateWeight(exerciseLog.exerciseId, sorted[nextIdx]);
      } else {
        const prevIdx = Math.max(0, curIdx - 1);
        onUpdateWeight(exerciseLog.exerciseId, sorted[prevIdx]);
      }
    } else {
      const increment = def.increment || 2.5;
      const minWeight = isBarbell ? (def.id === 'ohp' ? 20 : (def.isFloorLift ? 40 : 20)) : 0;
      const nextWeight = Math.max(minWeight, exerciseLog.targetWeight + (delta > 0 ? increment : -increment));
      onUpdateWeight(exerciseLog.exerciseId, nextWeight);
    }
  };

  const isCompletedAll = exerciseLog.completedReps.length === exerciseLog.targetReps.length &&
    exerciseLog.completedReps.every((r, idx) => r !== null && r >= exerciseLog.targetReps[idx]);

  return (
    <div className={`p-4 rounded-3xl border transition-all duration-200 ${
      isCompletedAll
        ? 'bg-gym-card/90 border-emerald-500/40 shadow-glow-emerald/20'
        : 'bg-gym-card border-gym-border/80 shadow-md'
    }`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-gym-text tracking-tight">
              {exerciseLog.exerciseName}
            </h3>
            {exerciseLog.isPR && (
              <span className="bg-gym-gold/20 text-gym-gold border border-gym-gold/40 text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> PR
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] font-semibold text-gym-muted">
              {def.defaultSets}×{typeof def.defaultTargetReps === 'number' ? def.defaultTargetReps : 'AMRAP'}
            </span>
            {progressState && progressState.consecutiveFailures > 0 && (
              <span className="text-[10px] bg-gym-warning/20 text-gym-warning font-bold px-1.5 py-0.2 rounded">
                Attempt {progressState.consecutiveFailures + 1}/3
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isBarbell && (
            <button
              type="button"
              onClick={() => setIsPlateModalOpen(true)}
              className="p-2 rounded-xl bg-gym-surface hover:bg-gym-cardHover text-gym-cyan border border-gym-border/80 flex items-center gap-1 text-[11px] font-bold tap-active"
              title="View Barbell Plate Calculator"
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Plates</span>
            </button>
          )}

          <div className="flex items-center bg-gym-surface rounded-2xl border border-gym-border/80 p-1">
            <button
              type="button"
              onClick={() => handleAdjustWeight(-1)}
              className="w-8 h-8 rounded-xl bg-gym-card hover:bg-gym-border/40 text-gym-text flex items-center justify-center tap-active"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <div className="px-2.5 text-center">
              <span className="font-mono font-black text-sm text-gym-text">
                {exerciseLog.targetWeight}
              </span>
              <span className="text-[10px] text-gym-muted font-bold ml-0.5">{unit}</span>
            </div>

            <button
              type="button"
              onClick={() => handleAdjustWeight(1)}
              className="w-8 h-8 rounded-xl bg-gym-card hover:bg-gym-border/40 text-gym-text flex items-center justify-center tap-active"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {isPullups && onTogglePullupMode && (
        <div className="mt-3 flex items-center justify-between bg-gym-bg/80 p-1.5 rounded-2xl border border-gym-border/40">
          <button
            type="button"
            onClick={() => onTogglePullupMode('pullups', 'bodyweight')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              exerciseLog.mode === 'bodyweight'
                ? 'bg-gym-surface text-gym-text shadow-sm border border-gym-border/80'
                : 'text-gym-dimmed hover:text-gym-muted'
            }`}
          >
            Bodyweight (AMRAP)
          </button>
          <button
            type="button"
            onClick={() => onTogglePullupMode('pullups', 'weighted')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              exerciseLog.mode === 'weighted'
                ? 'bg-gym-surface text-gym-cyan shadow-sm border border-gym-cyan/40'
                : 'text-gym-dimmed hover:text-gym-muted'
            }`}
          >
            Weighted (+X kg 3×5)
          </button>
        </div>
      )}

      {isBarbell && warmupSets.length > 0 && (
        <WarmupSection
          warmupSets={warmupSets}
          unit={unit}
          onToggleWarmupSet={(idx) => onToggleWarmupSet(exerciseLog.exerciseId, idx)}
          vibrationEnabled={vibrationEnabled}
        />
      )}

      <div className="mt-4 pt-3 border-t border-gym-border/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gym-muted">
            Work Sets ({exerciseLog.completedReps.filter((r) => r !== null).length}/{exerciseLog.targetReps.length})
          </span>
          <span className="text-[10px] text-gym-dimmed font-medium">
            Tap bubble to log reps
          </span>
        </div>

        <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-1">
          {exerciseLog.targetReps.map((target, setIdx) => (
            <SetBubble
              key={setIdx}
              setIndex={setIdx}
              targetReps={target}
              completedReps={exerciseLog.completedReps[setIdx] ?? null}
              onCycleReps={(idx) => onCycleSetReps(exerciseLog.exerciseId, idx)}
              soundEnabled={soundEnabled}
              vibrationEnabled={vibrationEnabled}
            />
          ))}
        </div>
      </div>

      {isBarbell && (
        <PlateCalculatorModal
          isOpen={isPlateModalOpen}
          onClose={() => setIsPlateModalOpen(false)}
          initialWeight={exerciseLog.targetWeight}
          barWeight={barWeight}
          availablePlates={availablePlates}
          unit={unit}
          exerciseName={exerciseLog.exerciseName}
        />
      )}
    </div>
  );
};
