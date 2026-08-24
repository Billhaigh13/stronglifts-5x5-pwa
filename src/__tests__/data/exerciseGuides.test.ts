import { describe, it, expect } from 'vitest';
import { EXERCISE_GUIDES } from '../../data/exerciseGuides';
import type { ExerciseId } from '../../types';

describe('Exercise Guides Knowledge Base', () => {
  const expectedExercises: ExerciseId[] = [
    'squat',
    'bench',
    'row',
    'ohp',
    'deadlift',
    'bicep_curl',
    'pullups',
    'dips',
    'skullcrushers',
    'incline_bench',
    'barbell_curl',
    'plank',
    'hanging_leg_raises',
  ];

  it('contains comprehensive guide entries for all exercises', () => {
    expectedExercises.forEach((exId) => {
      const guide = EXERCISE_GUIDES[exId];
      expect(guide, `Missing guide for ${exId}`).toBeDefined();
      expect(guide.id).toBe(exId);
      expect(guide.name.length).toBeGreaterThan(0);
      expect(guide.equipment.length).toBeGreaterThan(0);
      expect(guide.animationUrl).toMatch(new RegExp(`^/exercises/${exId}\\.(webm|gif)$`));
      expect(guide.primaryMuscles.length).toBeGreaterThan(0);
      expect(guide.secondaryMuscles.length).toBeGreaterThan(0);
      expect(guide.setup.length).toBeGreaterThan(1);
      expect(guide.execution.length).toBeGreaterThan(1);
      expect(guide.proTips.length).toBeGreaterThan(0);
      expect(guide.commonMistakes.length).toBeGreaterThan(0);
      expect(guide.breathing.length).toBeGreaterThan(0);
    });
  });

  it('correctly maps target muscles for key compound movements', () => {
    expect(EXERCISE_GUIDES.squat.primaryMuscles).toContain('Quadriceps');
    expect(EXERCISE_GUIDES.squat.primaryMuscles).toContain('Glutes');
    expect(EXERCISE_GUIDES.bench.primaryMuscles).toContain('Pectorals (Chest)');
    expect(EXERCISE_GUIDES.deadlift.primaryMuscles).toContain('Hamstrings');
    expect(EXERCISE_GUIDES.ohp.primaryMuscles).toContain('Deltoids (Shoulders)');
    expect(EXERCISE_GUIDES.pullups.primaryMuscles).toContain('Latissimus Dorsi');
    expect(EXERCISE_GUIDES.plank.primaryMuscles).toContain('Rectus Abdominis (Abs)');
  });
});
