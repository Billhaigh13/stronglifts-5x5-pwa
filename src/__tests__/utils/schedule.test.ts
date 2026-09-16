import { describe, it, expect } from 'vitest';
import {
  formatDateKey,
  parseDateKey,
  getStartOfWeek,
  getWeeklySchedule,
  getMonthCalendarGrid,
  isSameDay,
} from '../../utils/schedule';
import type { SchedulePreference, WorkoutSession } from '../../types';

describe('Schedule Utilities', () => {
  const samplePreference: SchedulePreference = {
    pattern: 'mon_wed_fri',
    workoutDays: [1, 3, 5],
    mobilityDays: [2, 4, 6],
    restDays: [0],
  };

  const sampleWorkouts: WorkoutSession[] = [
    {
      id: 1,
      type: 'A',
      date: '2026-08-24T10:00:00.000Z',
      startTime: 1787565600000,
      durationSeconds: 2700,
      completed: true,
      exerciseLogs: [
        {
          exerciseId: 'squat',
          exerciseName: 'Barbell Squat',
          targetWeight: 100,
          targetReps: [5, 5, 5, 5, 5],
          completedReps: [5, 5, 5, 5, 5],
          completed: true,
          isPR: true,
        },
      ],
    },
    {
      id: 2,
      type: 'B',
      date: '2026-08-26T10:00:00.000Z',
      startTime: 1787738400000,
      durationSeconds: 2500,
      completed: true,
      exerciseLogs: [
        {
          exerciseId: 'deadlift',
          exerciseName: 'Barbell Deadlift',
          targetWeight: 120,
          targetReps: [5],
          completedReps: [5],
          completed: true,
        },
      ],
    },
  ];

  describe('formatDateKey & parseDateKey', () => {
    it('formats and parses date strings consistently in YYYY-MM-DD', () => {
      const date = new Date(2026, 7, 24); // Aug 24, 2026
      const key = formatDateKey(date);
      expect(key).toBe('2026-08-24');

      const parsed = parseDateKey('2026-08-24');
      expect(parsed.getFullYear()).toBe(2026);
      expect(parsed.getMonth()).toBe(7);
      expect(parsed.getDate()).toBe(24);
    });

    it('identifies same days accurately with isSameDay', () => {
      const d1 = new Date(2026, 7, 24, 10, 0, 0);
      const d2 = new Date(2026, 7, 24, 22, 30, 0);
      const d3 = new Date(2026, 7, 25, 10, 0, 0);

      expect(isSameDay(d1, d2)).toBe(true);
      expect(isSameDay(d1, d3)).toBe(false);
    });
  });

  describe('getStartOfWeek', () => {
    it('returns Monday of the week for any weekday', () => {
      // Aug 24, 2026 is a Monday
      const monday = new Date(2026, 7, 24);
      expect(getStartOfWeek(monday).getDay()).toBe(1); // Monday

      // Aug 26, 2026 is a Wednesday
      const wednesday = new Date(2026, 7, 26);
      const startOfWed = getStartOfWeek(wednesday);
      expect(startOfWed.getDay()).toBe(1);
      expect(formatDateKey(startOfWed)).toBe('2026-08-24');

      // Aug 30, 2026 is a Sunday
      const sunday = new Date(2026, 7, 30);
      const startOfSun = getStartOfWeek(sunday);
      expect(startOfSun.getDay()).toBe(1);
      expect(formatDateKey(startOfSun)).toBe('2026-08-24');
    });
  });

  describe('getWeeklySchedule', () => {
    it('generates a 7-day schedule Mon-Sun with scheduled types and workout matching', () => {
      const refDate = new Date(2026, 7, 24);
      const week = getWeeklySchedule(samplePreference, refDate, sampleWorkouts);

      expect(week.length).toBe(7);
      expect(week[0].dayName).toBe('Mon');
      expect(week[6].dayName).toBe('Sun');

      // Mon (Aug 24) should be strength and completed
      expect(week[0].scheduledType).toBe('strength');
      expect(week[0].completedWorkouts.length).toBe(1);
      expect(week[0].status).toBe('completed');

      // Tue (Aug 25) should be mobility
      expect(week[1].scheduledType).toBe('mobility');

      // Wed (Aug 26) should be strength and completed
      expect(week[2].scheduledType).toBe('strength');
      expect(week[2].completedWorkouts.length).toBe(1);
      expect(week[2].status).toBe('completed');

      // Sun (Aug 30) should be rest
      expect(week[6].scheduledType).toBe('rest');
    });
  });

  describe('getMonthCalendarGrid', () => {
    it('generates complete calendar grid for August 2026 with workout badges and volume math', () => {
      const grid = getMonthCalendarGrid(2026, 7, sampleWorkouts, samplePreference); // August 2026

      // August 2026 starts on Saturday, ends on Monday -> full rows start on Mon July 27 and end on Sun Sep 6 (42 days)
      expect(grid.length % 7).toBe(0);
      expect(grid.length).toBeGreaterThanOrEqual(28);

      const aug24 = grid.find((d) => d.dateKey === '2026-08-24');
      expect(aug24).toBeDefined();
      expect(aug24?.hasStrength).toBe(true);
      expect(aug24?.strengthWorkoutType).toBe('A');
      expect(aug24?.hasPR).toBe(true);
      expect(aug24?.totalVolume).toBe(2500); // 25 reps * 100 kg = 2500

      const aug26 = grid.find((d) => d.dateKey === '2026-08-26');
      expect(aug26).toBeDefined();
      expect(aug26?.hasStrength).toBe(true);
      expect(aug26?.strengthWorkoutType).toBe('B');
      expect(aug26?.totalVolume).toBe(600); // 5 reps * 120 kg = 600
    });
  });
});
