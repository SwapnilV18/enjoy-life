import { addDays, dateKey, parseKey, type DateKey } from './dates';
import { WORKOUT_TYPES, getType, type WorkoutTypeId } from './library';
import { durationFor, recommend, recommendType, type Recommendation } from './plan';
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
  return sessionsOn(store, today)[0];
}

export const MAX_SESSIONS_PER_DAY = 2;

/** Completed sessions of a date, earliest first (the second is the day's extra). */
export function sessionsOn(store: Store, date: DateKey): Session[] {
  return store.sessions.filter((s) => s.completed && s.date === date).sort((a, b) => a.startedAt - b.startedAt);
}

/** Type for an extra session: next in rotation counting today's session(s) as already done. */
export function extraType(store: Store, today: DateKey): WorkoutTypeId {
  return recommendType(history(store), addDays(today, 1));
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

/** Start a session of `type`. Refused (undefined) once two sessions (regular plus extra) are done today. */
export function startSession(store: Store, type: WorkoutTypeId, durationMin: 15 | 20, now: number): Store | undefined {
  const date = dateKey(now);
  if (sessionsOn(store, date).length >= MAX_SESSIONS_PER_DAY) return undefined;
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

export type EditError = 'missing' | 'order' | 'future' | 'full' | 'range';
export type EditResult = { ok: true; store: Store } | { ok: false; error: EditError };

/** Change a completed session's start and stop times; its date follows the start time. */
export function editSessionTimes(store: Store, id: string, startedAt: number, stoppedAt: number, now: number): EditResult {
  const target = store.sessions.find((s) => s.id === id && s.completed);
  if (!target) return { ok: false, error: 'missing' };
  if (!Number.isFinite(startedAt) || !Number.isFinite(stoppedAt) || stoppedAt <= startedAt) return { ok: false, error: 'order' };
  if (stoppedAt > now) return { ok: false, error: 'future' };
  const date = dateKey(startedAt);
  const others = store.sessions.filter((s) => s.completed && s.date === date && s.id !== id).length;
  if (others >= MAX_SESSIONS_PER_DAY) return { ok: false, error: 'full' };
  return { ok: true, store: { ...store, sessions: store.sessions.map((s) => (s.id === id ? { ...s, startedAt, stoppedAt, date } : s)) } };
}

/** Finish the running session at a chosen stop time (for a session whose end was forgotten). */
export function finishAt(store: Store, stoppedAt: number, now: number): EditResult {
  const a = store.activeSession;
  if (!a) return { ok: false, error: 'missing' };
  if (!Number.isFinite(stoppedAt) || stoppedAt <= a.startedAt) return { ok: false, error: 'order' };
  if (stoppedAt > now) return { ok: false, error: 'future' };
  if (sessionsOn(store, a.date).length >= MAX_SESSIONS_PER_DAY) return { ok: false, error: 'full' };
  return { ok: true, store: { ...store, activeSession: null, sessions: [...store.sessions, { ...a, stoppedAt, completed: true }] } };
}

export const EDIT_MESSAGES: Record<EditError, string> = {
  missing: 'That session could not be found.',
  order: 'The end time must be after the start time.',
  future: 'The end time cannot be in the future.',
  full: 'That day already has two sessions.',
  range: 'Duration must be between 1 and 180 minutes.',
};

/** A running session is stale when it began on an earlier day or has run for over 4 hours. */
export function isStale(a: Session, now: number): boolean {
  return a.date !== dateKey(now) || now - a.startedAt > 4 * 3600_000;
}

/** Target length (15 or 20) that applied on `date`, from the sessions done before it. */
export function durationTarget(store: Store, date: DateKey): 15 | 20 {
  return durationFor(history(store).map((h) => h.date).filter((d) => d < date), date);
}

export interface PastWorkout {
  type: WorkoutTypeId;
  date: DateKey;
  /** Minutes after local midnight. */
  startMinutes: number;
  minutes: number;
}

/** Record a workout that happened earlier. Counts like a live session (streak, week, extras). */
export function addPastSession(store: Store, w: PastWorkout, now: number): EditResult {
  if (!WORKOUT_TYPES.some((t) => t.id === w.type)) return { ok: false, error: 'missing' };
  if (!Number.isInteger(w.minutes) || w.minutes < 1 || w.minutes > 180) return { ok: false, error: 'range' };
  if (!Number.isInteger(w.startMinutes) || w.startMinutes < 0 || w.startMinutes >= 24 * 60) return { ok: false, error: 'order' };
  const day = parseKey(w.date);
  day.setHours(0, w.startMinutes, 0, 0);
  const startedAt = day.getTime();
  const stoppedAt = startedAt + w.minutes * 60_000;
  if (stoppedAt > now) return { ok: false, error: 'future' };
  if (sessionsOn(store, w.date).length >= MAX_SESSIONS_PER_DAY) return { ok: false, error: 'full' };
  let id = `s-${startedAt}`;
  while (store.sessions.some((s) => s.id === id)) id += 'b';
  const session: Session = { id, date: w.date, type: w.type, durationMin: durationTarget(store, w.date), startedAt, stoppedAt, completed: true, sets: {} };
  return { ok: true, store: { ...store, sessions: [...store.sessions, session] } };
}
