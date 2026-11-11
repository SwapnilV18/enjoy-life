import type { DateKey } from './domain/dates';
import type { Recommendation } from './domain/plan';
import type { LoggedSet, Session } from './domain/types';

const KEY = 'enjoy-life:v1';
export const SCHEMA_VERSION = 1;

export interface Store {
  version: number;
  sessions: Session[]; // finished (completed) sessions only
  activeSession: Session | null;
  lastSets: Record<string, LoggedSet>; // last-used weight × reps per exercise id
  planCache: { date: DateKey; rec: Recommendation } | null;
}

export const emptyStore = (): Store => ({ version: SCHEMA_VERSION, sessions: [], activeSession: null, lastSets: {}, planCache: null });

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);

/** Parse defensively: anything malformed falls back to defaults rather than throwing. */
export function parseStore(raw: string | null): Store {
  const base = emptyStore();
  if (!raw) return base;
  try {
    const d = JSON.parse(raw);
    if (!isObj(d) || d.version !== SCHEMA_VERSION) return base;
    return {
      version: SCHEMA_VERSION,
      sessions: Array.isArray(d.sessions) ? (d.sessions.filter((s) => isObj(s) && typeof s.date === 'string' && typeof s.type === 'string') as unknown as Session[]) : [],
      activeSession: isObj(d.activeSession) && typeof d.activeSession.startedAt === 'number' ? (d.activeSession as unknown as Session) : null,
      lastSets: isObj(d.lastSets) ? (d.lastSets as Store['lastSets']) : {},
      planCache: isObj(d.planCache) && typeof d.planCache.date === 'string' && isObj(d.planCache.rec) ? (d.planCache as unknown as Store['planCache']) : null,
    };
  } catch {
    return base;
  }
}

export function loadStore(storage: Pick<Storage, 'getItem'> = globalThis.localStorage): Store {
  try {
    return parseStore(storage.getItem(KEY));
  } catch {
    return emptyStore();
  }
}

export function saveStore(store: Store, storage: Pick<Storage, 'setItem'> = globalThis.localStorage): boolean {
  try {
    storage.setItem(KEY, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
}

/** Ask the browser to keep our data; ignored where unsupported. */
export async function requestPersistence(): Promise<void> {
  try {
    await navigator.storage?.persist?.();
  } catch {
    /* ignore */
  }
}

export const STORAGE_KEY = KEY;
