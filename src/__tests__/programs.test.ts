import { describe, it, expect } from 'vitest';
import { PROGRAM_DEFINITIONS, EXERCISE_DEFINITIONS } from '../utils/constants';

describe('Training Program Definitions (constants.ts)', () => {
  it('defines BillLifts with custom DB curls and pullups accessories', () => {
    const billLifts = PROGRAM_DEFINITIONS.bill_lifts;
    expect(billLifts).toBeDefined();
    expect(billLifts.name).toBe('BillLifts');
    expect(billLifts.routines.A.exerciseIds).toEqual(['squat', 'bench', 'row', 'bicep_curl']);
    expect(billLifts.routines.B.exerciseIds).toEqual(['squat', 'ohp', 'deadlift', 'pullups']);
  });

  it('defines Classic 5x5 without accessories', () => {
    const classic = PROGRAM_DEFINITIONS.classic_5x5;
    expect(classic.routines.A.exerciseIds).toEqual(['squat', 'bench', 'row']);
    expect(classic.routines.B.exerciseIds).toEqual(['squat', 'ohp', 'deadlift']);
  });

  it('verifies all routine exercises exist in EXERCISE_DEFINITIONS', () => {
    Object.values(PROGRAM_DEFINITIONS).forEach((prog) => {
      prog.routines.A.exerciseIds.forEach((id) => {
        expect(EXERCISE_DEFINITIONS[id]).toBeDefined();
      });
      prog.routines.B.exerciseIds.forEach((id) => {
        expect(EXERCISE_DEFINITIONS[id]).toBeDefined();
      });
    });
  });
});
