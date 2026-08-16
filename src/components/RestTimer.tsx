import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, Plus, Timer, X } from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

interface RestTimerProps {
  initialSeconds: number;
  isActive: boolean;
  onClose: () => void;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  initialSeconds,
  isActive,
  onClose,
  soundEnabled = true,
  vibrationEnabled = true,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
    setTotalSeconds(initialSeconds);
    setIsRunning(true);
  }, [initialSeconds, isActive]);

  useEffect(() => {
    if (!isActive || !isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          if (soundEnabled) {
            soundEngine.playTimerComplete();
          }
          if (vibrationEnabled) {
            triggerHaptic('timerComplete');
          }
          return 0;
        }

        if (prev <= 4 && soundEnabled) {
          soundEngine.playTick();
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, isRunning, soundEnabled, vibrationEnabled]);

  if (!isActive) return null;

  const handleAdd30 = () => {
    setSecondsLeft((prev) => prev + 30);
    setTotalSeconds((prev) => Math.max(prev, secondsLeft + 30));
    if (vibrationEnabled) triggerHaptic('light');
  };

  const handleTogglePlay = () => {
    setIsRunning((prev) => !prev);
    if (vibrationEnabled) triggerHaptic('light');
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder.toString().padStart(2, '0')}`;
  };

  const progressPercent = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 100;
  const isComplete = secondsLeft === 0;

  return (
    <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-40 animate-slideUp">
      <div className={`p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 ${
        isComplete 
          ? 'bg-gym-accent/95 border-emerald-400 text-gym-bg shadow-glow-emerald animate-pulse-fast' 
          : 'bg-gym-card/95 border-gym-cyan/50 text-gym-text shadow-glow-cyan/20'
      }`}>
        <div className="w-full bg-gym-surface/80 h-1.5 rounded-full overflow-hidden mb-3">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${isComplete ? 'bg-gym-bg' : 'bg-gym-cyan'}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono ${
              isComplete ? 'bg-gym-bg text-gym-accent' : 'bg-gym-cyan/20 text-gym-cyan'
            }`}>
              <Timer className="w-5 h-5" />
            </div>

            <div>
              <div className={`text-[10px] uppercase font-bold tracking-wider ${isComplete ? 'text-gym-bg' : 'text-gym-muted'}`}>
                {isComplete ? 'Rest Complete!' : 'Rest Timer'}
              </div>
              <div className={`text-2xl font-black font-mono tracking-tight ${isComplete ? 'text-gym-bg' : 'text-gym-text'}`}>
                {formatTime(secondsLeft)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {!isComplete && (
              <>
                <button
                  type="button"
                  onClick={handleAdd30}
                  className="px-2.5 py-2 rounded-xl bg-gym-surface hover:bg-gym-cardHover text-gym-text border border-gym-border/80 text-xs font-mono font-bold flex items-center gap-1 tap-active"
                  title="+30 Seconds"
                >
                  <Plus className="w-3.5 h-3.5" />
                  30s
                </button>

                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="w-9 h-9 rounded-xl bg-gym-surface hover:bg-gym-cardHover text-gym-text border border-gym-border/80 flex items-center justify-center tap-active"
                  title={isRunning ? 'Pause' : 'Resume'}
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className={`w-9 h-9 rounded-xl flex items-center justify-center tap-active ${
                isComplete 
                  ? 'bg-gym-bg text-gym-accent font-bold' 
                  : 'bg-gym-surface hover:bg-gym-cardHover text-gym-muted hover:text-gym-text border border-gym-border/80'
              }`}
              title="Close Timer"
            >
              {isComplete ? <CheckmarkIcon /> : <X className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckmarkIcon = () => (
  <svg className="w-5 h-5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
