import { addDays, daysBetween, weekStart, type DateKey } from './dates';
import { WORKOUT_TYPES, getType, type WorkoutTypeId } from './library';
import { WEEK_TARGET, workoutDays } from './streak';

export interface HistoryItem { date: DateKey; type: WorkoutTypeId }
export interface Recommendation { type: WorkoutTypeId; durationMin: 15 | 20 }

/**
 * Date from which 20-minute sessions apply, or undefined if not yet earned.
 * Derived from history: first pair of consecutive Mon–Sun weeks that each have 5 workout days;
 * 20 min applies from the day after the 5th workout day of the second week, permanently.
 */
export function twentyMinuteFrom(dates: DateKey[]): DateKey | undefined {
  const days = workoutDays(dates);
  const byWeek = new Map<DateKey, DateKey[]>();
  for (const d of days) {
    const w = weekStart(d);
    byWeek.set(w, [...(byWeek.get(w) ?? []), d]);
  }
  const weeks = [...byWeek.keys()].sort();
  for (const w of weeks) {
    const next = addDays(w, 7);
    const a = byWeek.get(w)!;
    const b = byWeek.get(next);
    if (a.length >= WEEK_TARGET && b && b.length >= WEEK_TARGET) {
      return addDays(b[WEEK_TARGET - 1], 1);
    }
  }
  return undefined;
}

export function durationFor(dates: DateKey[], today: DateKey): 15 | 20 {
  const from = twentyMinuteFrom(dates);
  return from && today >= from ? 20 : 15;
}

const shares = (a: WorkoutTypeId, b: WorkoutTypeId) => {
  const ma = getType(a).muscles;
  return getType(b).muscles.some((m) => ma.includes(m));
};

/** Pick the type: least recently completed first, avoiding muscles of the previous session. */
export function recommendType(history: HistoryItem[], today: DateKey): WorkoutTypeId {
  const prior = history.filter((h) => h.date < today).sort((a, b) => a.date.localeCompare(b.date));
  const last = prior[prior.length - 1];
  const lastDone = new Map<WorkoutTypeId, DateKey>();
  for (const h of prior) lastDone.set(h.type, h.date);

  const ranked = WORKOUT_TYPES.map((t, order) => ({
    id: t.id,
    order,
    age: lastDone.has(t.id) ? daysBetween(lastDone.get(t.id)!, today) : Infinity,
  })).sort((a, b) => b.age - a.age || a.order - b.order);

  const ok = ranked.filter((r) => !last || !shares(last.type, r.id));
  return (ok[0] ?? ranked[0]).id;
}

export function recommend(history: HistoryItem[], today: DateKey): Recommendation {
  return {
    type: recommendType(history, today),
    durationMin: durationFor(history.map((h) => h.date), today),
  };
}
