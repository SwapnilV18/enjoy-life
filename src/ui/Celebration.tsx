import { useEffect, useState } from 'preact/hooks';
import { formatClock } from '../domain/session';
import type { StreakInfo } from '../domain/streak';
import type { Session } from '../domain/types';
import { StreakBar } from './Home';
import { prefersReducedMotion } from './hooks';

const clock = (t: number) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export function Celebration({ session, streak, onHome, messageMs = 4500 }: { session: Session; streak: StreakInfo; onHome: () => void; messageMs?: number }) {
  const [phase, setPhase] = useState<'message' | 'summary'>('message');
  const reduced = prefersReducedMotion();
  useEffect(() => {
    const id = setTimeout(() => setPhase('summary'), messageMs);
    return () => clearTimeout(id);
  }, [messageMs]);

  if (phase === 'message') {
    return (
      <main class={reduced ? 'screen celebrate still' : 'screen celebrate'} data-testid="celebration" onClick={() => setPhase('summary')}>
        {!reduced && (
          <div class="burst" aria-hidden="true">
            {Array.from({ length: 12 }, (_, i) => <i key={i} style={{ '--a': `${i * 30}deg` }} />)}
          </div>
        )}
        <p class="line1">I know how you are feeling…</p>
        <p class="line2">SuperStar.</p>
      </main>
    );
  }
  const stop = session.stoppedAt ?? session.startedAt;
  return (
    <main class="screen summary" data-testid="summary">
      <h1>SuperStar.</h1>
      <p class="dur" data-testid="summary-duration">{formatClock(Math.round((stop - session.startedAt) / 1000))}</p>
      <p class="meta" data-testid="summary-times">Started {clock(session.startedAt)} · Stopped {clock(stop)}</p>
      <StreakBar info={streak} />
      <button class="primary" onClick={onHome}>Home</button>
    </main>
  );
}
