import type { ProgramDefinition, UserSettings } from '../types';
import { PROGRAM_DEFINITIONS } from './constants';

export function getAllPrograms(userSettings?: UserSettings): ProgramDefinition[] {
  const basePrograms = Object.values(PROGRAM_DEFINITIONS) as ProgramDefinition[];
  const overrides = userSettings?.programOverrides || {};
  const customPrograms = userSettings?.customPrograms || [];

  const effectiveBase = basePrograms.map((p) => overrides[p.id] || p);
  return [...effectiveBase, ...customPrograms];
}

export function getEffectiveProgram(programId: string, userSettings?: UserSettings): ProgramDefinition {
  const all = getAllPrograms(userSettings);
  const found = all.find((p) => p.id === programId);
  return found || PROGRAM_DEFINITIONS.bill_lifts;
}
