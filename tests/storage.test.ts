import { describe, expect, it } from 'vitest';
import { STORAGE_KEY, emptyStore, loadStore, parseStore, saveStore } from '../src/storage';

const mem = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
};

describe('storage', () => {
  it('missing data gives an empty store', () => expect(parseStore(null)).toEqual(emptyStore()));
  it('corrupt JSON gives an empty store', () => expect(parseStore('{nope')).toEqual(emptyStore()));
  it('wrong version or shape is ignored', () => {
    expect(parseStore('{"version":99,"sessions":[1]}')).toEqual(emptyStore());
    expect(parseStore('[1,2]')).toEqual(emptyStore());
  });
  it('drops malformed entries but keeps good ones', () => {
    const s = parseStore(JSON.stringify({ version: 1, sessions: [{ date: '2026-01-01', type: 'yoga' }, 5, null], activeSession: 'x', lastSets: 3, planCache: 7 }));
    expect(s.sessions).toHaveLength(1);
    expect(s.activeSession).toBeNull();
    expect(s.lastSets).toEqual({});
    expect(s.planCache).toBeNull();
  });
  it('round-trips', () => {
    const st = mem();
    const s = emptyStore();
    s.lastSets.curl = { weight: '20', reps: '12' };
    expect(saveStore(s, st)).toBe(true);
    expect(loadStore(st).lastSets.curl).toEqual({ weight: '20', reps: '12' });
  });
  it('throwing storage is safe', () => {
    const bad = { getItem: () => { throw new Error('x'); }, setItem: () => { throw new Error('x'); } };
    expect(loadStore(bad)).toEqual(emptyStore());
    expect(saveStore(emptyStore(), bad)).toBe(false);
  });
  it('uses a versioned key', () => expect(STORAGE_KEY).toContain('v1'));
});
