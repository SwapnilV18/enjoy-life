import { describe, expect, it } from 'vitest';
import { addDays } from '../src/domain/dates';
import { durationFor, recommend, recommendType, twentyMinuteFrom, type HistoryItem } from '../src/domain/plan';

// 2026-01-05 is a Monday.
const MON1 = '2026-01-05';
const days = (weekMonday: string, n: number) => Array.from({ length: n }, (_, i) => addDays(weekMonday, i));
const hist = (dates: string[], type: HistoryItem['type'] = 'yoga'): HistoryItem[] => dates.map((date) => ({ date, type }));

describe('duration progression', () => {
  it('only one on-track week -> 15', () => {
    const d = [...days(MON1, 5), ...days(addDays(MON1, 7), 4)];
    expect(durationFor(d, addDays(MON1, 7 + 4))).toBe(15);
  });
  it('two on-track weeks -> 20 from the day after the 5th workout day', () => {
    const d = [...days(MON1, 5), ...days(addDays(MON1, 7), 5)];
    const fifth = addDays(MON1, 7 + 4);
    expect(durationFor(d, fifth)).toBe(15);
    expect(durationFor(d, addDays(fifth, 1))).toBe(20);
    expect(twentyMinuteFrom(d)).toBe(addDays(fifth, 1));
  });
  it('non-consecutive weeks -> still 15', () => {
    const d = [...days(MON1, 5), ...days(addDays(MON1, 7), 4), ...days(addDays(MON1, 14), 5)];
    expect(durationFor(d, addDays(MON1, 14 + 5))).toBe(15);
  });
  it('20 is kept once earned', () => {
    const d = [...days(MON1, 5), ...days(addDays(MON1, 7), 5), ...days(addDays(MON1, 14), 3)];
    expect(durationFor(d, addDays(MON1, 21 + 1))).toBe(20);
    expect(durationFor(d, addDays(MON1, 60))).toBe(20);
  });
  it('first pair is found even if later weeks are weak', () => {
    const d = [...days(MON1, 5), ...days(addDays(MON1, 7), 5)];
    expect(twentyMinuteFrom(d)).toBeDefined();
  });
});

describe('rotation', () => {
  it('never-done types come before recently completed ones', () => {
    // yesterday: jogging (no muscles); everything else never done -> first never-done in library order
    expect(recommendType(hist(['2026-01-04'], 'jogging'), '2026-01-05')).toBe('back-legs');
  });
  it('avoids same muscles as yesterday (Back and Legs -> not back-legs nor chest-legs)', () => {
    const r = recommendType(hist(['2026-01-04'], 'back-legs'), '2026-01-05');
    expect(['back-legs', 'chest-legs']).not.toContain(r);
  });
  it('prefers the least recently completed type', () => {
    const h: HistoryItem[] = [
      { date: '2026-01-01', type: 'jogging' }, { date: '2026-01-02', type: 'back-legs' },
      { date: '2026-01-03', type: 'chest-legs' }, { date: '2026-01-04', type: 'biceps-shoulders' },
      { date: '2026-01-05', type: 'triceps-abs' }, { date: '2026-01-06', type: 'yoga' },
    ];
    expect(recommendType(h, '2026-01-07')).toBe('jogging');
  });
  it('first ever open recommends the first type at 15 min', () => {
    expect(recommend([], MON1)).toEqual({ type: 'jogging', durationMin: 15 });
  });
});
