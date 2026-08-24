import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobilityPlayerModal } from '../../components/MobilityPlayerModal';
import { MOBILITY_ROUTINES } from '../../data/mobilityRoutines';

describe('MobilityPlayerModal Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing when isOpen is false or routine is null', () => {
    const { container } = render(
      <MobilityPlayerModal
        routine={null}
        isOpen={false}
        onClose={vi.fn()}
        onComplete={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders routine title, pose name, countdown timer and controls', () => {
    const sampleRoutine = MOBILITY_ROUTINES[0]; // Lifter's Rest Day Flow

    render(
      <MobilityPlayerModal
        routine={sampleRoutine}
        isOpen={true}
        onClose={vi.fn()}
        onComplete={vi.fn()}
      />
    );

    expect(screen.getByTestId('mobility-player-modal')).toBeInTheDocument();
    expect(screen.getByText(sampleRoutine.name)).toBeInTheDocument();
    expect(screen.getByText(/Cat-Cow Flow/i)).toBeInTheDocument();
    expect(screen.getByText(/Pause/i)).toBeInTheDocument();
  });

  it('toggles pause and resume when pause button is clicked', () => {
    const sampleRoutine = MOBILITY_ROUTINES[0];

    render(
      <MobilityPlayerModal
        routine={sampleRoutine}
        isOpen={true}
        onClose={vi.fn()}
        onComplete={vi.fn()}
      />
    );

    const pauseBtn = screen.getByText(/Pause/i);
    fireEvent.click(pauseBtn);
    expect(screen.getByText(/Resume/i)).toBeInTheDocument();

    const resumeBtn = screen.getByText(/Resume/i);
    fireEvent.click(resumeBtn);
    expect(screen.getByText(/Pause/i)).toBeInTheDocument();
  });

  it('allows skipping to next pose and finishing the routine', () => {
    const sampleRoutine = MOBILITY_ROUTINES[4]; // Bedtime Wind-Down (short)
    const handleComplete = vi.fn();

    render(
      <MobilityPlayerModal
        routine={sampleRoutine}
        isOpen={true}
        onClose={vi.fn()}
        onComplete={handleComplete}
      />
    );

    const skipBtn = screen.getByLabelText(/Skip to next step/i);

    // Skip through all steps
    for (let i = 0; i < 10; i++) {
      if (screen.queryByText(/Active Recovery Complete/i)) break;
      fireEvent.click(skipBtn);
    }

    expect(screen.getByText(/Active Recovery Complete/i)).toBeInTheDocument();
    const saveBtn = screen.getByText(/Save Recovery Session/i);
    fireEvent.click(saveBtn);
    expect(handleComplete).toHaveBeenCalledTimes(1);
  });
});
