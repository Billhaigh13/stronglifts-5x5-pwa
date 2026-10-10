import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InactivityDeloadModal } from '../../components/InactivityDeloadModal';
import type { InactivityDeloadSuggestion } from '../../types';

describe('InactivityDeloadModal Component', () => {
  const mockSuggestions: InactivityDeloadSuggestion[] = [
    {
      exerciseId: 'squat',
      exerciseName: 'Barbell Squat',
      daysElapsed: 16,
      percent: 20,
      currentWeight: 100,
      suggestedWeight: 80,
    },
    {
      exerciseId: 'ohp',
      exerciseName: 'Overhead Press',
      daysElapsed: 25,
      percent: 30,
      currentWeight: 50,
      suggestedWeight: 35,
    },
  ];

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <InactivityDeloadModal
        isOpen={false}
        suggestions={mockSuggestions}
        unit="kg"
        onApplyAndStart={vi.fn()}
        onKeepAndStart={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when suggestions array is empty', () => {
    const { container } = render(
      <InactivityDeloadModal
        isOpen={true}
        suggestions={[]}
        unit="kg"
        onApplyAndStart={vi.fn()}
        onKeepAndStart={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders suggestions with names, days away, percentages, and weights', () => {
    render(
      <InactivityDeloadModal
        isOpen={true}
        suggestions={mockSuggestions}
        unit="kg"
        onApplyAndStart={vi.fn()}
        onKeepAndStart={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Welcome Back!')).toBeDefined();
    expect(screen.getByText('Barbell Squat')).toBeDefined();
    expect(screen.getByText('Overhead Press')).toBeDefined();
    expect(screen.getByText('16 days away')).toBeDefined();
    expect(screen.getByText('25 days away')).toBeDefined();
    expect(screen.getByText('-20%')).toBeDefined();
    expect(screen.getByText('-30%')).toBeDefined();
    expect(screen.getByText(/Apply Selected & Start \(2\)/)).toBeDefined();
  });

  it('applies selected deloads when clicking Apply button', () => {
    const handleApply = vi.fn();
    render(
      <InactivityDeloadModal
        isOpen={true}
        suggestions={mockSuggestions}
        unit="kg"
        onApplyAndStart={handleApply}
        onKeepAndStart={vi.fn()}
        onClose={vi.fn()}
      />
    );

    const applyBtn = screen.getByText(/Apply Selected & Start/);
    fireEvent.click(applyBtn);

    expect(handleApply).toHaveBeenCalledTimes(1);
    expect(handleApply).toHaveBeenCalledWith(['squat', 'ohp']);
  });

  it('allows deselecting and selecting individual exercises', () => {
    const handleApply = vi.fn();
    render(
      <InactivityDeloadModal
        isOpen={true}
        suggestions={mockSuggestions}
        unit="kg"
        onApplyAndStart={handleApply}
        onKeepAndStart={vi.fn()}
        onClose={vi.fn()}
      />
    );

    // Click on Squat to toggle it off
    const squatText = screen.getByText('Barbell Squat');
    fireEvent.click(squatText);

    expect(screen.getByText(/Apply Selected & Start \(1\)/)).toBeDefined();

    const applyBtn = screen.getByText(/Apply Selected & Start/);
    fireEvent.click(applyBtn);

    expect(handleApply).toHaveBeenCalledWith(['ohp']);
  });

  it('triggers onKeepAndStart when clicking Keep Current Weights button', () => {
    const handleKeep = vi.fn();
    render(
      <InactivityDeloadModal
        isOpen={true}
        suggestions={mockSuggestions}
        unit="kg"
        onApplyAndStart={vi.fn()}
        onKeepAndStart={handleKeep}
        onClose={vi.fn()}
      />
    );

    const keepBtn = screen.getByText('Keep Current Weights & Start');
    fireEvent.click(keepBtn);

    expect(handleKeep).toHaveBeenCalledTimes(1);
  });

  it('renders rep ladder progression deloads with clear rep transition notation', () => {
    const repLadderSuggestions: InactivityDeloadSuggestion[] = [
      {
        exerciseId: 'bicep_curl',
        exerciseName: 'Dumbbell Bicep Curls',
        daysElapsed: 10,
        percent: 10,
        currentWeight: 10,
        suggestedWeight: 10,
        currentReps: 12,
        suggestedReps: 10,
      },
      {
        exerciseId: 'hammer_curl',
        exerciseName: 'Dumbbell Hammer Curls',
        daysElapsed: 12,
        percent: 10,
        currentWeight: 10,
        suggestedWeight: 7.5,
        currentReps: 8,
        suggestedReps: 10,
      },
    ];

    render(
      <InactivityDeloadModal
        isOpen={true}
        suggestions={repLadderSuggestions}
        unit="kg"
        onApplyAndStart={vi.fn()}
        onKeepAndStart={vi.fn()}
        onClose={vi.fn()}
      />
    );

    // Dumbbell Bicep Curls: weight is 10 kg, reps step 3×12 -> 3×10
    expect(screen.getByText('Dumbbell Bicep Curls')).toBeDefined();
    expect(screen.getByText('3×12')).toBeDefined();
    expect(screen.getAllByText('3×10').length).toBeGreaterThanOrEqual(1);

    // Dumbbell Hammer Curls: weight drops 10 -> 7.5 kg, reps step 3×8 -> 3×10
    expect(screen.getByText('Dumbbell Hammer Curls')).toBeDefined();
    expect(screen.getByText('3×8')).toBeDefined();
    expect(screen.getByText('7.5')).toBeDefined();
  });
});

