import { addDays, daysBetween, weekStart, type DateKey } from './dates';

export const WEEK_TARGET = 5;

export interface StreakInfo {
  /** Workout days in the current unbroken run. */
  streak: number;
  /** Workout days so far in the Mon–Sun week containing today. */
  weekCount: number;
  target: number;
}

/** Unique workout days (one per day), sorted ascending. */
export function workoutDays(dates: DateKey[]): DateKey[] {
  return [...new Set(dates)].sort();
}

export function weekProgress(days: DateKey[], today: DateKey): number {
  const ws = weekStart(today);
  const we = addDays(ws, 6);
  return new Set(days.filter((d) => d >= ws && d <= we)).size;
}

/**
 * Streak is derived from the workout days and today's date.
 * Walk from the first workout day to yesterday; in each Mon–Sun week count missed (elapsed, workout-less)
 * days. The third missed day in a week (5 workouts no longer reachable) resets the run to 0.
 * Today is never counted as missed.
 */
export function computeStreak(dates: DateKey[], today: DateKey): StreakInfo {
  const days = workoutDays(dates).filter((d) => d <= today);
  const weekCount = weekProgress(days, today);
  if (days.length === 0) return { streak: 0, weekCount, target: WEEK_TARGET };

  const set = new Set(days);
  let run = 0;
  let missedInWeek = 0;
  let curWeek = weekStart(days[0]);
  const span = daysBetween(days[0], today);
  for (let i = 0; i <= span; i++) {
    const d = addDays(days[0], i);
    const ws = weekStart(d);
    if (ws !== curWeek) {
      curWeek = ws;
      missedInWeek = 0;
    }
    if (set.has(d)) {
      run += 1;
    } else if (d < today) {
      missedInWeek += 1;
      if (missedInWeek >= 3) run = 0;
    }
  }
  return { streak: run, weekCount, target: WEEK_TARGET };
}
