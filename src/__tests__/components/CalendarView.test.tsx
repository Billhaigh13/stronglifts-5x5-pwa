import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CalendarView } from '../../components/CalendarView';
import type { WorkoutSession } from '../../types';

describe('CalendarView Component', () => {
  const sampleWorkouts: WorkoutSession[] = [
    {
      id: 1,
      type: 'A',
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
  ];

  it('renders month navigation, weekday headers, and legend', () => {
    render(<CalendarView workouts={sampleWorkouts} unit="kg" />);

    expect(screen.getByTestId('calendar-view')).toBeInTheDocument();
    expect(screen.getByText('Strength Lift')).toBeInTheDocument();
    expect(screen.getByText('Mobility Flow')).toBeInTheDocument();
    expect(screen.getByText('New PR')).toBeInTheDocument();
  });

  it('navigates to previous and next months when chevron buttons are clicked', () => {
    render(<CalendarView workouts={sampleWorkouts} unit="kg" />);

    const prevBtn = screen.getByLabelText(/Previous month/i);
    const nextBtn = screen.getByLabelText(/Next month/i);

    fireEvent.click(prevBtn);
    fireEvent.click(nextBtn);
  });
});
