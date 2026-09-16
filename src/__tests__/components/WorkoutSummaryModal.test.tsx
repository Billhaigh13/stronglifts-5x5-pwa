import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkoutSummaryModal } from '../../components/WorkoutSummaryModal';
import type { ExerciseLog, ProgressionResult } from '../../types';

describe('WorkoutSummaryModal Component', () => {
  const mockExerciseLogs: ExerciseLog[] = [
    {
      exerciseId: 'squat',
      exerciseName: 'Barbell Squat',
      targetWeight: 100,
      targetReps: [5, 5, 5, 5, 5],
      completedReps: [5, 5, 5, 5, 5],
      completed: true,
      isPR: true,
    },
    {
      exerciseId: 'bench',
      exerciseName: 'Barbell Bench Press',
      targetWeight: 75,
      targetReps: [5, 5, 5, 5, 5],
      completedReps: [5, 5, 5, 4, 3],
      completed: true,
    },
  ];

  const mockProgressionResults: Record<string, ProgressionResult> = {
    squat: {
      nextWeight: 102.5,
      consecutiveFailures: 0,
      isDeload: false,
      message: 'Success! +2.5 kg added for next session.',
    },
    bench: {
      nextWeight: 75,
      consecutiveFailures: 1,
      isDeload: false,
      message: 'Incomplete: 22/25 reps. Weight stays at 75 kg. Attempt 1/3.',
    },
  };

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <WorkoutSummaryModal
        isOpen={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
        workoutType="A"
        durationSeconds={2700}
        exerciseLogs={mockExerciseLogs}
        progressionResults={mockProgressionResults}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders summary modal with celebration burst, volume math, and progression results', () => {
    render(
      <WorkoutSummaryModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        workoutType="A"
        durationSeconds={2700} // 45m 0s
        exerciseLogs={mockExerciseLogs}
        progressionResults={mockProgressionResults}
        unit="kg"
      />
    );

    expect(screen.getByText('Workout A Complete!')).toBeInTheDocument();
    expect(screen.getByTestId('celebration-burst')).toBeInTheDocument();
    expect(screen.getByText('45m 0s')).toBeInTheDocument();

    // Volume calculation: Squat (25 * 100 = 2500) + Bench (22 * 75 = 1650) = 4150 kg
    expect(screen.getByText('4150')).toBeInTheDocument();

    // Exercise details & PR
    expect(screen.getByText('Barbell Squat')).toBeInTheDocument();
    expect(screen.getByText('NEW PR!')).toBeInTheDocument();
    expect(screen.getByText('Success! +2.5 kg added for next session.')).toBeInTheDocument();
    expect(screen.getByText('Incomplete: 22/25 reps. Weight stays at 75 kg. Attempt 1/3.')).toBeInTheDocument();
  });

  it('allows entering notes and submitting workout save', () => {
    const handleSave = vi.fn();

    render(
      <WorkoutSummaryModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={handleSave}
        workoutType="A"
        durationSeconds={2700}
        exerciseLogs={mockExerciseLogs}
        progressionResults={mockProgressionResults}
        unit="kg"
      />
    );

    const notesInput = screen.getByPlaceholderText(/Energy felt great/i);
    fireEvent.change(notesInput, { target: { value: 'Smooth squats today!' } });

    const saveButton = screen.getByText('Save & Finish Workout');
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledTimes(1);
    expect(handleSave).toHaveBeenCalledWith('Smooth squats today!');
  });

  it('calls onClose when Review Sets is clicked', () => {
    const handleClose = vi.fn();

    render(
      <WorkoutSummaryModal
        isOpen={true}
        onClose={handleClose}
        onSave={vi.fn()}
        workoutType="A"
        durationSeconds={2700}
        exerciseLogs={mockExerciseLogs}
        progressionResults={mockProgressionResults}
      />
    );

    const reviewButton = screen.getByText('Review Sets');
    fireEvent.click(reviewButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
