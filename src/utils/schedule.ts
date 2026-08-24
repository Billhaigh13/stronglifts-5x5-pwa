import type { DayOfWeek, SchedulePreference, WorkoutSession, WorkoutType } from '../types';
import { DEFAULT_SCHEDULE_PREFERENCE } from './constants';

export interface DayScheduleItem {
  date: Date;
  dateKey: string; // YYYY-MM-DD
  dayName: string; // Mon, Tue, etc.
  dayNumber: number;
  dayOfWeek: DayOfWeek;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  scheduledType: 'strength' | 'mobility' | 'rest';
  suggestedWorkoutType?: WorkoutType;
  completedWorkouts: WorkoutSession[];
  status: 'completed' | 'today_pending' | 'missed' | 'upcoming' | 'rest';
}

export interface CalendarDayItem {
  date: Date;
  dateKey: string;
  dayNumber: number;
  dayOfWeek: DayOfWeek;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  scheduledType: 'strength' | 'mobility' | 'rest';
  completedWorkouts: WorkoutSession[];
  hasStrength: boolean;
  hasMobility: boolean;
  hasPR: boolean;
  totalVolume: number;
  strengthWorkoutType?: WorkoutType;
}

export function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Returns the Monday of the week containing the given date.
 */
export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Generates the 7-day schedule for the active week (Monday to Sunday).
 */
export function getWeeklySchedule(
  preference: SchedulePreference = DEFAULT_SCHEDULE_PREFERENCE,
  referenceDate: Date = new Date(),
  workouts: WorkoutSession[] = [],
  lastWorkout?: WorkoutSession
): DayScheduleItem[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfWeek = getStartOfWeek(referenceDate);
  const weekItems: DayScheduleItem[] = [];

  // Map workouts by dateKey for O(1) lookup
  const workoutMap: Record<string, WorkoutSession[]> = {};
  workouts.forEach((w) => {
    const key = w.date ? w.date.split('T')[0] : '';
    if (key) {
      if (!workoutMap[key]) workoutMap[key] = [];
      workoutMap[key].push(w);
    }
  });

  // Track alternating A/B progression throughout the week
  let nextType: WorkoutType = lastWorkout ? (lastWorkout.type === 'A' ? 'B' : 'A') : 'A';

  for (let i = 0; i < 7; i++) {
    const current = new Date(startOfWeek);
    current.setDate(startOfWeek.getDate() + i);
    current.setHours(0, 0, 0, 0);

    const dateKey = formatDateKey(current);
    const dayOfWeek = current.getDay() as DayOfWeek;
    const isToday = isSameDay(current, today);
    const isPast = current < today && !isToday;
    const isFuture = current > today && !isToday;

    // Determine scheduled activity
    let scheduledType: 'strength' | 'mobility' | 'rest' = 'rest';
    if (preference.workoutDays.includes(dayOfWeek)) {
      scheduledType = 'strength';
    } else if (preference.mobilityDays.includes(dayOfWeek)) {
      scheduledType = 'mobility';
    }

    const dayWorkouts = workoutMap[dateKey] || [];
    const hasCompletedWorkout = dayWorkouts.some((w) => w.completed);

    let status: DayScheduleItem['status'] = 'rest';
    if (hasCompletedWorkout) {
      status = 'completed';
    } else if (isToday) {
      status = 'today_pending';
    } else if (isPast && scheduledType === 'strength') {
      status = 'missed';
    } else if (isFuture && scheduledType !== 'rest') {
      status = 'upcoming';
    }

    const item: DayScheduleItem = {
      date: current,
      dateKey,
      dayName: DAY_NAMES[dayOfWeek],
      dayNumber: current.getDate(),
      dayOfWeek,
      isToday,
      isPast,
      isFuture,
      scheduledType,
      suggestedWorkoutType: scheduledType === 'strength' ? nextType : undefined,
      completedWorkouts: dayWorkouts,
      status,
    };

    if (scheduledType === 'strength') {
      // Toggle for next strength day
      nextType = nextType === 'A' ? 'B' : 'A';
    }

    weekItems.push(item);
  }

  return weekItems;
}

/**
 * Generates the full month calendar day grid (with padding days for complete Monday–Sunday rows).
 */
export function getMonthCalendarGrid(
  year: number,
  month: number, // 0-indexed (0 = Jan, 11 = Dec)
  workouts: WorkoutSession[] = [],
  preference: SchedulePreference = DEFAULT_SCHEDULE_PREFERENCE
): CalendarDayItem[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const workoutMap: Record<string, WorkoutSession[]> = {};
  workouts.forEach((w) => {
    const key = w.date ? w.date.split('T')[0] : '';
    if (key) {
      if (!workoutMap[key]) workoutMap[key] = [];
      workoutMap[key].push(w);
    }
  });

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const gridStartDate = getStartOfWeek(firstDayOfMonth);
  
  // Find grid end date (Sunday of the week containing lastDayOfMonth)
  const lastDayOfWeek = lastDayOfMonth.getDay(); // 0 = Sun
  const daysToAdd = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek;
  const gridEndDate = new Date(lastDayOfMonth);
  gridEndDate.setDate(lastDayOfMonth.getDate() + daysToAdd);
  gridEndDate.setHours(0, 0, 0, 0);

  const days: CalendarDayItem[] = [];
  const current = new Date(gridStartDate);

  while (current <= gridEndDate) {
    const dateKey = formatDateKey(current);
    const dayOfWeek = current.getDay() as DayOfWeek;
    const isCurrentMonth = current.getMonth() === month;
    const isToday = isSameDay(current, today);
    const isPast = current < today && !isToday;
    const isFuture = current > today && !isToday;

    let scheduledType: 'strength' | 'mobility' | 'rest' = 'rest';
    if (preference.workoutDays.includes(dayOfWeek)) {
      scheduledType = 'strength';
    } else if (preference.mobilityDays.includes(dayOfWeek)) {
      scheduledType = 'mobility';
    }

    const dayWorkouts = workoutMap[dateKey] || [];
    const strengthWorkouts = dayWorkouts.filter((w) => w.sessionCategory !== 'mobility' && w.completed);
    const mobilityWorkouts = dayWorkouts.filter((w) => w.sessionCategory === 'mobility' && w.completed);

    const hasStrength = strengthWorkouts.length > 0;
    const hasMobility = mobilityWorkouts.length > 0;
    const hasPR = dayWorkouts.some((w) => w.exerciseLogs.some((l) => l.isPR));
    const totalVolume = dayWorkouts.reduce((acc, w) => {
      const vol = w.exerciseLogs.reduce((eAcc, l) => {
        const repsSum = l.completedReps.reduce<number>((rAcc, r) => rAcc + (r || 0), 0);
        return eAcc + repsSum * l.targetWeight;
      }, 0);
      return acc + vol;
    }, 0);

    const strengthWorkoutType = strengthWorkouts.length > 0 ? strengthWorkouts[0].type : undefined;

    days.push({
      date: new Date(current),
      dateKey,
      dayNumber: current.getDate(),
      dayOfWeek,
      isCurrentMonth,
      isToday,
      isPast,
      isFuture,
      scheduledType,
      completedWorkouts: dayWorkouts,
      hasStrength,
      hasMobility,
      hasPR,
      totalVolume,
      strengthWorkoutType,
    });

    current.setDate(current.getDate() + 1);
  }

  return days;
}
