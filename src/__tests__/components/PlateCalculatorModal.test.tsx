import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlateCalculatorModal } from '../../components/PlateCalculatorModal';
import { DEFAULT_PLATE_INVENTORY } from '../../utils/constants';

describe('PlateCalculatorModal Component', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <PlateCalculatorModal
        isOpen={false}
        onClose={vi.fn()}
        initialWeight={60}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly with barbell sleeve and weight details', () => {
    render(
      <PlateCalculatorModal
        isOpen={true}
        onClose={vi.fn()}
        initialWeight={60}
        barWeight={20}
        plateInventory={DEFAULT_PLATE_INVENTORY}
        unit="kg"
        exerciseName="Barbell Squat"
      />
    );

    expect(screen.getByText('Plate Calculator')).toBeInTheDocument();
    expect(screen.getByText('Barbell Squat')).toBeInTheDocument();
    expect(screen.getByText('Target Weight')).toBeInTheDocument();
    expect(screen.getByText('Each Side Needs')).toBeInTheDocument();
  });

  it('adjusts weight when +2.5kg button is clicked', () => {
    render(
      <PlateCalculatorModal
        isOpen={true}
        onClose={vi.fn()}
        initialWeight={60}
        barWeight={20}
        plateInventory={DEFAULT_PLATE_INVENTORY}
      />
    );

    const plusBtn = screen.getByTitle('+2.5 kg');
    fireEvent.click(plusBtn);

    expect(screen.getByText(/62.5/)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <PlateCalculatorModal
        isOpen={true}
        onClose={handleClose}
        initialWeight={60}
      />
    );

    const closeBtn = screen.getByText('Close Calculator');
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
