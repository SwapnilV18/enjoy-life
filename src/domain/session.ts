import { dateKey, type DateKey } from './dates';
import { getType, type WorkoutTypeId } from './library';
import { recommend, type Recommendation } from './plan';
import { computeStreak, type StreakInfo } from './streak';
import type { Store } from '../storage';
import type { LoggedSet, Session } from './types';

/** Timer: pure function of timestamps, so it is correct across screen lock and reloads. */
export interface TimerView {
  overtime: boolean;
  /** Seconds remaining (countdown) or elapsed beyond target (overtime). */
  seconds: number;
  elapsedSec: number;
}

export function timerView(startedAt: number, durationMin: number, now: number): TimerView {
  const elapsedSec = Math.max(0, Math.floor((now - startedAt) / 1000));
  const target = durationMin * 60;
  return elapsedSec <= target
    ? { overtime: false, seconds: target - elapsedSec, elapsedSec }
    : { overtime: true, seconds: elapsedSec - target, elapsedSec };
}

export function formatClock(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function history(store: Store) {
  return store.sessions.filter((s) => s.completed).map((s) => ({ date: s.date, type: s.type }));
}

export function doneToday(store: Store, today: DateKey): Session | undefined {
  return store.sessions.find((s) => s.completed && s.date === today);
}

/** Today's recommendation; computed once per day and cached so reopening returns the same answer. */
export function todaysPlan(store: Store, today: DateKey): { rec: Recommendation; store: Store } {
  if (store.planCache && store.planCache.date === today) return { rec: store.planCache.rec, store };
  const rec = recommend(history(store), today);
  return { rec, store: { ...store, planCache: { date: today, rec } } };
}

export function streakFor(store: Store, today: DateKey): StreakInfo {
  return computeStreak(history(store).map((h) => h.date), today);
}

/** Start a session of `type`. Refused (undefined) if a workout is already done today. */
export function startSession(store: Store, type: WorkoutTypeId, durationMin: 15 | 20, now: number): Store | undefined {
  const date = dateKey(now);
  if (doneToday(store, date)) return undefined;
  if (store.activeSession) return store;
  getType(type);
  const session: Session = { id: `s-${now}`, date, type, durationMin, startedAt: now, completed: false, sets: {} };
  return { ...store, activeSession: session };
}

export function logSets(store: Store, exerciseId: string, sets: LoggedSet[]): Store {
  if (!store.activeSession) return store;
  const last = sets.filter((s) => s.weight !== '' || s.reps !== '').pop();
  return {
    ...store,
    activeSession: { ...store.activeSession, sets: { ...store.activeSession.sets, [exerciseId]: sets } },
    lastSets: last ? { ...store.lastSets, [exerciseId]: last } : store.lastSets,
  };
}

/** Finish: records the stop time and counts as completed (early finish allowed). */
export function finishSession(store: Store, now: number): Store {
  const a = store.activeSession;
  if (!a) return store;
  return { ...store, activeSession: null, sessions: [...store.sessions, { ...a, stoppedAt: now, completed: true }] };
}

/** Discard: not counted, no effect on streak. */
export function discardSession(store: Store): Store {
  return { ...store, activeSession: null };
}
