import { describe, expect, it } from 'vitest';
import { dateKey } from '../src/domain/dates';
import { discardSession, doneToday, finishSession, formatClock, logSets, startSession, streakFor, timerView, todaysPlan } from '../src/domain/session';
import { emptyStore } from '../src/storage';

const T0 = new Date(2026, 0, 5, 7, 0, 0).getTime();
const min = (n: number) => n * 60_000;

describe('timer (fake clock)', () => {
  it('counts down: 5 min into 15 -> 10:00 remaining', () => {
    const v = timerView(T0, 15, T0 + min(5));
    expect(v).toMatchObject({ overtime: false, seconds: 600 });
    expect(formatClock(v.seconds)).toBe('10:00');
  });
  it('overtime after target', () => {
    const v = timerView(T0, 15, T0 + min(15) + 42_000);
    expect(v).toMatchObject({ overtime: true, seconds: 42 });
  });
  it('reflects real time after a 3-minute lock (no ticks needed)', () => {
    expect(timerView(T0, 15, T0 + min(3)).elapsedSec).toBe(180);
  });
  it('never negative', () => expect(timerView(T0, 15, T0 - 5000).seconds).toBe(900));
});

describe('session lifecycle', () => {
  it('start persists active session with its original start time (resume after reload)', () => {
    const s = startSession(emptyStore(), 'yoga', 15, T0)!;
    const reloaded = JSON.parse(JSON.stringify(s));
    expect(reloaded.activeSession.startedAt).toBe(T0);
  });
  it('finish early records stop time and counts as completed', () => {
    let s = startSession(emptyStore(), 'back-legs', 15, T0)!;
    s = logSets(s, 'curl', [{ weight: '20', reps: '12' }]);
    s = finishSession(s, T0 + min(9));
    expect(s.activeSession).toBeNull();
    expect(s.sessions[0]).toMatchObject({ type: 'back-legs', startedAt: T0, stoppedAt: T0 + min(9), completed: true });
    expect(s.sessions[0].sets.curl).toEqual([{ weight: '20', reps: '12' }]);
    expect(s.lastSets.curl).toEqual({ weight: '20', reps: '12' });
    expect(streakFor(s, dateKey(T0)).streak).toBe(1);
  });
  it('discard does not count and does not affect streak', () => {
    let s = startSession(emptyStore(), 'yoga', 15, T0)!;
    s = discardSession(s);
    expect(s.sessions).toHaveLength(0);
    expect(s.activeSession).toBeNull();
    expect(streakFor(s, dateKey(T0)).streak).toBe(0);
  });
  it('a second session the same day is refused', () => {
    let s = startSession(emptyStore(), 'yoga', 15, T0)!;
    s = finishSession(s, T0 + min(10));
    expect(doneToday(s, dateKey(T0))).toBeDefined();
    expect(startSession(s, 'jogging', 15, T0 + min(60))).toBeUndefined();
    expect(streakFor(s, dateKey(T0)).weekCount).toBe(1);
  });
});

describe('daily plan cache', () => {
  it('is stable within a day even if history changes', () => {
    const today = dateKey(T0);
    const first = todaysPlan(emptyStore(), today);
    const withHistory = { ...first.store, sessions: [{ id: 'x', date: '2026-01-04', type: 'jogging' as const, durationMin: 15 as const, startedAt: 1, completed: true, sets: {} }] };
    expect(todaysPlan(withHistory, today).rec).toEqual(first.rec);
  });
  it('recomputes on a new day', () => {
    const first = todaysPlan(emptyStore(), '2026-01-05');
    const next = todaysPlan({ ...first.store, sessions: [{ id: 'x', date: '2026-01-05', type: 'jogging', durationMin: 15, startedAt: 1, completed: true, sets: {} }] }, '2026-01-06');
    expect(next.rec.type).toBe('back-legs');
  });
});
