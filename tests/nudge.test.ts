import { describe, expect, it } from 'vitest';
import { NUDGES, nextMessage, validNudgeState, type NudgeState } from '../src/domain/nudge';

const banned = /workout|fitness|gym/i;
const seeded = (seed = 1) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

describe('nudge pool', () => {
  it('has enough messages, each short and discreet', () => {
    expect(NUDGES.length).toBeGreaterThanOrEqual(15);
    for (const m of NUDGES) {
      expect(m.length).toBeLessThanOrEqual(120);
      expect(m).not.toMatch(banned);
    }
    expect(new Set(NUDGES).size).toBe(NUDGES.length);
  });
});

describe('nextMessage', () => {
  it('shows every message exactly once per cycle', () => {
    const n = 7;
    let st: NudgeState | null = null;
    const seen: number[] = [];
    for (let i = 0; i < n; i++) {
      const r = nextMessage(st, n, seeded(3));
      seen.push(r.index);
      st = r.state;
    }
    expect([...seen].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
  it('never repeats the last message across cycle boundaries', () => {
    const n = 4;
    const rng = seeded(11);
    let st: NudgeState | null = null;
    let prev = -1;
    for (let i = 0; i < 200; i++) {
      const r = nextMessage(st, n, rng);
      expect(r.index).not.toBe(prev);
      prev = r.index;
      st = r.state;
    }
  });
  it('resets safely from invalid or mismatched state', () => {
    const bad: unknown[] = [null, {}, { order: [0, 0, 1], pos: 0, last: 0 }, { order: [0, 1], pos: 0, last: 0 }, { order: [0, 1, 2], pos: 9, last: 0 }, 'x'];
    for (const b of bad) {
      const r = nextMessage(b as NudgeState, 3, seeded(2));
      expect(r.index).toBeGreaterThanOrEqual(0);
      expect(r.index).toBeLessThan(3);
      expect(validNudgeState(r.state, 3)).toBe(true);
    }
  });
});
