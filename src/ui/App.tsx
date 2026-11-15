import { useEffect, useRef, useState } from 'preact/hooks';
import { dateKey } from '../domain/dates';
import type { WorkoutTypeId } from '../domain/library';
import { MAX_SESSIONS_PER_DAY, discardSession, doneToday, editSessionTimes, extraType, finishAt, finishSession, isStale, logSets, sessionsOn, startSession, streakFor, todaysPlan, type EditResult } from '../domain/session';
import { NUDGES, nextMessage } from '../domain/nudge';
import type { LoggedSet, Session } from '../domain/types';
import { loadStore, requestPersistence, saveStore, type Store } from '../storage';
import { Celebration } from './Celebration';
import { Forgotten, History } from './History';
import { Home } from './Home';
import { SessionScreen } from './Session';

export function App() {
  const [store, setStore] = useState<Store>(() => loadStore());
  const ref = useRef(store);
  const [finished, setFinished] = useState<Session | null>(null);
  const [today, setToday] = useState(() => dateKey(Date.now()));
  const [view, setView] = useState<'home' | 'history'>('home');

  const commit = (s: Store) => {
    ref.current = s;
    saveStore(s);
    setStore(s);
  };

  useEffect(() => {
    requestPersistence();
    const onVis = () => setToday(dateKey(Date.now()));
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const plan = todaysPlan(store, today);
  useEffect(() => {
    if (plan.store !== store) commit(plan.store);
  }, [plan.store]);

  // One fresh message per open (cold start or returning to the app), only while today is not done.
  const [nudge, setNudge] = useState<string | null>(null);
  useEffect(() => {
    const open = () => {
      if (document.visibilityState === 'hidden') return;
      const cur = ref.current;
      if (cur.activeSession || doneToday(cur, dateKey(Date.now()))) return;
      const { index, state } = nextMessage(cur.nudge, NUDGES.length);
      commit({ ...cur, nudge: state });
      setNudge(NUDGES[index]);
    };
    open();
    document.addEventListener('visibilitychange', open);
    return () => document.removeEventListener('visibilitychange', open);
  }, []);

  if (store.activeSession && isStale(store.activeSession, Date.now())) {
    return (
      <Forgotten
        session={store.activeSession}
        onFinish={(stopMs: number): EditResult => {
          const r = finishAt(ref.current, stopMs, Date.now());
          if (r.ok) commit(r.store);
          return r;
        }}
        onDiscard={() => commit(discardSession(ref.current))}
      />
    );
  }

  if (store.activeSession) {
    return (
      <SessionScreen
        session={store.activeSession}
        lastSets={store.lastSets}
        onLog={(id: string, sets: LoggedSet[]) => commit(logSets(ref.current, id, sets))}
        onFinish={() => {
          const next = finishSession(ref.current, Date.now());
          setFinished(next.sessions[next.sessions.length - 1]);
          commit(next);
        }}
        onDiscard={() => commit(discardSession(ref.current))}
      />
    );
  }

  const streak = streakFor(store, today);
  if (finished) return <Celebration session={finished} streak={streak} onHome={() => setFinished(null)} />;

  if (view === 'history') {
    return (
      <History
        store={store}
        onBack={() => setView('home')}
        onSave={(id: string, start: number, stop: number): EditResult => {
          const r = editSessionTimes(ref.current, id, start, stop, Date.now());
          if (r.ok) commit(r.store);
          return r;
        }}
      />
    );
  }

  return (
    <Home
      rec={plan.rec}
      canExtra={sessionsOn(store, today).length < MAX_SESSIONS_PER_DAY}
      extraType={extraType(store, today)}
      onHistory={() => setView('history')}
      nudge={nudge ?? undefined}
      streak={streak}
      done={doneToday(store, today)}
      onStart={(type: WorkoutTypeId) => {
        const next = startSession(ref.current, type, plan.rec.durationMin, Date.now());
        if (next) commit(next);
      }}
    />
  );
}
