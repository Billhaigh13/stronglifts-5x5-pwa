import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Dumbbell,
  Activity,
  Calendar as CalendarIcon,
  Clock
} from 'lucide-react';
import type { SchedulePreference, WorkoutSession } from '../types';
import { getMonthCalendarGrid, formatDateKey, isSameDay } from '../utils/schedule';
import { DEFAULT_SCHEDULE_PREFERENCE } from '../utils/constants';

interface CalendarViewProps {
  workouts: WorkoutSession[];
  unit: string;
  schedulePreference?: SchedulePreference;
  onStartWorkout?: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  workouts,
  unit,
  schedulePreference = DEFAULT_SCHEDULE_PREFERENCE,
  onStartWorkout,
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-indexed
  const [selectedDateKey, setSelectedDateKey] = useState<string>(formatDateKey(today));

  const days = getMonthCalendarGrid(currentYear, currentMonth, workouts, schedulePreference);
  const selectedDayItem = days.find((d) => d.dateKey === selectedDateKey) || days.find((d) => d.isToday) || days[0];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDateKey(formatDateKey(now));
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    return `${mins}m`;
  };

  return (
    <div data-testid="calendar-view" className="space-y-4 animate-fadeIn">
      {/* Calendar Card */}
      <div className="bg-gym-card rounded-3xl border border-gym-border/80 p-4 shadow-md space-y-4">
        {/* Month Navigation Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-gym-text tracking-tight">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h3>
            {(!isSameDay(new Date(currentYear, currentMonth, 1), new Date(today.getFullYear(), today.getMonth(), 1))) && (
              <button
                type="button"
                onClick={handleJumpToday}
                className="px-2 py-0.5 text-[10px] font-bold bg-gym-surface hover:bg-gym-cardHover text-gym-accent rounded-md border border-gym-border/60 tap-active"
              >
                Today
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="w-8 h-8 rounded-xl bg-gym-surface hover:bg-gym-cardHover text-gym-text flex items-center justify-center border border-gym-border/60 transition-colors tap-active"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="w-8 h-8 rounded-xl bg-gym-surface hover:bg-gym-cardHover text-gym-text flex items-center justify-center border border-gym-border/60 transition-colors tap-active"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="text-[10px] font-black uppercase tracking-wider text-gym-muted py-1"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Month Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const isSelected = day.dateKey === selectedDateKey;
            const isCurrentMonth = day.isCurrentMonth;
            const isToday = day.isToday;

            return (
              <button
                key={day.dateKey}
                type="button"
                onClick={() => setSelectedDateKey(day.dateKey)}
                className={`min-h-[52px] sm:min-h-[58px] p-1 rounded-2xl flex flex-col items-center justify-between transition-all relative tap-active ${
                  isSelected
                    ? 'bg-gym-surface/90 border-2 border-gym-accent shadow-glow-emerald/30 ring-1 ring-gym-accent/50'
                    : isToday
                    ? 'bg-gym-surface/50 border border-gym-accent/60'
                    : isCurrentMonth
                    ? 'bg-gym-bg/70 border border-gym-border/40 hover:bg-gym-surface/40'
                    : 'bg-gym-bg/20 border border-gym-border/10 opacity-35'
                }`}
              >
                {/* Day Date */}
                <span
                  className={`text-[11px] font-mono font-bold leading-none mt-0.5 ${
                    isSelected
                      ? 'text-gym-accent'
                      : isToday
                      ? 'text-gym-accent'
                      : isCurrentMonth
                      ? 'text-gym-text'
                      : 'text-gym-dimmed'
                  }`}
                >
                  {day.dayNumber}
                </span>

                {/* Workout Indicators / Badges */}
                <div className="flex items-center justify-center gap-0.5 my-auto">
                  {day.hasStrength ? (
                    <span className="w-5 h-5 rounded-lg bg-emerald-500 text-gym-bg text-[9px] font-black flex items-center justify-center shadow-sm">
                      {day.strengthWorkoutType || '✓'}
                    </span>
                  ) : day.hasMobility ? (
                    <span className="w-5 h-5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/40 text-[9px] font-black flex items-center justify-center">
                      <Activity className="w-3 h-3" />
                    </span>
                  ) : isToday && day.scheduledType === 'strength' ? (
                    <span className="w-2 h-2 rounded-full bg-gym-accent animate-ping" />
                  ) : null}

                  {day.hasPR && (
                    <Sparkles className="w-2.5 h-2.5 text-gym-gold absolute top-1 right-1" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 pt-2 border-t border-gym-border/40 text-[10px] text-gym-muted">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-emerald-500 text-gym-bg text-[8px] font-bold flex items-center justify-center">A</span>
            <span>Strength Lift</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center text-[8px] font-bold">🧘</span>
            <span>Mobility Flow</span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-gym-gold" />
            <span>New PR</span>
          </div>
        </div>
      </div>

      {/* Selected Date Detail Card */}
      {selectedDayItem && (
        <div className="bg-gym-card rounded-3xl border border-gym-border/80 p-4 shadow-md space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gym-border/60">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-gym-muted flex items-center gap-1.5">
                <CalendarIcon className="w-3 h-3 text-gym-accent" />
                {selectedDayItem.date.toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
              <h4 className="text-sm font-black text-gym-text mt-0.5">
                {selectedDayItem.completedWorkouts.length > 0
                  ? `Completed Sessions (${selectedDayItem.completedWorkouts.length})`
                  : selectedDayItem.isToday
                  ? "Today's Schedule"
                  : selectedDayItem.isFuture
                  ? 'Upcoming Scheduled Activity'
                  : 'Past Rest Day'}
              </h4>
            </div>

            {selectedDayItem.isToday && selectedDayItem.completedWorkouts.length === 0 && onStartWorkout && (
              <button
                type="button"
                onClick={onStartWorkout}
                className="py-1.5 px-3 bg-gym-accent hover:bg-emerald-500 text-gym-bg font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-glow-emerald tap-active flex items-center gap-1"
              >
                <Dumbbell className="w-3.5 h-3.5" /> Start
              </button>
            )}
          </div>

          {/* Logged Workouts Details */}
          {selectedDayItem.completedWorkouts.length > 0 ? (
            <div className="space-y-3">
              {selectedDayItem.completedWorkouts.map((workout, idx) => {
                const totalVol = workout.exerciseLogs.reduce((acc, log) => {
                  const repsSum = log.completedReps.reduce<number>((rAcc, r) => rAcc + (r || 0), 0);
                  return acc + repsSum * log.targetWeight;
                }, 0);

                return (
                  <div
                    key={workout.id || idx}
                    className="bg-gym-bg/80 p-3.5 rounded-2xl border border-gym-border/60 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl bg-gym-accent/20 border border-gym-accent/40 text-gym-accent font-black text-xs flex items-center justify-center">
                          {workout.type}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-gym-text">
                            Workout {workout.type}
                          </div>
                          <div className="text-[10px] text-gym-muted font-mono flex items-center gap-2">
                            <span><Clock className="w-2.5 h-2.5 inline mr-0.5" />{formatDuration(workout.durationSeconds)}</span>
                            <span>•</span>
                            <span>{Math.round(totalVol)} {unit} volume</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Exercises list */}
                    <div className="space-y-1.5 pt-1">
                      {workout.exerciseLogs.map((log) => (
                        <div
                          key={log.exerciseId}
                          className="flex items-center justify-between text-xs bg-gym-card px-2.5 py-1.5 rounded-xl border border-gym-border/40"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gym-text">
                              {log.exerciseName}
                            </span>
                            {log.isPR && (
                              <span className="bg-gym-gold/20 text-gym-gold text-[9px] font-black px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5" /> PR
                              </span>
                            )}
                          </div>

                          <div className="font-mono text-xs">
                            <span className="text-gym-accent font-bold">
                              {log.targetWeight} {unit}
                            </span>
                            <span className="text-gym-muted text-[11px] ml-1.5">
                              ({log.completedReps.filter((r) => r !== null).join('-')})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {workout.notes && (
                      <div className="text-[11px] text-gym-dimmed italic bg-gym-surface/60 p-2 rounded-lg border border-gym-border/40">
                        "{workout.notes}"
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 bg-gym-bg/50 rounded-2xl border border-gym-border/40 space-y-1">
              <div className="text-xs text-gym-text font-bold">
                {selectedDayItem.scheduledType === 'strength'
                  ? 'Scheduled Barbell Workout'
                  : selectedDayItem.scheduledType === 'mobility'
                  ? 'Scheduled Active Recovery & Mobility Flow'
                  : 'Rest & Recovery Day'}
              </div>
              <p className="text-[11px] text-gym-muted">
                {selectedDayItem.scheduledType === 'strength'
                  ? 'No workout logged yet for this date.'
                  : selectedDayItem.scheduledType === 'mobility'
                  ? 'Take 10 minutes to stretch your hips and spine.'
                  : 'No scheduled activities for this date.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
