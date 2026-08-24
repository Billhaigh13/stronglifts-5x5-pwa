import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExerciseAnimation } from '../../components/ExerciseAnimation';

describe('ExerciseAnimation Component', () => {
  it('renders fallback placeholder when src is missing', () => {
    render(<ExerciseAnimation src="" alt="Missing animation" />);
    expect(screen.getByText(/Form Demo/i)).toBeInTheDocument();
  });

  it('renders img element for GIF / image sources', () => {
    render(<ExerciseAnimation src="/exercises/squat.gif" alt="Barbell Squat" />);
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/exercises/squat.gif');
    expect(img).toHaveAttribute('alt', 'Barbell Squat');
  });

  it('renders video element when src ends with .mp4 or .webm', () => {
    const { container } = render(
      <ExerciseAnimation src="/exercises/squat.mp4" alt="Squat Video" />
    );
    const video = container.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('src', '/exercises/squat.mp4');
    expect(video).toHaveAttribute('loop');
  });
});
