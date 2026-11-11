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

export function Masthead() {
  return (
    <h1 class="mast" aria-label="Enjoy Life">
      <span class="w1" aria-hidden="true">Enjoy</span>{' '}
      <span class="w2" aria-hidden="true">Life</span>
    </h1>
  );
}

function Flame() {
  return (
    <svg class="flame" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2c1 4-3 5.5-3 9.5 0 1.6.9 3 2.2 3.6-.6-1.4.3-3 1.8-4.1.2 2 2 2.8 2 5 0 2.8-1.8 5-3 5s-6-1.6-6-6.5C6 8 11 6.500 12 2z" fill="currentColor" />
    </svg>
  );
}

export function StreakHero({ info }: { info: StreakInfo }) {
  const filled = Math.min(info.weekCount, info.target);
  return (
    <div class="hero-streak" data-testid="streak">
      <Flame />
      <span class="num">{info.streak}</span>
      <span class="cap">{info.streak > 0 ? 'day streak' : 'Start today to begin a streak'}</span>
      <div class="dots" aria-hidden="true">
        {Array.from({ length: info.target }, (_, i) => <i key={i} class={i < filled ? 'on' : ''} />)}
      </div>
      <span class="wk" data-testid="week-progress">{info.weekCount} of {info.target}</span>
      <span class="cap">this week</span>
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
        <Masthead />
        <StreakHero info={streak} />
        <p class="done" data-testid="done-today">Today is done. SuperStar.</p>
        <p class="meta">{getType(done.type).name}{done.stoppedAt ? ` · ${clock(done.startedAt)} – ${clock(done.stoppedAt)}` : ''}</p>
        <p class="meta">See you tomorrow.</p>
      </main>
    );
  }
  return (
    <main class="screen home">
      <Masthead />
      <StreakHero info={streak} />
      <p class="meta">Today</p>
      <h2 class="today" data-testid="recommendation">{getType(rec.type).name}</h2>
      <p class="dur" data-testid="duration">{rec.durationMin} minutes</p>
      <button class="primary" onClick={() => onStart(rec.type)}>Start</button>
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
