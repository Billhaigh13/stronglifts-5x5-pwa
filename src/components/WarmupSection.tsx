import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Flame, CheckCircle2, Circle } from 'lucide-react';
import type { WarmupSet } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface WarmupSectionProps {
  warmupSets: WarmupSet[];
  unit: string;
  onToggleWarmupSet: (setIndex: number) => void;
  vibrationEnabled?: boolean;
}

export const WarmupSection: React.FC<WarmupSectionProps> = ({
  warmupSets,
  unit,
  onToggleWarmupSet,
  vibrationEnabled = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!warmupSets || warmupSets.length === 0) {
    return null;
  }

  const completedCount = warmupSets.filter((s) => s.completed).length;
  const isAllWarmupsDone = completedCount === warmupSets.length;

  const handleToggle = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (vibrationEnabled) {
      triggerHaptic('light');
    }
    onToggleWarmupSet(idx);
  };

  return (
    <div className="mt-3 pt-3 border-t border-gym-border/40">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left py-1 text-xs font-semibold text-gym-muted hover:text-gym-text transition-colors"
      >
        <div className="flex items-center gap-2">
          <Flame className={`w-3.5 h-3.5 ${completedCount > 0 ? 'text-gym-warning' : 'text-gym-dimmed'}`} />
          <span className="font-bold tracking-tight text-gym-text">
            Warm-up Sets ({completedCount}/{warmupSets.length})
          </span>
          {isAllWarmupsDone && (
            <span className="bg-gym-warning/20 text-gym-warning text-[10px] font-bold px-1.5 py-0.5 rounded">
              Ready
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-gym-dimmed">
          <span>{isExpanded ? 'Hide' : 'Show'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-1.5 bg-gym-bg/60 p-2.5 rounded-xl border border-gym-border/40">
          <div className="text-[10px] text-gym-dimmed italic mb-1 flex items-center justify-between">
            <span>Dynamic warm-ups based on working weight</span>
            <span className="not-italic text-gym-dimmed">Non-volume</span>
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {warmupSets.map((set, idx) => (
              <div
                key={idx}
                onClick={(e) => handleToggle(idx, e)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  set.completed
                    ? 'bg-gym-surface/80 text-gym-muted border border-gym-warning/30'
                    : 'bg-gym-card text-gym-text border border-gym-border/60 hover:border-gym-border'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {set.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-gym-warning fill-gym-warning/20" />
                  ) : (
                    <Circle className="w-4 h-4 text-gym-dimmed" />
                  )}
                  <span className="font-mono font-bold text-xs">
                    {set.reps} × {set.weight} {unit}
                  </span>
                </div>
                <span className="text-[11px] font-medium text-gym-dimmed">
                  {set.percentageText}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
