import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProgramSelectorModal } from '../../components/ProgramSelectorModal';

describe('ProgramSelectorModal Component', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ProgramSelectorModal
        isOpen={false}
        onClose={vi.fn()}
        activeProgramId="bill_lifts"
        onSelectProgram={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders all program options and highlights active program', () => {
    render(
      <ProgramSelectorModal
        isOpen={true}
        onClose={vi.fn()}
        activeProgramId="bill_lifts"
        onSelectProgram={vi.fn()}
      />
    );

    expect(screen.getByText('Training Programs')).toBeInTheDocument();
    expect(screen.getByText('BillLifts')).toBeInTheDocument();
    expect(screen.getByText('StrongLifts 5×5 (Classic)')).toBeInTheDocument();
    expect(screen.getByText('Active Program')).toBeInTheDocument();
  });

  it('calls onSelectProgram with chosen program ID', () => {
    const handleSelect = vi.fn();
    const handleClose = vi.fn();

    render(
      <ProgramSelectorModal
        isOpen={true}
        onClose={handleClose}
        activeProgramId="bill_lifts"
        onSelectProgram={handleSelect}
      />
    );

    const classicOption = screen.getByText('StrongLifts 5×5 (Classic)');
    fireEvent.click(classicOption);

    expect(handleSelect).toHaveBeenCalledWith('classic_5x5');
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
