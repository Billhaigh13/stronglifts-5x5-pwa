import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WeeklyScheduleStrip } from '../../components/WeeklyScheduleStrip';
import type { SchedulePreference, WorkoutSession } from '../../types';

describe('WeeklyScheduleStrip Component', () => {
  const samplePreference: SchedulePreference = {
    pattern: 'mon_wed_fri',
    workoutDays: [1, 3, 5],
    mobilityDays: [2, 4, 6],
    restDays: [0],
  };

  const sampleWorkouts: WorkoutSession[] = [];

  it('renders 7 days of the week and pattern badge', () => {
    render(
      <WeeklyScheduleStrip
        schedulePreference={samplePreference}
        workouts={sampleWorkouts}
      />
    );

    expect(screen.getByTestId('weekly-schedule-strip')).toBeInTheDocument();
    expect(screen.getByText('Mon / Wed / Fri')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Sun')).toBeInTheDocument();
  });

  it('calls onOpenScheduleSettings when settings icon is clicked', () => {
    const handleOpenSettings = vi.fn();

    render(
      <WeeklyScheduleStrip
        schedulePreference={samplePreference}
        workouts={sampleWorkouts}
        onOpenScheduleSettings={handleOpenSettings}
      />
    );

    const btn = screen.getByLabelText(/Configure Weekly Schedule/i);
    fireEvent.click(btn);
    expect(handleOpenSettings).toHaveBeenCalledTimes(1);
  });
});
