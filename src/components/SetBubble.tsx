import React from 'react';
import { Check } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { soundEngine } from '../utils/audio';

interface SetBubbleProps {
  setIndex: number;
  targetReps: number;
  completedReps: number | null;
  onCycleReps: (setIndex: number) => void;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
}

export const SetBubble: React.FC<SetBubbleProps> = ({
  setIndex,
  targetReps,
  completedReps,
  onCycleReps,
  soundEnabled = true,
  vibrationEnabled = true,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (vibrationEnabled) {
      triggerHaptic('medium');
    }
    if (soundEnabled) {
      soundEngine.playSetClick();
    }
    onCycleReps(setIndex);
  };

  const isSuccess = completedReps !== null && completedReps >= targetReps;
  const isFailed = completedReps !== null && completedReps < targetReps;

  return (
    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-[52px]">
      <span className="text-[11px] font-mono text-gym-muted uppercase tracking-wider font-semibold">
        Set {setIndex + 1}
      </span>
      <button
        type="button"
        onClick={handleClick}
        className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-mono text-lg font-black transition-all duration-150 relative shadow-sm tap-active ${
          isSuccess
            ? 'bg-gym-accent text-gym-bg shadow-glow-emerald border-2 border-emerald-400 scale-[1.02]'
            : isFailed
            ? 'bg-gym-danger text-white shadow-glow-danger border-2 border-red-400'
            : 'bg-gym-surface text-gym-muted border border-gym-border/80 hover:border-gym-muted/50 hover:bg-gym-cardHover'
        }`}
      >
        {completedReps === null ? (
          <span className="text-base font-bold text-gym-dimmed">{targetReps}</span>
        ) : isSuccess ? (
          <div className="flex flex-col items-center justify-center leading-none">
            <span className="text-lg font-black">{completedReps}</span>
            <Check className="w-3.5 h-3.5 stroke-[3] mt-0.5 text-gym-bg" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center leading-none">
            <span className="text-lg font-black">{completedReps}</span>
            <span className="text-[9px] uppercase tracking-tighter opacity-80 font-sans font-bold">miss</span>
          </div>
        )}
      </button>
    </div>
  );
};
