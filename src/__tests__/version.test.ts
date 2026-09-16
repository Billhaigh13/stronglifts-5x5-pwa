import { describe, it, expect } from 'vitest';
import { compareSemver } from '../utils/version';

describe('compareSemver', () => {
  it('identifies newer major version', () => {
    expect(compareSemver('2.0.0', '1.3.0')).toBe(1);
    expect(compareSemver('v2.0.0', '1.3.0')).toBe(1);
  });

  it('identifies newer minor version', () => {
    expect(compareSemver('1.3.0', '1.2.0')).toBe(1);
    expect(compareSemver('v1.3.0', '1.2.0')).toBe(1);
  });

  it('identifies newer patch version', () => {
    expect(compareSemver('1.2.1', '1.2.0')).toBe(1);
  });

  it('returns 0 for equal versions', () => {
    expect(compareSemver('1.3.0', '1.3.0')).toBe(0);
    expect(compareSemver('v1.3.0', '1.3.0')).toBe(0);
  });

  it('identifies older versions', () => {
    expect(compareSemver('1.1.0', '1.2.0')).toBe(-1);
    expect(compareSemver('0.9.0', '1.0.0')).toBe(-1);
  });

  it('correctly compares pre-release test tags', () => {
    expect(compareSemver('v1.4.1-test', '1.4.0')).toBe(1);
    expect(compareSemver('v1.4.1-test', '1.3.1')).toBe(1);
    expect(compareSemver('v1.4.1-test', '1.4.1')).toBe(0);
  });
});
