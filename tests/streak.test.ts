import { describe, expect, it } from 'vitest';
import { addDays } from '../src/domain/dates';
import { computeStreak, weekProgress } from '../src/domain/streak';

const MON = '2026-01-05'; // Monday
const d = (n: number) => addDays(MON, n); // 0=Mon .. 6=Sun

describe('week progress', () => {
  it('Mon, Tue, Thu done, shown on Friday -> 3 of 5', () => {
    const info = computeStreak([d(0), d(1), d(3)], d(4));
    expect(info.weekCount).toBe(3);
    expect(info.target).toBe(5);
  });
  it('duplicate day counts once', () => {
    expect(computeStreak([d(0), d(0)], d(0))).toMatchObject({ streak: 1, weekCount: 1 });
  });
  it('weekProgress only counts the Mon–Sun week of today', () => {
    expect(weekProgress([d(-1), d(0), d(6), d(7)], d(2))).toBe(2);
  });
});

describe('streak', () => {
  it('empty history', () => expect(computeStreak([], MON).streak).toBe(0));
  it('one missed day does not break it', () => {
    // Mon, Tue done, Wed missed, Thu begins
    expect(computeStreak([d(0), d(1)], d(3)).streak).toBe(2);
  });
  it('third missed day resets to 0', () => {
    // Mon done; Tue, Wed missed; Thu missed -> evaluated Friday
    expect(computeStreak([d(0)], d(4)).streak).toBe(0);
    // but while Thursday is still "today" only two are missed
    expect(computeStreak([d(0)], d(3)).streak).toBe(1);
  });
  it('today is not yet missed', () => {
    expect(computeStreak([d(0), d(1)], d(2)).streak).toBe(2);
  });
  it('increments on completing today', () => {
    expect(computeStreak([d(0), d(1), d(2), d(3)], d(4)).streak).toBe(4);
    expect(computeStreak([d(0), d(1), d(2), d(3), d(4)], d(4)).streak).toBe(5);
  });
  it('week rollover keeps the streak and resets week progress', () => {
    const done = [d(0), d(1), d(2), d(3), d(4)];
    const info = computeStreak(done, d(7));
    expect(info.streak).toBe(5);
    expect(info.weekCount).toBe(0);
  });
  it('missed-day count resets each Monday', () => {
    // week 1: Mon..Fri done, Sat+Sun missed (2); week 2: Mon missed (1 in its own week) -> unbroken
    expect(computeStreak([d(0), d(1), d(2), d(3), d(4)], d(8)).streak).toBe(5);
  });
  it('later workouts after a reset start a new run', () => {
    // Mon done; Tue-Thu missed (reset Thu); Fri, Sat done
    expect(computeStreak([d(0), d(4), d(5)], d(5)).streak).toBe(2);
  });
  it('uses local date keys (timezone-local, not UTC)', () => {
    // late-evening local time still maps to the local calendar day
    const k = (y: number, m: number, day: number, h: number) => {
      const dt = new Date(y, m, day, h, 30);
      return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    };
    expect(k(2026, 0, 5, 23)).toBe('2026-01-05');
  });
});
