import { useState } from 'preact/hooks';
import { WORKOUT_TYPES, getType, type WorkoutTypeId } from '../domain/library';
import type { Recommendation } from '../domain/plan';
import type { StreakInfo } from '../domain/streak';
import type { Session } from '../domain/types';

export function StreakBar({ info }: { info: StreakInfo }) {
  return (
    <div class="streak" data-testid="streak">
      <div><span class="big">{info.streak}</span><span class="lbl">day streak</span></div>
      <div>
        <span class="big" data-testid="week-progress">{info.weekCount} of {info.target}</span>
        <span class="lbl">this week</span>
      </div>
    </div>
  );
}

const clock = (t: number) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

interface Props {
  rec: Recommendation;
  streak: StreakInfo;
  done?: Session;
  onStart: (type: WorkoutTypeId) => void;
}

export function Home({ rec, streak, done, onStart }: Props) {
  const [choosing, setChoosing] = useState(false);
  if (done) {
    return (
      <main class="screen home">
        <h1>Enjoy Life</h1>
        <p class="done" data-testid="done-today">Today is done. SuperStar.</p>
        <p class="meta">{getType(done.type).name}{done.stoppedAt ? ` · ${clock(done.startedAt)} – ${clock(done.stoppedAt)}` : ''}</p>
        <StreakBar info={streak} />
        <p class="meta">See you tomorrow.</p>
      </main>
    );
  }
  return (
    <main class="screen home">
      <h1>Enjoy Life</h1>
      <p class="meta">Today</p>
      <h2 class="today" data-testid="recommendation">{getType(rec.type).name}</h2>
      <p class="dur" data-testid="duration">{rec.durationMin} minutes</p>
      <button class="primary" onClick={() => onStart(rec.type)}>Start</button>
      <StreakBar info={streak} />
      {choosing ? (
        <div class="chooser" role="group" aria-label="Choose another type">
          {WORKOUT_TYPES.map((t) => (
            <button key={t.id} class={t.id === rec.type ? 'chip on' : 'chip'} onClick={() => onStart(t.id)}>{t.name}</button>
          ))}
        </div>
      ) : (
        <button class="link" onClick={() => setChoosing(true)}>Do something else</button>
      )}
    </main>
  );
}
