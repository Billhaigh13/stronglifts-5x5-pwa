import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnalyticsScreen } from '../../components/AnalyticsScreen';
import type { ExerciseId, ExerciseProgressState, WorkoutSession } from '../../types';

describe('AnalyticsScreen Component', () => {
  const sampleWorkouts: WorkoutSession[] = [
    {
      id: 1,
      type: 'A',
      sessionCategory: 'strength',
      date: '2026-08-24T10:00:00.000Z',
      startTime: 1787565600000,
      durationSeconds: 2700,
      completed: true,
      exerciseLogs: [
        {
          exerciseId: 'squat',
          exerciseName: 'Barbell Squat',
          targetWeight: 100,
          targetReps: [5, 5, 5, 5, 5],
          completedReps: [5, 5, 5, 5, 5],
          completed: true,
          isPR: true,
        },
      ],
    },
    {
      id: 2,
      type: 'A',
      sessionCategory: 'mobility',
      programName: "Lifter's Rest Day Flow",
      date: '2026-08-25T10:00:00.000Z',
      startTime: 1787652000000,
      durationSeconds: 600,
      completed: true,
      exerciseLogs: [],
    },
  ];

  const sampleProgress: Record<ExerciseId, ExerciseProgressState> = {
    squat: {
      currentWeight: 100,
      consecutiveFailures: 0,
      history: [],
      allTimePRWeight: 100,
      allTimePRReps: 5,
    },
  } as unknown as Record<ExerciseId, ExerciseProgressState>;

  it('renders strength, volume, and active recovery metrics', () => {
    render(
      <AnalyticsScreen
        workouts={sampleWorkouts}
        exerciseProgress={sampleProgress}
        unit="kg"
      />
    );

    expect(screen.getByTestId('analytics-screen')).toBeInTheDocument();
    expect(screen.getByText('Progression & Analytics')).toBeInTheDocument();
    expect(screen.getByText('10 min total')).toBeInTheDocument(); // 600s / 60 = 10 min
    expect(screen.getByText('1 Flows Logged')).toBeInTheDocument();
    expect(screen.getByText('Active Recovery & Joint Health')).toBeInTheDocument();
  });
});
