import { describe, expect, it } from 'vitest';
import { dateKey } from '../src/domain/dates';
import { discardSession, doneToday, editSessionTimes, extraType, finishAt, finishSession, isStale, formatClock, logSets, sessionsOn, startSession, streakFor, timerView, todaysPlan } from '../src/domain/session';
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
  it('a second session the same day is allowed as an extra, a third is refused', () => {
    let s = startSession(emptyStore(), 'yoga', 15, T0)!;
    s = finishSession(s, T0 + min(10));
    expect(doneToday(s, dateKey(T0))).toBeDefined();
    expect(streakFor(s, dateKey(T0)).weekCount).toBe(1);
    s = startSession(s, 'jogging', 15, T0 + min(60))!;
    expect(s).toBeDefined();
    s = finishSession(s, T0 + min(75));
    expect(sessionsOn(s, dateKey(T0))).toHaveLength(2);
    expect(doneToday(s, dateKey(T0))!.type).toBe('yoga');
    expect(streakFor(s, dateKey(T0))).toMatchObject({ weekCount: 2, streak: 2 });
    expect(startSession(s, 'back-legs', 15, T0 + min(120))).toBeUndefined();
  });
  it('extra type continues the rotation after today\'s session', () => {
    let s = startSession(emptyStore(), 'yoga', 15, T0)!;
    s = finishSession(s, T0 + min(10));
    expect(extraType(s, dateKey(T0))).not.toBe('yoga');
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

describe('editing times', () => {
  const done = () => {
    let s = startSession(emptyStore(), 'yoga', 15, T0)!;
    s = finishSession(s, T0 + min(300)); // forgot to stop: 5 hours later
    return s;
  };
  it('fixes a forgotten stop and recalculates the duration', () => {
    const s = done();
    const r = editSessionTimes(s, s.sessions[0].id, T0, T0 + min(14), T0 + min(400));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.store.sessions[0].stoppedAt).toBe(T0 + min(14));
  });
  it('refuses stop not after start, and stop in the future', () => {
    const s = done();
    const id = s.sessions[0].id;
    expect(editSessionTimes(s, id, T0, T0, T0 + min(400))).toEqual({ ok: false, error: 'order' });
    expect(editSessionTimes(s, id, T0, T0 + min(500), T0 + min(400))).toEqual({ ok: false, error: 'future' });
    expect(editSessionTimes(s, 'nope', T0, T0 + min(5), T0 + min(400))).toEqual({ ok: false, error: 'missing' });
  });
  it('moving the start changes the date and the streak follows', () => {
    const s = done();
    const day2 = T0 + 24 * 60 * min(1);
    const r = editSessionTimes(s, s.sessions[0].id, day2, day2 + min(14), day2 + min(60));
    expect(r.ok && r.store.sessions[0].date).toBe(dateKey(day2));
  });
  it('refuses moving onto a day that already has two sessions', () => {
    let s = done();
    s = startSession(s, 'jogging', 15, T0 + min(400))!;
    s = finishSession(s, T0 + min(410));
    const other = { ...s.sessions[0], id: 'o', date: dateKey(T0 + 24 * 60 * min(1)), startedAt: T0 + 24 * 60 * min(1), stoppedAt: T0 + 24 * 60 * min(1) + min(10) };
    s = { ...s, sessions: [...s.sessions, other] };
    const r = editSessionTimes(s, 'o', T0 + min(450), T0 + min(460), T0 + 24 * 60 * min(2));
    expect(r).toEqual({ ok: false, error: 'full' });
  });
  it('finishes a forgotten running session at a chosen time', () => {
    const s = startSession(emptyStore(), 'yoga', 15, T0)!;
    const now = T0 + 24 * 60 * min(1) + min(60);
    expect(isStale(s.activeSession!, now)).toBe(true);
    expect(isStale(s.activeSession!, T0 + min(30))).toBe(false);
    const r = finishAt(s, T0 + min(12), now);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.store.activeSession).toBeNull();
      expect(r.store.sessions[0]).toMatchObject({ completed: true, stoppedAt: T0 + min(12), date: dateKey(T0) });
    }
    expect(finishAt(s, T0 - 1, now)).toEqual({ ok: false, error: 'order' });
    expect(finishAt(s, now + 1, now)).toEqual({ ok: false, error: 'future' });
  });
});
