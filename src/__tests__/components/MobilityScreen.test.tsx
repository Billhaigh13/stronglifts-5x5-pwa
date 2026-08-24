import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobilityScreen } from '../../components/MobilityScreen';
import { MOBILITY_ROUTINES } from '../../data/mobilityRoutines';

describe('MobilityScreen Component', () => {
  it('renders all routine cards and category filter pills', () => {
    render(<MobilityScreen onStartRoutine={vi.fn()} />);

    expect(screen.getByTestId('mobility-screen')).toBeInTheDocument();
    expect(screen.getByText("Lifter's Rest Day Flow")).toBeInTheDocument();
    expect(screen.getByText('Deep Squat Hip & Ankle Opener')).toBeInTheDocument();
    expect(screen.getByText('All Flows')).toBeInTheDocument();
    expect(screen.getByText('Pilates')).toBeInTheDocument();
  });

  it('filters routines when a category pill is clicked', () => {
    render(<MobilityScreen onStartRoutine={vi.fn()} />);

    const pilatesTab = screen.getByText('Pilates');
    fireEvent.click(pilatesTab);

    expect(screen.getByText('Pilates Core & Pelvic Stability')).toBeInTheDocument();
    expect(screen.queryByText('Deep Squat Hip & Ankle Opener')).not.toBeInTheDocument();
  });

  it('opens individual pose detail modal when a pose pill is clicked', () => {
    render(<MobilityScreen onStartRoutine={vi.fn()} />);

    const catCowPill = screen.getAllByText('Cat-Cow Flow')[0];
    fireEvent.click(catCowPill);

    expect(screen.getByTestId('pose-detail-modal')).toBeInTheDocument();
    expect(screen.getByText(/Step-by-Step Cues:/i)).toBeInTheDocument();
    expect(screen.getByText(/Where You Should Feel It:/i)).toBeInTheDocument();
    expect(screen.getByText(/Beginner Modification:/i)).toBeInTheDocument();
  });

  it('calls onStartRoutine when Start Guided Flow is clicked', () => {
    const handleStart = vi.fn();
    render(<MobilityScreen onStartRoutine={handleStart} />);

    const startBtns = screen.getAllByText(/Start Guided Flow/i);
    fireEvent.click(startBtns[0]);

    expect(handleStart).toHaveBeenCalledTimes(1);
    expect(handleStart).toHaveBeenCalledWith(MOBILITY_ROUTINES[0]);
  });
});
