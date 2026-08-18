import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProgressionSettingsModal } from '../../components/ProgressionSettingsModal';
import { DEFAULT_DUMBBELL_INVENTORY, DEFAULT_PROGRESSION_CONFIGS } from '../../utils/constants';

describe('ProgressionSettingsModal Component', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ProgressionSettingsModal
        isOpen={false}
        onClose={vi.fn()}
        dumbbellInventory={DEFAULT_DUMBBELL_INVENTORY}
        onSaveConfigs={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders progression rules modal and category tabs when open', () => {
    render(
      <ProgressionSettingsModal
        isOpen={true}
        onClose={vi.fn()}
        dumbbellInventory={DEFAULT_DUMBBELL_INVENTORY}
        onSaveConfigs={vi.fn()}
        progressionConfigs={DEFAULT_PROGRESSION_CONFIGS}
      />
    );

    expect(screen.getByText('Progression Rules')).toBeInTheDocument();
    expect(screen.getByText('Barbell Lifts')).toBeInTheDocument();
    expect(screen.getByText('Dumbbells')).toBeInTheDocument();
    expect(screen.getByText('Bodyweight')).toBeInTheDocument();
    expect(screen.getAllByText('Barbell Squat').length).toBeGreaterThanOrEqual(1);
  });

  it('saves customized increment rules on Save button click', () => {
    const handleSave = vi.fn();
    const handleClose = vi.fn();

    render(
      <ProgressionSettingsModal
        isOpen={true}
        onClose={handleClose}
        dumbbellInventory={DEFAULT_DUMBBELL_INVENTORY}
        onSaveConfigs={handleSave}
        progressionConfigs={DEFAULT_PROGRESSION_CONFIGS}
      />
    );

    // Select +1.25 microloading increment for Squat
    const microloadBtn = screen.getByText('+1.25');
    fireEvent.click(microloadBtn);

    const saveBtn = screen.getByText('Save & Apply Rules');
    fireEvent.click(saveBtn);

    expect(handleSave).toHaveBeenCalledTimes(1);
    const savedConfigs = handleSave.mock.calls[0][0];
    expect(savedConfigs.squat.increment).toBe(1.25);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
