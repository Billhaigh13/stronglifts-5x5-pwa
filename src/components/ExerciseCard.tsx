import React, { useState } from 'react';
import { Layers, Plus, Minus, Sparkles, TrendingUp, Info } from 'lucide-react';
import type { ExerciseId, ExerciseLog, ExerciseProgressState, ExerciseProgressionConfig, PlateInventoryItem, WarmupSet } from '../types';
import { SetBubble } from './SetBubble';
import { WarmupSection } from './WarmupSection';
import { PlateCalculatorModal } from './PlateCalculatorModal';
import { EXERCISE_DEFINITIONS } from '../utils/constants';

interface ExerciseCardProps {
  exerciseLog: ExerciseLog;
  progressState?: ExerciseProgressState;
  progressionConfig?: ExerciseProgressionConfig;
  warmupSets: WarmupSet[];
  unit: string;
  barWeight: number;
  plateInventory?: PlateInventoryItem[];
  availablePlates?: number[];
  dumbbellInventory: number[];
  onCycleSetReps: (exerciseId: ExerciseId, setIndex: number) => void;
  onUpdateWeight: (exerciseId: ExerciseId, newWeight: number) => void;
  onTogglePullupMode?: (exerciseId: ExerciseId, mode: 'bodyweight' | 'weighted') => void;
  onToggleWarmupSet: (exerciseId: ExerciseId, setIndex: number) => void;
  onOpenProgressionModal?: (exerciseId: ExerciseId) => void;
  onOpenGuideModal?: (exerciseId: ExerciseId) => void;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exerciseLog,
  progressState,
  progressionConfig,
  warmupSets,
  unit,
  barWeight,
  plateInventory,
  dumbbellInventory,
  onCycleSetReps,
  onUpdateWeight,
  onTogglePullupMode,
  onToggleWarmupSet,
  onOpenProgressionModal,
  onOpenGuideModal,
  soundEnabled = true,
  vibrationEnabled = true,
}) => {
  const [isPlateModalOpen, setIsPlateModalOpen] = useState(false);
  const def = EXERCISE_DEFINITIONS[exerciseLog.exerciseId] || {
    id: exerciseLog.exerciseId,
    name: exerciseLog.exerciseName,
    category: 'barbell_compound',
    defaultSets: 5,
    defaultTargetReps: 5,
    increment: 2.5,
    defaultWeight: 20,
  };
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
      const increment = progressionConfig?.increment ?? def.increment ?? 2.5;
      const minWeight = isBarbell ? (def.id === 'ohp' ? 20 : (def.isFloorLift ? 40 : 20)) : 0;
      const nextWeight = Math.max(minWeight, exerciseLog.targetWeight + (delta > 0 ? increment : -increment));
      onUpdateWeight(exerciseLog.exerciseId, nextWeight);
    }
  };

  const isBodyweight = (exerciseLog.exerciseId === 'pullups' || exerciseLog.exerciseId === 'dips' || exerciseLog.mode === 'bodyweight') && exerciseLog.mode !== 'weighted';

  const isCompletedAll = isBodyweight
    ? exerciseLog.completedReps.length > 0 && exerciseLog.completedReps.every((r) => r !== null)
    : exerciseLog.completedReps.length === exerciseLog.targetReps.length &&
      exerciseLog.completedReps.every((r, idx) => r !== null && r >= exerciseLog.targetReps[idx]);

  return (
    <div className={`p-4 rounded-3xl border transition-all duration-200 ${
      isCompletedAll
        ? 'bg-gym-card/90 border-emerald-500/40 shadow-glow-emerald/20'
        : 'bg-gym-card border-gym-border/80 shadow-md'
    }`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-base font-extrabold text-gym-text tracking-tight">
              {exerciseLog.exerciseName}
            </h3>
            <button
              type="button"
              onClick={() => onOpenGuideModal?.(exerciseLog.exerciseId)}
              className="p-1 rounded-lg text-gym-dimmed hover:text-gym-accent hover:bg-gym-surface/80 transition-colors tap-active"
              title={`View ${exerciseLog.exerciseName} Guide & Form Tips`}
              aria-label={`View ${exerciseLog.exerciseName} Guide`}
            >
              <Info className="w-3.5 h-3.5" />
            </button>
            {exerciseLog.isPR && (
              <span className="bg-gym-gold/20 text-gym-gold border border-gym-gold/40 text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> PR
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] font-semibold text-gym-muted">
              {isBodyweight
                ? `${def.defaultSets} Sets • Progressive Reps`
                : `${def.defaultSets}×${typeof def.defaultTargetReps === 'number' ? def.defaultTargetReps : 'AMRAP'}`}
            </span>
            {progressState && progressState.consecutiveFailures > 0 && !isBodyweight && (
              <span className="text-[10px] bg-gym-warning/20 text-gym-warning font-bold px-1.5 py-0.2 rounded">
                Attempt {progressState.consecutiveFailures + 1}/{progressionConfig?.failuresBeforeDeload || 3}
              </span>
            )}
          </div>

          {/* Quick Progression Rule Badge */}
          {progressionConfig && (
            <button
              type="button"
              onClick={() => onOpenProgressionModal?.(exerciseLog.exerciseId)}
              className="flex items-center gap-1 bg-gym-surface/80 hover:bg-gym-surface px-2 py-0.5 rounded-lg border border-gym-border/40 text-[10px] text-gym-accent font-bold mt-1.5 tap-active"
              title="View or customize progression rules"
            >
              <TrendingUp className="w-2.5 h-2.5" />
              <span>
                {progressionConfig.strategy === 'double_progression'
                  ? `${progressionConfig.repRangeMin || 8}–${progressionConfig.repRangeMax || 12} Rep Ladder`
                  : isBodyweight
                  ? `Progressive Reps (Beat Last Session)`
                  : `+${progressionConfig.increment} ${unit} / pass`}
              </span>
            </button>
          )}
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
            <div className="px-3 text-center min-w-[70px]">
              <span className="text-base font-black font-mono text-gym-text leading-none block">
                {exerciseLog.mode === 'bodyweight' ? 'BW' : exerciseLog.targetWeight}
              </span>
              <span className="text-[10px] font-bold text-gym-muted uppercase">
                {exerciseLog.mode === 'bodyweight' ? 'Bodyweight' : unit}
              </span>
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
        <div className="mt-3 flex items-center gap-2 bg-gym-surface/60 p-1 rounded-2xl border border-gym-border/40">
          <button
            type="button"
            onClick={() => onTogglePullupMode(exerciseLog.exerciseId, 'bodyweight')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
              exerciseLog.mode !== 'weighted'
                ? 'bg-gym-accent text-gym-bg shadow-glow-emerald font-extrabold'
                : 'text-gym-muted hover:text-gym-text'
            }`}
          >
            Bodyweight (3×AMRAP)
          </button>
          <button
            type="button"
            onClick={() => onTogglePullupMode(exerciseLog.exerciseId, 'weighted')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
              exerciseLog.mode === 'weighted'
                ? 'bg-gym-accent text-gym-bg shadow-glow-emerald font-extrabold'
                : 'text-gym-muted hover:text-gym-text'
            }`}
          >
            Weighted (+{exerciseLog.targetWeight} {unit})
          </button>
        </div>
      )}

      {/* Warmup sets pyramid */}
      {isBarbell && warmupSets.length > 0 && (
        <WarmupSection
          warmupSets={warmupSets}
          unit={unit}
          onToggleWarmupSet={(idx) => onToggleWarmupSet(exerciseLog.exerciseId, idx)}
        />
      )}

      {/* Main work sets bubbles */}
      <div className="mt-4 pt-3 border-t border-gym-border/60">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold text-gym-muted uppercase tracking-wider">
            Work Sets ({exerciseLog.targetReps.length} Sets):
          </span>
          <span className="text-[11px] font-mono text-gym-cyan font-bold">
            Tap circle to log reps
          </span>
        </div>

        <div className="flex items-center justify-around gap-1">
          {exerciseLog.targetReps.map((target, idx) => (
            <SetBubble
              key={idx}
              setIndex={idx}
              targetReps={target}
              completedReps={exerciseLog.completedReps[idx]}
              onCycleReps={() => onCycleSetReps(exerciseLog.exerciseId, idx)}
              soundEnabled={soundEnabled}
              vibrationEnabled={vibrationEnabled}
              isBodyweight={isBodyweight}
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
          plateInventory={plateInventory}
          unit={unit}
          exerciseName={exerciseLog.exerciseName}
        />
      )}
    </div>
  );
};
