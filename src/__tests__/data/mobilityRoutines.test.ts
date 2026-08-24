import { describe, it, expect } from 'vitest';
import { MOBILITY_POSES, MOBILITY_ROUTINES } from '../../data/mobilityRoutines';

describe('Mobility Data & Routines', () => {
  it('contains valid and complete metadata for all 16 mobility poses', () => {
    const poseKeys = Object.keys(MOBILITY_POSES);
    expect(poseKeys.length).toBeGreaterThanOrEqual(16);

    poseKeys.forEach((key) => {
      const pose = MOBILITY_POSES[key];
      expect(pose.id, `Missing ID on pose ${key}`).toBe(key);
      expect(pose.name, `Missing name on pose ${key}`).toBeTruthy();
      expect(pose.category, `Invalid category on pose ${key}`).toMatch(/^(yoga|stretching|pilates|mobility)$/);
      expect(pose.targetMuscles.length, `Empty target muscles on ${key}`).toBeGreaterThan(0);
      expect(pose.defaultDurationSeconds, `Invalid duration on ${key}`).toBeGreaterThan(0);
      expect(typeof pose.isBilateral, `Missing isBilateral boolean on ${key}`).toBe('boolean');
      expect(pose.cues.length, `Empty cues on ${key}`).toBeGreaterThan(0);
      expect(pose.whereYouShouldFeelIt, `Missing feeling guide on ${key}`).toBeTruthy();
      expect(pose.beginnerModification, `Missing beginner modification on ${key}`).toBeTruthy();
      expect(pose.breathingCue, `Missing breathing cue on ${key}`).toBeTruthy();
      expect(pose.animationUrl, `Missing animationUrl on ${key}`).toMatch(/^\/mobility\/[a-z0-9_]+\.gif$/);
    });
  });

  it('contains valid preset routines that only reference registered poses', () => {
    expect(MOBILITY_ROUTINES.length).toBeGreaterThanOrEqual(5);

    MOBILITY_ROUTINES.forEach((routine) => {
      expect(routine.id).toBeTruthy();
      expect(routine.name).toBeTruthy();
      expect(routine.subtitle).toBeTruthy();
      expect(routine.description).toBeTruthy();
      expect(routine.estimatedMinutes).toBeGreaterThan(0);
      expect(routine.poses.length).toBeGreaterThan(0);

      routine.poses.forEach((p) => {
        expect(
          MOBILITY_POSES[p.poseId],
          `Routine "${routine.id}" references unknown poseId "${p.poseId}"`
        ).toBeDefined();
      });
    });
  });
});
