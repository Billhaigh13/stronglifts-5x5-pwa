import { describe, it, expect } from 'vitest';
import { PROGRAM_DEFINITIONS, EXERCISE_DEFINITIONS } from '../utils/constants';
import { getAllPrograms, getEffectiveProgram } from '../utils/programs';
import type { ProgramDefinition, UserSettings } from '../types';

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

  it('defines Dumbbell Hammer Curls in EXERCISE_DEFINITIONS', () => {
    const hammer = EXERCISE_DEFINITIONS.hammer_curl;
    expect(hammer).toBeDefined();
    expect(hammer.name).toBe('Dumbbell Hammer Curls');
    expect(hammer.category).toBe('dumbbell_accessory');
    expect(hammer.repRangeMin).toBe(8);
    expect(hammer.repRangeMax).toBe(12);
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

  it('supports custom programs and program overrides in getAllPrograms and getEffectiveProgram', () => {
    const customProg: ProgramDefinition = {
      id: 'custom_1',
      name: "Bill's Custom Split",
      tagline: 'Hypertrophy plus arms',
      description: 'Customized routine',
      badge: 'CUSTOM',
      isCustom: true,
      routines: {
        A: { name: 'Workout A', exerciseIds: ['squat', 'bench', 'hammer_curl'] },
        B: { name: 'Workout B', exerciseIds: ['deadlift', 'ohp', 'bicep_curl'] },
      },
    };

    const dummySettings: Partial<UserSettings> = {
      customPrograms: [customProg],
      programOverrides: {
        bill_lifts: {
          ...PROGRAM_DEFINITIONS.bill_lifts,
          routines: {
            ...PROGRAM_DEFINITIONS.bill_lifts.routines,
            A: { name: 'Workout A', exerciseIds: ['squat', 'bench', 'row', 'hammer_curl'] },
          },
        },
      },
    };

    const all = getAllPrograms(dummySettings as UserSettings);
    expect(all.some((p) => p.id === 'custom_1')).toBe(true);

    const effectiveBillLifts = getEffectiveProgram('bill_lifts', dummySettings as UserSettings);
    expect(effectiveBillLifts.routines.A.exerciseIds).toContain('hammer_curl');

    const effectiveCustom = getEffectiveProgram('custom_1', dummySettings as UserSettings);
    expect(effectiveCustom.name).toBe("Bill's Custom Split");
  });
});
