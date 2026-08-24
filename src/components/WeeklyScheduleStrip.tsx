import React from 'react';
import { Check, Dumbbell, Calendar, Settings, Activity, Moon } from 'lucide-react';
import type { SchedulePreference, WorkoutSession } from '../types';
import { getWeeklySchedule, type DayScheduleItem } from '../utils/schedule';
import { DEFAULT_SCHEDULE_PREFERENCE } from '../utils/constants';

interface WeeklyScheduleStripProps {
  schedulePreference?: SchedulePreference;
  workouts: WorkoutSession[];
  lastWorkout?: WorkoutSession;
  onSelectDay?: (day: DayScheduleItem) => void;
  onOpenScheduleSettings?: () => void;
}

export const WeeklyScheduleStrip: React.FC<WeeklyScheduleStripProps> = ({
  schedulePreference = DEFAULT_SCHEDULE_PREFERENCE,
  workouts,
  lastWorkout,
  onSelectDay,
  onOpenScheduleSettings,
}) => {
  const weekDays = getWeeklySchedule(schedulePreference, new Date(), workouts, lastWorkout);
  const todayItem = weekDays.find((d) => d.isToday) || weekDays[0];

  return (
    <div
      data-testid="weekly-schedule-strip"
      className="bg-gym-card rounded-3xl border border-gym-border/80 p-3.5 shadow-md space-y-2.5"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-gym-accent" />
          <span className="text-[11px] font-black uppercase tracking-wider text-gym-text">
            Weekly Schedule
          </span>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-gym-surface text-gym-muted border border-gym-border/60">
            {schedulePreference.pattern === 'mon_wed_fri'
              ? 'Mon / Wed / Fri'
              : schedulePreference.pattern === 'tue_thu_sat'
              ? 'Tue / Thu / Sat'
              : schedulePreference.pattern === 'every_other_day'
              ? 'Every Other Day'
              : 'Custom'}
          </span>
        </div>

        {onOpenScheduleSettings && (
          <button
            type="button"
            onClick={onOpenScheduleSettings}
            className="p-1 rounded-lg text-gym-dimmed hover:text-gym-accent hover:bg-gym-surface transition-colors tap-active"
            title="Configure Weekly Schedule"
            aria-label="Configure Weekly Schedule"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 7-Day Matrix Strip */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => {
          const isSelectedToday = day.isToday;
          const isCompleted = day.status === 'completed';
          const isStrength = day.scheduledType === 'strength';
          const isMobility = day.scheduledType === 'mobility';

          return (
            <button
              key={day.dateKey}
              type="button"
              onClick={() => onSelectDay?.(day)}
              className={`flex flex-col items-center py-2 px-1 rounded-2xl transition-all relative ${
                isSelectedToday
                  ? 'bg-gym-surface/90 border-2 border-gym-accent shadow-glow-emerald/30 ring-1 ring-gym-accent/50'
                  : 'bg-gym-bg/60 border border-gym-border/40 hover:border-gym-border hover:bg-gym-surface/40'
              }`}
            >
              {/* Day Header */}
              <span
                className={`text-[9px] font-black uppercase tracking-wider mb-1 ${
                  isSelectedToday ? 'text-gym-accent' : 'text-gym-muted'
                }`}
              >
                {day.dayName}
              </span>

              {/* Day Date Number */}
              <span
                className={`text-xs font-mono font-bold leading-none mb-1.5 ${
                  isSelectedToday ? 'text-gym-text' : 'text-gym-dimmed'
                }`}
              >
                {day.dayNumber}
              </span>

              {/* Status Indicator Icon Bubble */}
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-black transition-all ${
                  isCompleted
                    ? 'bg-emerald-500 text-gym-bg shadow-sm'
                    : isSelectedToday
                    ? isStrength
                      ? 'bg-gym-accent/20 text-gym-accent border border-gym-accent/50 shadow-glow-emerald/40 animate-pulse'
                      : 'bg-gym-cyan/20 text-gym-cyan border border-gym-cyan/50'
                    : isStrength
                    ? 'bg-gym-surface text-gym-text border border-gym-border/60'
                    : isMobility
                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    : 'bg-transparent text-gym-dimmed'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : isStrength ? (
                  <span>{day.suggestedWorkoutType || 'A'}</span>
                ) : isMobility ? (
                  <Activity className="w-3.5 h-3.5" />
                ) : (
                  <Moon className="w-3 h-3 text-gym-dimmed/40" />
                )}
              </div>

              {/* Tiny Today Indicator Dot */}
              {isSelectedToday && (
                <div className="w-1 h-1 rounded-full bg-gym-accent mt-1 animate-ping" />
              )}
            </button>
          );
        })}
      </div>

      {/* Today Smart Prompt Banner */}
      <div className="bg-gym-bg/80 px-3 py-2 rounded-2xl border border-gym-border/40 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {todayItem.status === 'completed' ? (
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
          ) : todayItem.scheduledType === 'strength' ? (
            <Dumbbell className="w-3.5 h-3.5 text-gym-accent" />
          ) : todayItem.scheduledType === 'mobility' ? (
            <Activity className="w-3.5 h-3.5 text-purple-400" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-gym-muted" />
          )}

          <span className="text-gym-text text-[11px] font-medium">
            {todayItem.status === 'completed' ? (
              <span className="text-emerald-400 font-bold">
                Today's session completed! Great job!
              </span>
            ) : todayItem.scheduledType === 'strength' ? (
              <span>
                Today: <strong className="text-gym-accent">Workout {todayItem.suggestedWorkoutType || 'A'}</strong> scheduled
              </span>
            ) : todayItem.scheduledType === 'mobility' ? (
              <span>
                Today: <strong className="text-purple-400">Active Recovery & Mobility</strong>
              </span>
            ) : (
              <span className="text-gym-muted">Today is a Rest Day 🌱</span>
            )}
          </span>
        </div>

        {todayItem.status === 'completed' && (
          <span className="text-[10px] font-bold text-gym-muted">Logged</span>
        )}
      </div>
    </div>
  );
};
