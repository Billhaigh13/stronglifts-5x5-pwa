import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CelebrationBurst } from '../../components/CelebrationBurst';

describe('CelebrationBurst Component', () => {
  it('renders 24 GPU-accelerated confetti particle elements', () => {
    render(<CelebrationBurst />);

    const burstContainer = screen.getByTestId('celebration-burst');
    expect(burstContainer).toBeInTheDocument();
    expect(burstContainer.children.length).toBe(24);

    const firstParticle = burstContainer.children[0] as HTMLElement;
    expect(firstParticle.className).toContain('animate-particle');
    expect(firstParticle.style.getPropertyValue('--tx')).toBeDefined();
    expect(firstParticle.style.getPropertyValue('--ty')).toBeDefined();
  });
});
