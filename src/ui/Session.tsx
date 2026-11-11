import { useMemo, useState } from 'preact/hooks';
import { buildTimedSequence, getExercise, getType, pairExercises } from '../domain/library';
import { formatClock, timerView } from '../domain/session';
import type { LoggedSet, Session as SessionT } from '../domain/types';
import type { Store } from '../storage';
import { useNow, useWakeLock } from './hooks';
import { ExerciseMedia } from './Media';
import { ExerciseCard } from './SetFields';

interface Props {
  session: SessionT;
  lastSets: Store['lastSets'];
  onLog: (exerciseId: string, sets: LoggedSet[]) => void;
  onFinish: () => void;
  onDiscard: () => void;
}

export function Timer({ session }: { session: SessionT }) {
  const now = useNow();
  const v = timerView(session.startedAt, session.durationMin, now);
  return (
    <div class={v.overtime ? 'timer over' : 'timer'} data-testid="timer" role="timer" aria-live="off">
      {v.overtime ? '+' : ''}{formatClock(v.seconds)}
      <small>{v.overtime ? 'overtime' : 'remaining'}</small>
    </div>
  );
}

function defaultSets(exId: string, lastSets: Store['lastSets']): LoggedSet[] {
  const ex = getExercise(exId)!;
  const last = lastSets[exId];
  const n = ex.target?.sets ?? 3;
  const base: LoggedSet = last ?? { weight: '', reps: ex.target ? String(ex.target.reps) : '' };
  return Array.from({ length: n }, () => ({ ...base }));
}

function Controls({ onFinish, onDiscard }: Pick<Props, 'onFinish' | 'onDiscard'>) {
  const [confirm, setConfirm] = useState(false);
  return (
    <div class="controls">
      {confirm ? (
        <>
          <span>Discard this session?</span>
          <button class="chip danger" onClick={onDiscard}>Yes, discard</button>
          <button class="chip" onClick={() => setConfirm(false)}>Keep going</button>
        </>
      ) : (
        <button class="link" onClick={() => setConfirm(true)}>Discard</button>
      )}
    </div>
  );
}

function StrengthBody({ session, lastSets, onLog, onFinish }: Props) {
  const pairs = useMemo(() => pairExercises(getType(session.type).exercises), [session.type]);
  const [idx, setIdx] = useState(0);
  const pair = pairs[idx];
  const isLast = idx === pairs.length - 1;
  return (
    <>
      <p class="meta">Pair {idx + 1} of {pairs.length}</p>
      <div class="pair">
        {pair.map((ex) => (
          <ExerciseCard key={ex.id} exercise={ex} sets={session.sets[ex.id] ?? defaultSets(ex.id, lastSets)} onChange={(s) => onLog(ex.id, s)} />
        ))}
      </div>
      {isLast ? (
        <button class="primary" onClick={onFinish}>Finish</button>
      ) : (
        <button class="primary" onClick={() => setIdx(idx + 1)}>Next</button>
      )}
    </>
  );
}

function TimedBody({ session, onFinish }: Props) {
  const now = useNow();
  const seq = useMemo(() => buildTimedSequence(getType(session.type), session.durationMin), [session.type, session.durationMin]);
  const elapsed = Math.floor((now - session.startedAt) / 1000);
  let acc = 0;
  let cur = seq.length - 1;
  let left = 0;
  for (let i = 0; i < seq.length; i++) {
    if (elapsed < acc + seq[i].seconds) {
      cur = i;
      left = acc + seq[i].seconds - elapsed;
      break;
    }
    acc += seq[i].seconds;
  }
  const step = seq[cur];
  const next = seq[cur + 1];
  return (
    <>
      <section class="card single" data-testid="timed-step">
        <ExerciseMedia id={step.exercise.id} name={step.exercise.name} />
        <div class="card-body">
          <h3>{step.exercise.name}</h3>
          <p class="meta">{left > 0 ? `${formatClock(left)} left in this step` : 'Keep going'}</p>
          {next && <p class="meta">Next: {next.exercise.name}</p>}
        </div>
      </section>
      <button class="primary" onClick={onFinish}>Finish</button>
    </>
  );
}

export function SessionScreen(props: Props) {
  const { session } = props;
  useWakeLock(true);
  const type = getType(session.type);
  return (
    <main class="screen session">
      <header><span class="meta">{type.name}</span></header>
      <Timer session={session} />
      {type.kind === 'strength' ? <StrengthBody {...props} /> : <TimedBody {...props} />}
      <Controls onFinish={props.onFinish} onDiscard={props.onDiscard} />
    </main>
  );
}
