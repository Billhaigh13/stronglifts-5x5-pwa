import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HistoryScreen } from '../../components/HistoryScreen';
import type { WorkoutSession } from '../../types';

describe('HistoryScreen Component', () => {
  const sampleWorkouts: WorkoutSession[] = [
    {
      id: 1,
      type: 'A',
      sessionCategory: 'strength',
      programName: 'BillLifts',
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
      notes: 'Great hip and spine decompression.',
    },
  ];

  it('renders filter chips and all session cards by default', () => {
    render(
      <HistoryScreen
        workouts={sampleWorkouts}
        unit="kg"
        onRefresh={vi.fn()}
        onStartWorkout={vi.fn()}
      />
    );

    expect(screen.getByTestId('history-screen')).toBeInTheDocument();
    expect(screen.getByText(/All \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Strength \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Mobility \(1\)/i)).toBeInTheDocument();

    expect(screen.getByText('Workout A')).toBeInTheDocument();
    expect(screen.getByText("Lifter's Rest Day Flow")).toBeInTheDocument();
  });

  it('filters by Strength when Strength chip is clicked', () => {
    render(
      <HistoryScreen
        workouts={sampleWorkouts}
        unit="kg"
        onRefresh={vi.fn()}
        onStartWorkout={vi.fn()}
      />
    );

    const strengthChip = screen.getByText(/Strength \(1\)/i);
    fireEvent.click(strengthChip);

    expect(screen.getByText('Workout A')).toBeInTheDocument();
    expect(screen.queryByText("Lifter's Rest Day Flow")).not.toBeInTheDocument();
  });

  it('filters by Mobility when Mobility chip is clicked', () => {
    render(
      <HistoryScreen
        workouts={sampleWorkouts}
        unit="kg"
        onRefresh={vi.fn()}
        onStartWorkout={vi.fn()}
      />
    );

    const mobilityChip = screen.getByText(/Mobility \(1\)/i);
    fireEvent.click(mobilityChip);

    expect(screen.getByText("Lifter's Rest Day Flow")).toBeInTheDocument();
    expect(screen.queryByText('Workout A')).not.toBeInTheDocument();
  });

  it('expands session card and displays notes when clicked', () => {
    render(
      <HistoryScreen
        workouts={sampleWorkouts}
        unit="kg"
        onRefresh={vi.fn()}
        onStartWorkout={vi.fn()}
      />
    );

    const mobilityCard = screen.getByText("Lifter's Rest Day Flow");
    fireEvent.click(mobilityCard);

    expect(screen.getByText(/"Great hip and spine decompression."/i)).toBeInTheDocument();
    expect(screen.getByText(/Delete Entry/i)).toBeInTheDocument();
  });
});
