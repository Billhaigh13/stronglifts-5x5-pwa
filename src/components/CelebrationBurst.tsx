import React, { useMemo } from 'react';

interface Particle {
  id: number;
  tx: string;
  ty: string;
  color: string;
  size: number;
  shape: 'circle' | 'rect' | 'pill';
  delay: string;
}

const COLORS = ['#10b981', '#06b6d4', '#fbbf24', '#f43f5e', '#a855f7', '#38bdf8', '#ffffff'];
const SHAPES: Array<'circle' | 'rect' | 'pill'> = ['circle', 'rect', 'pill'];

export const CelebrationBurst: React.FC = () => {
  const particles: Particle[] = useMemo(() => {
    const list: Particle[] = [];
    const count = 24;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * (2 * Math.PI) + (Math.random() * 0.3 - 0.15);
      const distance = 80 + Math.random() * 110;
      const tx = `${Math.cos(angle) * distance}px`;
      const ty = `${Math.sin(angle) * distance}px`;
      const color = COLORS[i % COLORS.length];
      const shape = SHAPES[i % SHAPES.length];
      const size = shape === 'pill' ? 6 : 7 + (i % 5);
      const delay = `${(i % 4) * 0.04}s`;

      list.push({ id: i, tx, ty, color, size, shape, delay });
    }
    return list;
  }, []);

  return (
    <div
      data-testid="celebration-burst"
      className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible z-20"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-particle"
          style={
            {
              '--tx': p.tx,
              '--ty': p.ty,
              animationDelay: p.delay,
              backgroundColor: p.color,
              width: p.shape === 'pill' ? `${p.size * 2}px` : `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: p.shape === 'circle' ? '9999px' : p.shape === 'pill' ? '9999px' : '2px',
              boxShadow: `0 0 6px ${p.color}80`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};
