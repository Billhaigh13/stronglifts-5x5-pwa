import React, { useState } from 'react';
import { TrendingUp, Trophy, Sparkles, Activity, Heart } from 'lucide-react';
import type { ExerciseId, ExerciseProgressState, WorkoutSession } from '../types';
import { EXERCISE_DEFINITIONS } from '../utils/constants';
import { calculate1RM } from '../utils/progression';

interface AnalyticsScreenProps {
  workouts: WorkoutSession[];
  exerciseProgress: Record<ExerciseId, ExerciseProgressState>;
  unit: string;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({
  workouts,
  exerciseProgress,
  unit,
}) => {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseId>('squat');

  const exerciseIds = Object.keys(EXERCISE_DEFINITIONS) as ExerciseId[];

  const strengthWorkouts = workouts.filter((w) => w.sessionCategory !== 'mobility');
  const mobilityWorkouts = workouts.filter((w) => w.sessionCategory === 'mobility');

  const totalRecoveryMinutes = Math.round(
    mobilityWorkouts.reduce((acc, w) => acc + w.durationSeconds, 0) / 60
  );

  const chronologicalWorkouts = [...strengthWorkouts].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const isBodyweightSelected =
    (selectedExercise === 'pullups' || selectedExercise === 'dips') &&
    (exerciseProgress[selectedExercise]?.mode === 'bodyweight' || !exerciseProgress[selectedExercise]?.currentWeight);

  const chartData: { date: string; weight: number; totalReps: number; e1rm: number; label: string }[] = [];

  chronologicalWorkouts.forEach((w) => {
    const log = w.exerciseLogs.find((l) => l.exerciseId === selectedExercise);
    if (log && log.completedReps.length > 0) {
      const totalReps = log.completedReps.reduce<number>((acc, r) => acc + (r || 0), 0);
      const maxRep = Math.max(...log.completedReps.map((r) => r || 0));
      const e1rm = calculate1RM(log.targetWeight, maxRep || 5);
      const dateObj = new Date(w.date);
      const label = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;

      chartData.push({
        date: w.date,
        weight: log.targetWeight,
        totalReps,
        e1rm: e1rm,
        label,
      });
    }
  });

  const totalVolume = strengthWorkouts.reduce((total, w) => {
    return (
      total +
      w.exerciseLogs.reduce((acc, log) => {
        const reps = log.completedReps.reduce<number>((rAcc, r) => rAcc + (r || 0), 0);
        return acc + reps * log.targetWeight;
      }, 0)
    );
  }, 0);

  const totalSets = strengthWorkouts.reduce((total, w) => {
    return (
      total +
      w.exerciseLogs.reduce((acc, log) => acc + log.completedReps.filter((r) => r !== null).length, 0)
    );
  }, 0);

  const chartHeight = 160;
  const chartWidth = 320;
  const padding = 25;

  const chartValues = chartData.map((d) => (isBodyweightSelected ? d.totalReps : d.weight));
  const minVal = chartValues.length > 0 ? Math.min(...chartValues) * 0.85 : 0;
  const maxVal = chartValues.length > 0 ? Math.max(...chartValues) * 1.15 : (isBodyweightSelected ? 15 : 100);
  const valRange = Math.max(1, maxVal - minVal);

  const getX = (index: number) => {
    if (chartData.length <= 1) return chartWidth / 2;
    return padding + (index / (chartData.length - 1)) * (chartWidth - padding * 2);
  };

  const getY = (val: number) => {
    return chartHeight - padding - ((val - minVal) / valRange) * (chartHeight - padding * 2);
  };

  const points = chartData.map((d, idx) => `${getX(idx)},${getY(isBodyweightSelected ? d.totalReps : d.weight)}`).join(' ');

  return (
    <div
      data-testid="analytics-screen"
      className="pb-28 max-w-md mx-auto px-4 pt-3 space-y-5 animate-fadeIn"
    >
      <div>
        <h2 className="text-xl font-extrabold text-gym-text tracking-tight">Progression & Analytics</h2>
        <p className="text-xs text-gym-muted">
          Linear strength gains, volume, and active recovery metrics
        </p>
      </div>

      {/* Top 3 High-Level Metrics */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gym-card p-3 rounded-2xl border border-gym-border/80 shadow-sm">
          <div className="text-[10px] font-semibold text-gym-muted uppercase">Lifting</div>
          <div className="text-lg font-mono font-black text-gym-text">{strengthWorkouts.length}</div>
          <div className="text-[9px] text-gym-dimmed">{totalSets} sets</div>
        </div>

        <div className="bg-gym-card p-3 rounded-2xl border border-gym-border/80 shadow-sm">
          <div className="text-[10px] font-semibold text-gym-muted uppercase">Total Lifted</div>
          <div className="text-lg font-mono font-black text-gym-accent truncate">
            {Math.round(totalVolume)} <span className="text-[10px] font-sans font-normal text-gym-muted">{unit}</span>
          </div>
          <div className="text-[9px] text-gym-dimmed">Cumulative</div>
        </div>

        <div className="bg-gym-card p-3 rounded-2xl border border-gym-border/80 shadow-sm">
          <div className="text-[10px] font-semibold text-gym-muted uppercase">Recovery</div>
          <div className="text-lg font-mono font-black text-purple-400">
            {mobilityWorkouts.length}
          </div>
          <div className="text-[9px] text-gym-dimmed">{totalRecoveryMinutes} min total</div>
        </div>
      </div>

      {/* Weight Progression Chart */}
      <div className="bg-gym-card rounded-3xl border border-gym-border/80 p-4 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gym-accent" />
            <h3 className="text-sm font-extrabold text-gym-text uppercase tracking-wider">
              {isBodyweightSelected ? 'Total Reps Progression' : 'Weight Progression Over Time'}
            </h3>
          </div>
          {chartData.length > 0 && (
            <span className="text-xs font-mono font-bold text-gym-accent">
              {isBodyweightSelected
                ? `Last: ${chartData[chartData.length - 1].totalReps} total reps`
                : `Current: ${exerciseProgress[selectedExercise]?.currentWeight || EXERCISE_DEFINITIONS[selectedExercise].defaultWeight} ${unit}`}
            </span>
          )}
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
          {exerciseIds.map((id) => {
            const def = EXERCISE_DEFINITIONS[id];
            const isSelected = selectedExercise === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedExercise(id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all tap-active ${
                  isSelected
                    ? 'bg-gym-accent text-gym-bg shadow-glow-emerald font-black'
                    : 'bg-gym-surface text-gym-muted hover:text-gym-text border border-gym-border/60'
                }`}
              >
                {def.name.split(' ')[0]} {def.name.split(' ')[1] || ''}
              </button>
            );
          })}
        </div>

        {chartData.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-center p-4 bg-gym-bg rounded-2xl border border-gym-border/40 text-gym-muted">
            <p className="text-xs font-bold">No data recorded for {EXERCISE_DEFINITIONS[selectedExercise].name}</p>
            <p className="text-[11px] text-gym-dimmed mt-1">Complete your first session to see your progression line chart.</p>
          </div>
        ) : (
          <div className="h-44 w-full bg-gym-bg rounded-2xl border border-gym-border/40 p-2 relative flex items-center justify-center overflow-hidden">
            <svg
              className="w-full h-full overflow-visible"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#334155" strokeDasharray="3 3" strokeWidth="0.75" />
              <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="#334155" strokeDasharray="3 3" strokeWidth="0.75" />
              <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#334155" strokeWidth="1" />

              {/* Polyline Path */}
              {chartData.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={points}
                  className="drop-shadow-md"
                />
              )}

              {/* Data points */}
              {chartData.map((d, idx) => {
                const cx = getX(idx);
                const val = isBodyweightSelected ? d.totalReps : d.weight;
                const cy = getY(val);

                return (
                  <g key={idx} className="group cursor-pointer">
                    <circle
                      cx={cx}
                      cy={cy}
                      r="4.5"
                      className="fill-gym-accent stroke-gym-bg stroke-2 hover:r-6 transition-all"
                    />
                    <text
                      x={cx}
                      y={chartHeight - 6}
                      fill="#94a3b8"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {d.label}
                    </text>
                    <text
                      x={cx}
                      y={cy - 8}
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {isBodyweightSelected ? `${d.totalReps}r` : d.weight}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>

      {/* Active Recovery & Joint Health Section */}
      <div className="bg-gym-card rounded-3xl border border-gym-border/80 p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-extrabold text-gym-text uppercase tracking-wider">
              Active Recovery & Joint Health
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 rounded-full">
            {mobilityWorkouts.length} Flows Logged
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gym-bg/80 p-3 rounded-2xl border border-gym-border/40 space-y-0.5">
            <span className="text-[10px] font-bold uppercase text-gym-muted">Total Mobility Time</span>
            <div className="text-base font-mono font-bold text-purple-400">
              {totalRecoveryMinutes} mins
            </div>
            <p className="text-[10px] text-gym-dimmed">Dedicated to joint mobility</p>
          </div>

          <div className="bg-gym-bg/80 p-3 rounded-2xl border border-gym-border/40 space-y-0.5">
            <span className="text-[10px] font-bold uppercase text-gym-muted">Lifter Zones Targeted</span>
            <div className="text-base font-mono font-bold text-gym-text">
              {mobilityWorkouts.length > 0 ? 'Hips • Spine • Core' : 'None yet'}
            </div>
            <p className="text-[10px] text-gym-dimmed">Decompression & posture</p>
          </div>
        </div>

        <div className="bg-purple-950/30 border border-purple-500/30 p-3 rounded-2xl flex items-center gap-2.5 text-xs text-purple-200">
          <Heart className="w-4 h-4 text-purple-400 shrink-0" />
          <span className="text-[11px] leading-relaxed">
            Consistent off-day mobility improves squat depth, overhead press posture, and accelerates central nervous system recovery.
          </span>
        </div>
      </div>

      {/* Personal Records Board */}
      <div className="bg-gym-card rounded-3xl border border-gym-border/80 p-4 shadow-md space-y-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-gym-gold" />
          <h3 className="text-sm font-extrabold text-gym-text uppercase tracking-wider">
            Personal Records Board
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {exerciseIds.map((exId) => {
            const def = EXERCISE_DEFINITIONS[exId];
            const prog = exerciseProgress[exId];
            const isBodyweightEx = (exId === 'pullups' || exId === 'dips') && (prog?.mode === 'bodyweight' || !prog?.currentWeight);
            const prWeight = prog?.allTimePRWeight || def.defaultWeight;
            const prReps = prog?.allTimePRReps || (typeof def.defaultTargetReps === 'number' ? def.defaultTargetReps : 5);
            const est1RM = calculate1RM(prWeight, prReps);

            return (
              <div
                key={exId}
                className="bg-gym-bg/80 p-3 rounded-xl border border-gym-border/40 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-gym-text flex items-center gap-1.5">
                    {def.name}
                  </div>
                  <div className="text-[11px] font-mono text-gym-muted mt-0.5">
                    {isBodyweightEx ? (
                      <span className="text-gym-text font-bold">Best Rep PR: {prReps} reps</span>
                    ) : (
                      <>Best Set: <span className="text-gym-text font-bold">{prReps} reps @ {prWeight} {unit}</span></>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-black text-gym-gold flex items-center justify-end gap-1">
                    <Sparkles className="w-3 h-3" />
                    {isBodyweightEx ? `${prReps} Reps` : `${prWeight} ${unit}`}
                  </div>
                  {exId !== 'bicep_curl' && !isBodyweightEx && (
                    <div className="text-[10px] font-mono text-gym-dimmed">
                      Est. 1RM: ~{est1RM} {unit}
                    </div>
                  )}
                  {isBodyweightEx && (
                    <div className="text-[10px] font-mono text-gym-dimmed">
                      Bodyweight
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
