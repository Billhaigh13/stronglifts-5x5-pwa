import React, { useState } from 'react';
import { TrendingUp, Trophy, Sparkles, BarChart2 } from 'lucide-react';
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

  const chronologicalWorkouts = [...workouts].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const chartData: { date: string; weight: number; e1rm: number; label: string }[] = [];

  chronologicalWorkouts.forEach((w) => {
    const log = w.exerciseLogs.find((l) => l.exerciseId === selectedExercise);
    if (log && log.completedReps.length > 0) {
      const maxRep = Math.max(...log.completedReps.map((r) => r || 0));
      const e1rm = calculate1RM(log.targetWeight, maxRep || 5);
      const dateObj = new Date(w.date);
      const label = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;

      chartData.push({
        date: w.date,
        weight: log.targetWeight,
        e1rm: e1rm,
        label,
      });
    }
  });

  const totalVolume = workouts.reduce((total, w) => {
    return (
      total +
      w.exerciseLogs.reduce((acc, log) => {
        const reps = log.completedReps.reduce<number>((rAcc, r) => rAcc + (r || 0), 0);
        return acc + reps * log.targetWeight;
      }, 0)
    );
  }, 0);

  const totalSets = workouts.reduce((total, w) => {
    return (
      total +
      w.exerciseLogs.reduce((acc, log) => acc + log.completedReps.filter((r) => r !== null).length, 0)
    );
  }, 0);

  const chartHeight = 160;
  const chartWidth = 320;
  const padding = 25;

  const weights = chartData.map((d) => d.weight);
  const minWeight = weights.length > 0 ? Math.min(...weights) * 0.85 : 0;
  const maxWeight = weights.length > 0 ? Math.max(...weights) * 1.15 : 100;
  const weightRange = Math.max(1, maxWeight - minWeight);

  const getX = (index: number) => {
    if (chartData.length <= 1) return chartWidth / 2;
    return padding + (index / (chartData.length - 1)) * (chartWidth - padding * 2);
  };

  const getY = (val: number) => {
    return chartHeight - padding - ((val - minWeight) / weightRange) * (chartHeight - padding * 2);
  };

  const points = chartData.map((d, idx) => `${getX(idx)},${getY(d.weight)}`).join(' ');

  return (
    <div className="pb-28 max-w-md mx-auto px-4 pt-3 space-y-5 animate-fadeIn">
      <div>
        <h2 className="text-xl font-extrabold text-gym-text tracking-tight">Progression & Analytics</h2>
        <p className="text-xs text-gym-muted">
          Linear strength gains and personal records
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gym-card p-3 rounded-2xl border border-gym-border/80 shadow-sm">
          <div className="text-[10px] font-semibold text-gym-muted uppercase">Sessions</div>
          <div className="text-lg font-mono font-black text-gym-text">{workouts.length}</div>
        </div>
        <div className="bg-gym-card p-3 rounded-2xl border border-gym-border/80 shadow-sm">
          <div className="text-[10px] font-semibold text-gym-muted uppercase">Total Sets</div>
          <div className="text-lg font-mono font-black text-gym-cyan">{totalSets}</div>
        </div>
        <div className="bg-gym-card p-3 rounded-2xl border border-gym-border/80 shadow-sm">
          <div className="text-[10px] font-semibold text-gym-muted uppercase">Total Lifted</div>
          <div className="text-lg font-mono font-black text-gym-accent truncate">
            {Math.round(totalVolume)} <span className="text-[10px] font-sans font-normal text-gym-muted">{unit}</span>
          </div>
        </div>
      </div>

      <div className="bg-gym-card rounded-3xl border border-gym-border/80 p-4 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gym-accent" />
            <h3 className="text-sm font-extrabold text-gym-text uppercase tracking-wider">
              Weight Progression Over Time
            </h3>
          </div>
          {chartData.length > 0 && (
            <span className="text-xs font-mono font-bold text-gym-accent">
              Current: {exerciseProgress[selectedExercise]?.currentWeight || EXERCISE_DEFINITIONS[selectedExercise].defaultWeight} {unit}
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
          <div className="h-40 bg-gym-bg/80 rounded-2xl border border-gym-border/40 flex flex-col items-center justify-center text-center p-4">
            <BarChart2 className="w-8 h-8 text-gym-dimmed mb-1" />
            <div className="text-xs font-bold text-gym-muted">No data logged yet for this lift</div>
            <div className="text-[10px] text-gym-dimmed mt-0.5">
              Complete a session including {EXERCISE_DEFINITIONS[selectedExercise].name} to see chart.
            </div>
          </div>
        ) : (
          <div className="bg-gym-bg/90 p-3 rounded-2xl border border-gym-border/40">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-40 overflow-visible"
            >
              {[0, 0.5, 1].map((ratio, idx) => {
                const y = padding + ratio * (chartHeight - padding * 2);
                const weightVal = Math.round(maxWeight - ratio * weightRange);
                return (
                  <g key={idx}>
                    <line
                      x1={padding}
                      y1={y}
                      x2={chartWidth - padding}
                      y2={y}
                      stroke="#2a364f"
                      strokeDasharray="3 3"
                      strokeWidth="1"
                    />
                    <text
                      x={padding - 4}
                      y={y + 3}
                      fill="#64748b"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      {weightVal}
                    </text>
                  </g>
                );
              })}

              {chartData.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={points}
                />
              )}

              {chartData.map((d, idx) => {
                const cx = getX(idx);
                const cy = getY(d.weight);

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
                      {d.weight}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>

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
                    Best Set: <span className="text-gym-text font-bold">{prReps} reps @ {prWeight} {unit}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-black text-gym-gold flex items-center justify-end gap-1">
                    <Sparkles className="w-3 h-3" />
                    {prWeight} {unit}
                  </div>
                  {exId !== 'bicep_curl' && (
                    <div className="text-[10px] font-mono text-gym-dimmed">
                      Est. 1RM: ~{est1RM} {unit}
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
