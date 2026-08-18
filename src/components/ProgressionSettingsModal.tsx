import React, { useState } from 'react';
import { X, TrendingUp, RotateCcw, Check, Sparkles, Sliders, ShieldAlert, ArrowRight } from 'lucide-react';
import type { ExerciseId, ExerciseProgressionConfig } from '../types';
import { DEFAULT_PROGRESSION_CONFIGS, EXERCISE_DEFINITIONS } from '../utils/constants';
import { triggerHaptic } from '../utils/haptics';

interface ProgressionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  progressionConfigs?: Partial<Record<ExerciseId, ExerciseProgressionConfig>>;
  dumbbellInventory: number[];
  unit?: string;
  initialExerciseId?: ExerciseId;
  onSaveConfigs: (configs: Record<ExerciseId, ExerciseProgressionConfig>) => void;
}

export const ProgressionSettingsModal: React.FC<ProgressionSettingsModalProps> = ({
  isOpen,
  onClose,
  progressionConfigs = {},
  dumbbellInventory,
  unit = 'kg',
  initialExerciseId = 'squat',
  onSaveConfigs,
}) => {
  const [selectedExId, setSelectedExId] = useState<ExerciseId>(initialExerciseId);
  const [activeCategory, setActiveCategory] = useState<'barbell' | 'dumbbell' | 'bodyweight'>('barbell');

  const [configs, setConfigs] = useState<Record<ExerciseId, ExerciseProgressionConfig>>(() => {
    const initial = {} as Record<ExerciseId, ExerciseProgressionConfig>;
    (Object.keys(EXERCISE_DEFINITIONS) as ExerciseId[]).forEach((id) => {
      initial[id] = {
        ...DEFAULT_PROGRESSION_CONFIGS[id],
        ...(progressionConfigs[id] || {}),
      };
    });
    return initial;
  });

  if (!isOpen) return null;

  const currentConfig: ExerciseProgressionConfig = configs[selectedExId] || DEFAULT_PROGRESSION_CONFIGS[selectedExId];
  const currentDef = EXERCISE_DEFINITIONS[selectedExId];

  const updateCurrentConfig = (patch: Partial<ExerciseProgressionConfig>) => {
    triggerHaptic('light');
    setConfigs((prev) => ({
      ...prev,
      [selectedExId]: {
        ...prev[selectedExId],
        ...patch,
      },
    }));
  };

  const handleResetSingle = () => {
    triggerHaptic('medium');
    setConfigs((prev) => ({
      ...prev,
      [selectedExId]: { ...DEFAULT_PROGRESSION_CONFIGS[selectedExId] },
    }));
  };

  const handleResetAll = () => {
    if (confirm('Reset all exercise progression rules to default settings?')) {
      triggerHaptic('heavy');
      setConfigs({ ...DEFAULT_PROGRESSION_CONFIGS });
    }
  };

  const handleSaveAndClose = () => {
    triggerHaptic('medium');
    onSaveConfigs(configs);
    onClose();
  };

  const exerciseList = Object.values(EXERCISE_DEFINITIONS).filter((def) => {
    if (activeCategory === 'barbell') return def.category === 'barbell_compound';
    if (activeCategory === 'dumbbell') return def.category === 'dumbbell_accessory';
    return def.category === 'bodyweight_accessory';
  });

  const sortedDumbbells = [...dumbbellInventory].sort((a, b) => a - b);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-gym-card w-full max-w-md rounded-3xl border border-gym-border shadow-2xl p-5 my-auto max-h-[92vh] flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gym-border/60 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gym-accent/20 border border-gym-accent/40 flex items-center justify-center text-gym-accent shadow-glow-emerald/20">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-gym-text">
                Progression Rules
              </h2>
              <p className="text-[11px] text-gym-muted font-medium">
                Customize increments & auto-deloads
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gym-surface flex items-center justify-center text-gym-muted hover:text-gym-text hover:bg-gym-cardHover transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-3 gap-1.5 bg-gym-surface/80 p-1 rounded-2xl border border-gym-border/60 my-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveCategory('barbell');
              setSelectedExId('squat');
            }}
            className={`py-2 text-[11px] font-bold rounded-xl transition-all ${
              activeCategory === 'barbell'
                ? 'bg-gym-accent text-gym-bg shadow-glow-emerald font-extrabold'
                : 'text-gym-muted hover:text-gym-text'
            }`}
          >
            Barbell Lifts
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveCategory('dumbbell');
              setSelectedExId('bicep_curl');
            }}
            className={`py-2 text-[11px] font-bold rounded-xl transition-all ${
              activeCategory === 'dumbbell'
                ? 'bg-gym-accent text-gym-bg shadow-glow-emerald font-extrabold'
                : 'text-gym-muted hover:text-gym-text'
            }`}
          >
            Dumbbells
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveCategory('bodyweight');
              setSelectedExId('pullups');
            }}
            className={`py-2 text-[11px] font-bold rounded-xl transition-all ${
              activeCategory === 'bodyweight'
                ? 'bg-gym-accent text-gym-bg shadow-glow-emerald font-extrabold'
                : 'text-gym-muted hover:text-gym-text'
            }`}
          >
            Bodyweight
          </button>
        </div>

        {/* Horizontal Exercise Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 shrink-0 no-scrollbar">
          {exerciseList.map((ex) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => {
                setSelectedExId(ex.id);
                triggerHaptic('light');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                selectedExId === ex.id
                  ? 'bg-gym-surface text-gym-cyan border-gym-cyan/50 shadow-glow-cyan/20'
                  : 'bg-gym-bg text-gym-muted border-gym-border/40 hover:text-gym-text'
              }`}
            >
              {ex.name}
            </button>
          ))}
        </div>

        {/* Config Form for Selected Exercise */}
        <div className="flex-1 overflow-y-auto space-y-4 my-2 pr-1">
          {/* Active Exercise Summary Banner */}
          <div className="bg-gym-bg p-3.5 rounded-2xl border border-gym-border/60 flex items-center justify-between">
            <div>
              <div className="text-xs font-black text-gym-text">
                {currentDef.name}
              </div>
              <div className="text-[11px] text-gym-muted font-medium mt-0.5">
                {currentConfig.strategy === 'double_progression'
                  ? `Double Progression (${currentConfig.repRangeMin || 8}–${currentConfig.repRangeMax || 12} Reps)`
                  : currentConfig.strategy === 'bodyweight_reps'
                  ? `Bodyweight AMRAP / Weighted (+${currentConfig.increment} ${unit})`
                  : `Linear Progression (+${currentConfig.increment} ${unit}/session)`}
              </div>
            </div>
            <button
              type="button"
              onClick={handleResetSingle}
              title="Reset this exercise to default"
              className="text-[11px] text-gym-dimmed hover:text-gym-accent font-bold flex items-center gap-1 p-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* Strategy Toggle for Dumbbells */}
          {currentDef.category === 'dumbbell_accessory' && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gym-muted uppercase tracking-wider block">
                Progression Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateCurrentConfig({ strategy: 'double_progression' })}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    currentConfig.strategy === 'double_progression'
                      ? 'bg-gym-surface border-gym-cyan/50 text-gym-text shadow-glow-cyan/20'
                      : 'bg-gym-bg border-gym-border/40 text-gym-muted'
                  }`}
                >
                  <div className="text-xs font-extrabold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-gym-cyan" />
                    Double Progression
                  </div>
                  <div className="text-[10px] text-gym-dimmed mt-0.5 leading-tight">
                    Build reps (e.g. 8→10→12), then advance weight on 3×12
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => updateCurrentConfig({ strategy: 'linear' })}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    currentConfig.strategy === 'linear'
                      ? 'bg-gym-surface border-gym-accent/50 text-gym-text shadow-glow-emerald/20'
                      : 'bg-gym-bg border-gym-border/40 text-gym-muted'
                  }`}
                >
                  <div className="text-xs font-extrabold flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-gym-accent" />
                    Fixed Increment
                  </div>
                  <div className="text-[10px] text-gym-dimmed mt-0.5 leading-tight">
                    Add fixed +kg each successful workout
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Double Progression Ladder Settings */}
          {currentConfig.strategy === 'double_progression' && (
            <div className="space-y-3 bg-gym-surface/40 p-3.5 rounded-2xl border border-gym-border/60">
              <div className="flex items-center gap-2 text-xs font-black text-gym-cyan uppercase tracking-wider">
                <Sliders className="w-4 h-4" />
                Rep Ladder Range
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-bold text-gym-muted uppercase block mb-1">
                    Min Reps (Start)
                  </span>
                  <div className="flex items-center gap-2 bg-gym-bg px-3 py-1.5 rounded-xl border border-gym-border/60">
                    <button
                      type="button"
                      onClick={() => updateCurrentConfig({ repRangeMin: Math.max(5, (currentConfig.repRangeMin || 8) - 1) })}
                      className="w-6 h-6 rounded-lg bg-gym-surface text-gym-text font-bold text-sm"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-mono font-black text-gym-text text-sm">
                      {currentConfig.repRangeMin || 8}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCurrentConfig({ repRangeMin: Math.min((currentConfig.repRangeMax || 12) - 1, (currentConfig.repRangeMin || 8) + 1) })}
                      className="w-6 h-6 rounded-lg bg-gym-surface text-gym-text font-bold text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gym-muted uppercase block mb-1">
                    Max Reps (Level Up)
                  </span>
                  <div className="flex items-center gap-2 bg-gym-bg px-3 py-1.5 rounded-xl border border-gym-border/60">
                    <button
                      type="button"
                      onClick={() => updateCurrentConfig({ repRangeMax: Math.max((currentConfig.repRangeMin || 8) + 1, (currentConfig.repRangeMax || 12) - 1) })}
                      className="w-6 h-6 rounded-lg bg-gym-surface text-gym-text font-bold text-sm"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-mono font-black text-gym-text text-sm">
                      {currentConfig.repRangeMax || 12}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCurrentConfig({ repRangeMax: (currentConfig.repRangeMax || 12) + 1 })}
                      className="w-6 h-6 rounded-lg bg-gym-surface text-gym-text font-bold text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Rack Ladder Flow Preview */}
              <div>
                <span className="text-[10px] font-bold text-gym-muted uppercase block mb-1.5">
                  Dumbbell Weight Progression Sequence:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-mono">
                  {sortedDumbbells.map((w, idx) => (
                    <React.Fragment key={w}>
                      <span className="px-2 py-1 rounded-lg bg-gym-bg border border-gym-border/60 text-gym-text font-bold shrink-0">
                        {w}{unit}
                      </span>
                      {idx < sortedDumbbells.length - 1 && (
                        <ArrowRight className="w-3 h-3 text-gym-dimmed shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Weight Increment Selector (for Linear & Bodyweight Weighted) */}
          {currentConfig.strategy !== 'double_progression' && (
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gym-muted uppercase tracking-wider block">
                Weight Increase on Success (+{unit}/session)
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[1.0, 1.25, 2.0, 2.5, 5.0].map((inc) => (
                  <button
                    key={inc}
                    type="button"
                    onClick={() => updateCurrentConfig({ increment: inc })}
                    className={`py-2 rounded-xl font-mono text-xs font-bold transition-all border ${
                      currentConfig.increment === inc
                        ? 'bg-gym-accent text-gym-bg border-gym-accent shadow-glow-emerald font-black'
                        : 'bg-gym-bg text-gym-muted border-gym-border/60 hover:text-gym-text'
                    }`}
                  >
                    +{inc}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Deload & Failure Rules */}
          <div className="space-y-3 bg-gym-surface/40 p-3.5 rounded-2xl border border-gym-border/60">
            <div className="flex items-center gap-2 text-xs font-black text-gym-warning uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              Auto-Deload & Misses Policy
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-bold text-gym-muted uppercase block mb-1">
                  Misses Before Deload
                </span>
                <div className="grid grid-cols-3 gap-1">
                  {[2, 3, 4].map((misses) => (
                    <button
                      key={misses}
                      type="button"
                      onClick={() => updateCurrentConfig({ failuresBeforeDeload: misses })}
                      className={`py-1.5 rounded-xl font-mono text-xs font-bold border transition-all ${
                        (currentConfig.failuresBeforeDeload || 3) === misses
                          ? 'bg-gym-warning/20 border-gym-warning/60 text-gym-warning font-black'
                          : 'bg-gym-bg border-gym-border/40 text-gym-muted'
                      }`}
                    >
                      {misses}x
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gym-muted uppercase block mb-1">
                  Deload Reduction
                </span>
                <div className="grid grid-cols-3 gap-1">
                  {[10, 15, 20].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => updateCurrentConfig({ deloadPercentage: pct })}
                      className={`py-1.5 rounded-xl font-mono text-xs font-bold border transition-all ${
                        (currentConfig.deloadPercentage || 10) === pct
                          ? 'bg-gym-warning/20 border-gym-warning/60 text-gym-warning font-black'
                          : 'bg-gym-bg border-gym-border/40 text-gym-muted'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-gym-border/60 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetAll}
            className="flex-1 py-3 bg-gym-surface hover:bg-gym-cardHover text-gym-dimmed hover:text-gym-muted font-bold text-xs uppercase rounded-xl border border-gym-border tap-active"
          >
            Reset All
          </button>
          <button
            type="button"
            onClick={handleSaveAndClose}
            className="flex-2 py-3 bg-gym-accent hover:bg-emerald-500 text-gym-bg font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-glow-emerald tap-active flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            Save & Apply Rules
          </button>
        </div>
      </div>
    </div>
  );
};
