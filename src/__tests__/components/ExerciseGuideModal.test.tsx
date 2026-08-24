import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExerciseGuideModal } from '../../components/ExerciseGuideModal';

describe('ExerciseGuideModal Component', () => {
  it('renders nothing when exerciseId is null', () => {
    const { container } = render(
      <ExerciseGuideModal exerciseId={null} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders exercise guide details, animation image, and muscle badges for Squat', () => {
    render(<ExerciseGuideModal exerciseId="squat" onClose={vi.fn()} />);

    expect(screen.getByText('Barbell Squat')).toBeInTheDocument();
    expect(screen.getByText(/Power Rack & Barbell/i)).toBeInTheDocument();
    expect(screen.getByText(/Quadriceps \(Primary\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Glutes \(Primary\)/i)).toBeInTheDocument();
    expect(screen.getByText('Hamstrings')).toBeInTheDocument();

    const image = screen.getByAltText(/Barbell Squat demonstration/i) as HTMLImageElement;
    expect(image).toBeInTheDocument();
    expect(image.src).toContain('/exercises/squat.gif');

    // Default tab shows setup & execution steps
    expect(screen.getByText(/1. Setup & Stance/i)).toBeInTheDocument();
    expect(screen.getByText(/2. Movement Execution/i)).toBeInTheDocument();
  });

  it('allows switching between Steps, Form Tips, and Breathing tabs', () => {
    render(<ExerciseGuideModal exerciseId="bench" onClose={vi.fn()} />);

    // Switch to Form Tips
    const tipsTab = screen.getByRole('button', { name: /Form Tips/i });
    fireEvent.click(tipsTab);

    expect(screen.getByText(/Pro Form Cues/i)).toBeInTheDocument();
    expect(screen.getByText(/Common Mistakes to Avoid/i)).toBeInTheDocument();

    // Switch to Breathing
    const breathingTab = screen.getByRole('button', { name: /Breathing/i });
    fireEvent.click(breathingTab);

    expect(screen.getByText(/Valsalva & Core Pressure/i)).toBeInTheDocument();
    expect(screen.getByText(/Inhale and brace at the top/i)).toBeInTheDocument();
  });

  it('calls onClose when close button or bottom action button is clicked', () => {
    const handleClose = vi.fn();
    render(<ExerciseGuideModal exerciseId="deadlift" onClose={handleClose} />);

    const closeBtn = screen.getByLabelText(/Close modal/i);
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    const actionBtn = screen.getByText(/Got It, Let's Lift/i);
    fireEvent.click(actionBtn);
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
