import { describe, expect, it } from 'vitest';
import { dateKey } from '../src/domain/dates';
import { addPastSession, discardSession, doneToday, durationTarget, editSessionTimes, extraType, finishAt, finishSession, isStale, formatClock, logSets, sessionsOn, startSession, streakFor, timerView, todaysPlan } from '../src/domain/session';
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

describe('logging a past workout', () => {
  const NOWMS = new Date(2026, 0, 10, 12, 0, 0).getTime();
  const w = (over = {}) => ({ type: 'chest-legs' as const, date: '2026-01-06', startMinutes: 7 * 60 + 30, minutes: 15, ...over });
  it('records a completed session on that date with the target duration', () => {
    const r = addPastSession(emptyStore(), w(), NOWMS);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.store.sessions[0]).toMatchObject({ type: 'chest-legs', date: '2026-01-06', durationMin: 15, completed: true, sets: {} });
    expect(r.store.sessions[0].startedAt).toBe(new Date(2026, 0, 6, 7, 30).getTime());
    expect(r.store.sessions[0].stoppedAt).toBe(new Date(2026, 0, 6, 7, 45).getTime());
  });
  it('refuses a future end, a bad duration, and an unknown type', () => {
    expect(addPastSession(emptyStore(), w({ date: '2026-01-10', startMinutes: 11 * 60 + 50 }), NOWMS)).toEqual({ ok: false, error: 'future' });
    expect(addPastSession(emptyStore(), w({ date: '2026-01-11' }), NOWMS)).toEqual({ ok: false, error: 'future' });
    expect(addPastSession(emptyStore(), w({ minutes: 0 }), NOWMS)).toEqual({ ok: false, error: 'range' });
    expect(addPastSession(emptyStore(), w({ minutes: 500 }), NOWMS)).toEqual({ ok: false, error: 'range' });
    expect(addPastSession(emptyStore(), w({ type: 'nope' as never }), NOWMS)).toEqual({ ok: false, error: 'missing' });
  });
  it('allows today for a time that has passed', () => {
    expect(addPastSession(emptyStore(), w({ date: '2026-01-10', startMinutes: 6 * 60 }), NOWMS).ok).toBe(true);
  });
  it('second session is an extra, a third is refused', () => {
    let s = emptyStore();
    for (const h of [6, 9]) {
      const r = addPastSession(s, w({ startMinutes: h * 60 }), NOWMS);
      expect(r.ok).toBe(true);
      if (r.ok) s = r.store;
    }
    expect(sessionsOn(s, '2026-01-06')).toHaveLength(2);
    expect(streakFor(s, '2026-01-06')).toMatchObject({ weekCount: 2, streak: 2 });
    expect(addPastSession(s, w({ startMinutes: 12 * 60 }), NOWMS)).toEqual({ ok: false, error: 'full' });
  });
  it('fills a streak gap: the streak is recomputed from history', () => {
    let s = emptyStore();
    for (const d of ['2026-01-05', '2026-01-08']) {
      const r = addPastSession(s, w({ date: d }), NOWMS);
      if (r.ok) s = r.store;
    }
    // Tue, Wed missed; Thu done: only 2 misses, so the run is 2. Friday evaluated: Fri not yet missed.
    expect(streakFor(s, '2026-01-08').streak).toBe(2);
    const r = addPastSession(s, w({ date: '2026-01-06' }), NOWMS);
    expect(r.ok && streakFor(r.store, '2026-01-08')).toMatchObject({ streak: 3, weekCount: 3 });
  });
  it('uses the 20-minute target once earned', () => {
    let s = emptyStore();
    for (const off of [0, 1, 2, 3, 4, 7, 8, 9, 10, 11]) {
      const d = new Date(2026, 0, 5 + off);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const r = addPastSession(s, w({ date: key }), new Date(2026, 1, 1).getTime());
      if (r.ok) s = r.store;
    }
    expect(durationTarget(s, '2026-01-20')).toBe(20);
    expect(durationTarget(s, '2026-01-06')).toBe(15);
  });
});
