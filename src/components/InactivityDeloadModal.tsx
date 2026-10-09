import React, { useState, useEffect } from 'react';
import { Calendar, Check, ArrowRight, Sparkles, X } from 'lucide-react';
import type { ExerciseId, InactivityDeloadSuggestion } from '../types';

interface InactivityDeloadModalProps {
  isOpen: boolean;
  suggestions: InactivityDeloadSuggestion[];
  unit: string;
  onApplyAndStart: (selectedExerciseIds: ExerciseId[]) => void;
  onKeepAndStart: () => void;
  onClose: () => void;
}

export const InactivityDeloadModal: React.FC<InactivityDeloadModalProps> = ({
  isOpen,
  suggestions,
  unit,
  onApplyAndStart,
  onKeepAndStart,
  onClose,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<ExerciseId>>(new Set());

  // By default, select all suggestions when modal opens
  useEffect(() => {
    if (isOpen && suggestions.length > 0) {
      setSelectedIds(new Set(suggestions.map((s) => s.exerciseId)));
    }
  }, [isOpen, suggestions]);

  if (!isOpen || suggestions.length === 0) return null;

  const toggleExercise = (id: ExerciseId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === suggestions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(suggestions.map((s) => s.exerciseId)));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gym-card border border-gym-border/90 rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-gym-dimmed hover:text-gym-text hover:bg-gym-surface transition-colors tap-active"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 pr-8">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-lg font-black text-gym-text tracking-tight">
                Welcome Back!
              </h2>
              <span className="text-base">👋</span>
            </div>
            <p className="text-xs text-gym-muted font-medium mt-0.5 leading-relaxed">
              You&apos;ve had a break from some exercises in this routine. Easing back with a deload prevents injury and excessive soreness.
            </p>
          </div>
        </div>

        {/* Suggestion list */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-gym-dimmed px-1">
            <span>RECOMMENDED DELOADS ({suggestions.length})</span>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-gym-accent hover:underline tap-active"
            >
              {selectedIds.size === suggestions.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {suggestions.map((suggestion) => {
            const isSelected = selectedIds.has(suggestion.exerciseId);

            return (
              <div
                key={suggestion.exerciseId}
                onClick={() => toggleExercise(suggestion.exerciseId)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-gym-surface border-gym-accent/50 shadow-sm'
                    : 'bg-gym-bg/60 border-gym-border/50 opacity-70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-gym-accent border-gym-accent text-gym-bg shadow-glow-emerald/30'
                        : 'border-gym-border/80 bg-gym-card'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  <div>
                    <div className="text-xs font-black text-gym-text">
                      {suggestion.exerciseName}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-gym-dimmed font-semibold">
                        {suggestion.daysElapsed} days away
                      </span>
                      <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1 rounded font-bold">
                        -{suggestion.percent}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-right font-mono">
                  <span className="text-xs text-gym-muted line-through font-semibold">
                    {suggestion.currentWeight}
                  </span>
                  <ArrowRight className="w-3 h-3 text-gym-dimmed" />
                  <span className="text-sm font-black text-gym-accent">
                    {suggestion.suggestedWeight}{' '}
                    <span className="text-[10px] font-sans text-gym-muted">{unit}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => onApplyAndStart(Array.from(selectedIds))}
            className="w-full py-3.5 bg-gym-accent hover:bg-emerald-500 text-gym-bg font-black text-sm uppercase tracking-wider rounded-2xl shadow-glow-emerald transition-all duration-150 flex items-center justify-center gap-2 tap-active"
          >
            <Sparkles className="w-4 h-4 fill-current stroke-[2]" />
            Apply Selected & Start ({selectedIds.size})
          </button>

          <button
            type="button"
            onClick={onKeepAndStart}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-gym-muted hover:text-gym-text transition-colors tap-active"
          >
            Keep Current Weights & Start
          </button>
        </div>
      </div>
    </div>
  );
};
