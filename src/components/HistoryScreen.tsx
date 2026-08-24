import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  List,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  MessageSquare,
  Plus,
  Dumbbell,
  Activity
} from 'lucide-react';
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
  const [filterCategory, setFilterCategory] = useState<'all' | 'strength' | 'mobility'>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this session from your history log?')) {
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

  const strengthCount = workouts.filter((w) => w.sessionCategory !== 'mobility').length;
  const mobilityCount = workouts.filter((w) => w.sessionCategory === 'mobility').length;

  const filteredWorkouts = workouts.filter((w) => {
    if (filterCategory === 'strength') return w.sessionCategory !== 'mobility';
    if (filterCategory === 'mobility') return w.sessionCategory === 'mobility';
    return true;
  });

  return (
    <div
      data-testid="history-screen"
      className="pb-28 max-w-md mx-auto px-4 pt-3 space-y-4 animate-fadeIn"
    >
      {/* Header & View Switcher */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-gym-text tracking-tight">Training History</h2>
          <p className="text-xs text-gym-muted">
            {workouts.length} recorded session{workouts.length === 1 ? '' : 's'} ({strengthCount} lifts • {mobilityCount} mobility)
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
      ) : (
        <div className="space-y-3">
          {/* Filter Chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setFilterCategory('all');
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all tap-active ${
                filterCategory === 'all'
                  ? 'bg-gym-surface text-gym-accent border border-gym-accent/50 shadow-sm'
                  : 'bg-gym-card text-gym-muted border border-gym-border/60 hover:text-gym-text'
              }`}
            >
              All ({workouts.length})
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setFilterCategory('strength');
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all tap-active flex items-center gap-1 ${
                filterCategory === 'strength'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-sm'
                  : 'bg-gym-card text-gym-muted border border-gym-border/60 hover:text-gym-text'
              }`}
            >
              <Dumbbell className="w-3 h-3" /> Strength ({strengthCount})
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setFilterCategory('mobility');
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all tap-active flex items-center gap-1 ${
                filterCategory === 'mobility'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-sm'
                  : 'bg-gym-card text-gym-muted border border-gym-border/60 hover:text-gym-text'
              }`}
            >
              <Activity className="w-3 h-3" /> Mobility ({mobilityCount})
            </button>
          </div>

          {filteredWorkouts.length === 0 ? (
            <div className="bg-gym-card rounded-3xl border border-gym-border/80 p-8 text-center space-y-3 my-4">
              <div className="w-14 h-14 rounded-2xl bg-gym-surface flex items-center justify-center text-gym-muted mx-auto border border-gym-border">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gym-text">
                {filterCategory === 'mobility'
                  ? 'No mobility sessions logged yet'
                  : 'No workouts logged yet'}
              </h3>
              <p className="text-xs text-gym-muted max-w-xs mx-auto">
                {filterCategory === 'mobility'
                  ? 'Complete a guided flow on your next rest day to keep your joints healthy.'
                  : 'Start your first StrongLifts 5×5 session today to begin tracking.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredWorkouts.map((workout) => {
                const isExpanded = expandedId === workout.id;
                const isMobility = workout.sessionCategory === 'mobility';

                if (isMobility) {
                  return (
                    <div
                      key={workout.id}
                      onClick={() => setExpandedId(isExpanded ? null : (workout.id || null))}
                      className="bg-gym-card rounded-2xl border border-gym-border/80 hover:border-purple-500/40 p-4 transition-all cursor-pointer shadow-sm space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400 font-black text-xs flex items-center justify-center">
                            🧘
                          </span>
                          <div>
                            <div className="text-xs font-bold text-gym-text flex items-center gap-1.5">
                              <span>{workout.programName || 'Active Recovery Flow'}</span>
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                                Active Recovery
                              </span>
                            </div>
                            <div className="text-[10px] text-gym-muted font-medium">
                              {formatDate(workout.date)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="text-xs font-mono font-bold text-purple-400">
                              {formatDuration(workout.durationSeconds)}
                            </div>
                            <div className="text-[10px] text-gym-muted">
                              Guided Flow
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
                        <div className="mt-2 pt-2 border-t border-gym-border/60 space-y-2 text-xs animate-fadeIn">
                          {workout.notes && (
                            <div className="flex items-start gap-1.5 text-[11px] text-gym-dimmed bg-gym-surface/60 p-2.5 rounded-xl border border-gym-border/40">
                              <MessageSquare className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
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
                }

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
      )}
    </div>
  );
};
