import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScheduleSettingsModal } from '../../components/ScheduleSettingsModal';
import type { SchedulePreference } from '../../types';

describe('ScheduleSettingsModal Component', () => {
  const samplePreference: SchedulePreference = {
    pattern: 'mon_wed_fri',
    workoutDays: [1, 3, 5],
    mobilityDays: [2, 4, 6],
    restDays: [0],
  };

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ScheduleSettingsModal
        isOpen={false}
        onClose={vi.fn()}
        schedulePreference={samplePreference}
        onSavePreference={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders preset options and allows selecting Tuesday / Thursday / Saturday', () => {
    const handleSave = vi.fn();
    render(
      <ScheduleSettingsModal
        isOpen={true}
        onClose={vi.fn()}
        schedulePreference={samplePreference}
        onSavePreference={handleSave}
      />
    );

    expect(screen.getByText(/Training Schedule/i)).toBeInTheDocument();
    expect(screen.getByText(/Monday \/ Wednesday \/ Friday/i)).toBeInTheDocument();
    expect(screen.getByText(/Tuesday \/ Thursday \/ Saturday/i)).toBeInTheDocument();

    const tueThuSatOption = screen.getByText(/Tuesday \/ Thursday \/ Saturday/i);
    fireEvent.click(tueThuSatOption);

    const saveBtn = screen.getByText(/Save Schedule/i);
    fireEvent.click(saveBtn);

    expect(handleSave).toHaveBeenCalledTimes(1);
    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        pattern: 'tue_thu_sat',
        workoutDays: [2, 4, 6],
      })
    );
  });
});
