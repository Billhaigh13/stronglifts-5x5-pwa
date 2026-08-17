import React from 'react';
import { Dumbbell } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  isWorkoutActive: boolean;
  workoutDuration: number;
  workoutType?: 'A' | 'B';
  onNavigateToWorkout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isWorkoutActive,
  workoutDuration,
  workoutType,
  onNavigateToWorkout,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-30 bg-gym-bg/95 backdrop-blur-md border-b border-gym-border/60 px-4 status-bar-safe-top pb-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gym-accent/15 border border-gym-accent/30 flex items-center justify-center text-gym-accent shadow-glow-emerald/30">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-gym-text flex items-center gap-1.5">
              STRONGLIFTS <span className="text-gym-accent font-black">5×5</span>
            </h1>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-gym-muted">
              Offline Mobile Tracker
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isWorkoutActive && (
            <button
              type="button"
              onClick={onNavigateToWorkout}
              className="flex items-center gap-2 bg-gym-surface/90 hover:bg-gym-cardHover border border-gym-cyan/40 px-3 py-1.5 rounded-full shadow-glow-cyan/20 tap-active cursor-pointer transition-colors"
              title="Return to Active Workout"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gym-cyan opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gym-cyan"></span>
              </span>
              <span className="text-xs font-bold text-gym-cyan uppercase">
                {workoutType ? `Workout ${workoutType}` : 'Active'}
              </span>
              <span className="text-xs font-mono font-bold text-gym-text">
                {formatTime(workoutDuration)}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
