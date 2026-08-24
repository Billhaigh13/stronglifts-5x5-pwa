import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExerciseAnimation } from '../../components/ExerciseAnimation';

describe('ExerciseAnimation Component', () => {
  it('renders vector illustration when exerciseId is provided', () => {
    render(<ExerciseAnimation exerciseId="squat" alt="Barbell Squat" />);
    expect(screen.getByText(/Phase 1: Setup/i)).toBeInTheDocument();
    expect(screen.getByText(/Phase 2: Apex/i)).toBeInTheDocument();
  });

  it('renders vector illustration for Cat-Cow mobility pose', () => {
    render(<ExerciseAnimation exerciseId="cat_cow" category="mobility" />);
    expect(screen.getByText(/Phase 1: Setup/i)).toBeInTheDocument();
    expect(screen.getByText(/Phase 2: Apex/i)).toBeInTheDocument();
  });

  it('renders fallback placeholder when src and exerciseId are missing', () => {
    render(<ExerciseAnimation src="" alt="Missing animation" />);
    expect(screen.getByText(/Form Demo/i)).toBeInTheDocument();
  });
});
