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

/** Sessions per date, capped at 2 (one regular plus at most one extra). */
function perDay(dates: DateKey[]): Map<DateKey, number> {
  const m = new Map<DateKey, number>();
  for (const d of dates) m.set(d, Math.min(2, (m.get(d) ?? 0) + 1));
  return m;
}

/** Workout days in the Mon–Sun week of `today`; an extra session on a day counts as one more. */
export function weekProgress(dates: DateKey[], today: DateKey): number {
  const ws = weekStart(today);
  const we = addDays(ws, 6);
  let n = 0;
  for (const [d, c] of perDay(dates)) if (d >= ws && d <= we) n += c;
  return n;
}

/**
 * Streak is derived from the session dates (duplicates kept: a second session on a day is an extra) and today.
 * Walk from the first workout day to today; each workout day adds 1 (2 with an extra) to the run. In each Mon–Sun
 * week count missed (elapsed, workout-less) days; every extra done on or before a day offsets one miss. The third
 * unoffset miss in a week (5 workouts no longer reachable) resets the run to 0. Today is never counted as missed.
 */
export function computeStreak(dates: DateKey[], today: DateKey): StreakInfo {
  const upto = dates.filter((d) => d <= today);
  const counts = perDay(upto);
  const days = [...counts.keys()].sort();
  const weekCount = weekProgress(upto, today);
  if (days.length === 0) return { streak: 0, weekCount, target: WEEK_TARGET };

  let run = 0;
  let missedInWeek = 0;
  let credits = 0;
  let curWeek = weekStart(days[0]);
  const span = daysBetween(days[0], today);
  for (let i = 0; i <= span; i++) {
    const d = addDays(days[0], i);
    const ws = weekStart(d);
    if (ws !== curWeek) {
      curWeek = ws;
      missedInWeek = 0;
      credits = 0;
    }
    const c = counts.get(d);
    if (c) {
      run += c;
      credits += c - 1;
    } else if (d < today) {
      missedInWeek += 1;
      if (missedInWeek - credits >= 3) run = 0;
    }
  }
  return { streak: run, weekCount, target: WEEK_TARGET };
}
