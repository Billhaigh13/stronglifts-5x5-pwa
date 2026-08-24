import React, { useState } from 'react';
import { Calendar as CalendarIcon, List, Trash2, ChevronDown, ChevronUp, Sparkles, MessageSquare, Plus, Dumbbell } from 'lucide-react';
import type { SchedulePreference, WorkoutSession } from '../types';
import { deleteWorkout } from '../db';
import { triggerHaptic } from '../utils/haptics';
import { CalendarView } from './CalendarView';

interface HistoryScreenProps {
  workouts: WorkoutSession[];
  unit: string;
  schedulePreference?: SchedulePreference;
  onRefresh: () => void;
  onStartWorkout: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  workouts,
  unit,
  schedulePreference,
  onRefresh,
  onStartWorkout,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this workout from your log?')) {
      triggerHaptic('medium');
      await deleteWorkout(id);
      onRefresh();
    }
  };

  const formatDate = (isoStr: string) => {
    const date = new Date(isoStr);
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    return `${mins} min`;
  };

  return (
    <div className="pb-28 max-w-md mx-auto px-4 pt-3 space-y-4 animate-fadeIn">
      {/* Header & View Switcher */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-gym-text tracking-tight">Workout Logs</h2>
          <p className="text-xs text-gym-muted">
            {workouts.length} recorded session{workouts.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented View Switcher */}
          <div className="flex bg-gym-surface p-1 rounded-xl border border-gym-border/80">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setViewMode('list');
              }}
              className={`p-1.5 rounded-lg transition-all flex items-center gap-1 text-xs font-bold ${
                viewMode === 'list'
                  ? 'bg-gym-accent text-gym-bg shadow-sm'
                  : 'text-gym-muted hover:text-gym-text'
              }`}
              title="List View"
              aria-label="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setViewMode('calendar');
              }}
              className={`p-1.5 rounded-lg transition-all flex items-center gap-1 text-xs font-bold ${
                viewMode === 'calendar'
                  ? 'bg-gym-accent text-gym-bg shadow-sm'
                  : 'text-gym-muted hover:text-gym-text'
              }`}
              title="Calendar View"
              aria-label="Calendar View"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onStartWorkout}
            className="px-3 py-1.5 rounded-xl bg-gym-accent/20 hover:bg-gym-accent/30 text-gym-accent border border-gym-accent/40 text-xs font-bold flex items-center gap-1 tap-active"
          >
            <Plus className="w-4 h-4" /> Log
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <CalendarView
          workouts={workouts}
          unit={unit}
          schedulePreference={schedulePreference}
          onStartWorkout={onStartWorkout}
        />
      ) : workouts.length === 0 ? (
        <div className="bg-gym-card rounded-3xl border border-gym-border/80 p-8 text-center space-y-3 my-4">
          <div className="w-14 h-14 rounded-2xl bg-gym-surface flex items-center justify-center text-gym-muted mx-auto border border-gym-border">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gym-text">No workouts logged yet</h3>
          <p className="text-xs text-gym-muted max-w-xs mx-auto">
            Start your first StrongLifts 5×5 session today or load demo data in Settings to preview analytics.
          </p>
          <button
            onClick={onStartWorkout}
            className="mt-2 py-3 px-6 bg-gym-accent text-gym-bg font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-glow-emerald tap-active inline-flex items-center gap-2"
          >
            <Dumbbell className="w-4 h-4" />
            Start Workout
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {workouts.map((workout) => {
            const isExpanded = expandedId === workout.id;
            const totalVolume = workout.exerciseLogs.reduce((acc, log) => {
              const reps = log.completedReps.reduce<number>((rAcc, r) => rAcc + (r || 0), 0);
              return acc + reps * log.targetWeight;
            }, 0);
            const hasPR = workout.exerciseLogs.some((l) => l.isPR);

            return (
              <div
                key={workout.id}
                onClick={() => setExpandedId(isExpanded ? null : (workout.id || null))}
                className="bg-gym-card rounded-2xl border border-gym-border/80 hover:border-gym-border p-4 transition-all cursor-pointer shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-gym-accent/20 border border-gym-accent/40 text-gym-accent font-black text-xs flex items-center justify-center">
                      {workout.type}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-gym-text flex items-center gap-1.5">
                        <span>Workout {workout.type}</span>
                        {workout.programName && (
                          <span className="text-[10px] text-gym-muted font-normal">
                            • {workout.programName}
                          </span>
                        )}
                        {hasPR && (
                          <span className="bg-gym-gold/20 text-gym-gold border border-gym-gold/40 text-[9px] font-black px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" /> PR
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gym-muted font-medium">
                        {formatDate(workout.date)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-gym-accent">
                        {Math.round(totalVolume)} {unit}
                      </div>
                      <div className="text-[10px] font-mono text-gym-muted">
                        {formatDuration(workout.durationSeconds)}
                      </div>
                    </div>

                    <div className="text-gym-dimmed">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gym-border/60 space-y-2.5 text-xs animate-fadeIn">
                    <div className="space-y-1.5">
                      {workout.exerciseLogs.map((log) => (
                        <div
                          key={log.exerciseId}
                          className="flex items-center justify-between p-2 rounded-xl bg-gym-bg/80 border border-gym-border/40"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gym-text">
                              {log.exerciseName}
                            </span>
                            {log.isPR && (
                              <span className="text-gym-gold text-[10px]">★</span>
                            )}
                          </div>

                          <div className="font-mono text-xs">
                            <span className="text-gym-text font-bold">
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
                      <div className="flex items-start gap-1.5 text-[11px] text-gym-dimmed bg-gym-surface/60 p-2.5 rounded-xl border border-gym-border/40">
                        <MessageSquare className="w-3.5 h-3.5 text-gym-accent shrink-0 mt-0.5" />
                        <span className="italic">"{workout.notes}"</span>
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={(e) => handleDelete(workout.id!, e)}
                        className="px-2.5 py-1 text-[11px] font-bold text-gym-danger hover:bg-gym-danger/10 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Entry
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
