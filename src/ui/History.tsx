import { useState } from 'preact/hooks';
import { addDays, dateKey, parseKey, type DateKey } from '../domain/dates';
import { getExercise, getType } from '../domain/library';
import { EDIT_MESSAGES, editSessionTimes, sessionsOn, type EditResult } from '../domain/session';
import type { Session } from '../domain/types';
import type { Store } from '../storage';

const pad = (n: number) => String(n).padStart(2, '0');

/** epoch ms -> value for <input type="datetime-local"> in local time. */
export function toLocalInput(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
export const fromLocalInput = (v: string): number => (v ? new Date(v).getTime() : NaN);

const clock = (t: number) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/** Cells of a month grid, Monday first: null for leading blanks, then each day key. */
export function monthCells(year: number, month: number): (DateKey | null)[] {
  const first = dateKey(new Date(year, month, 1));
  const lead = (parseKey(first).getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0).getDate();
  return [...Array<null>(lead).fill(null), ...Array.from({ length: count }, (_, i) => addDays(first, i))];
}

function SessionLog({ s, extra, onSave }: { s: Session; extra: boolean; onSave: (id: string, start: number, stop: number) => EditResult }) {
  const [start, setStart] = useState(toLocalInput(s.startedAt));
  const [stop, setStop] = useState(s.stoppedAt ? toLocalInput(s.stoppedAt) : '');
  const [msg, setMsg] = useState<string | null>(null);
  const mins = s.stoppedAt ? Math.round((s.stoppedAt - s.startedAt) / 60000) : 0;
  const exercises = Object.entries(s.sets).filter(([, sets]) => sets.some((x) => x.weight !== '' || x.reps !== ''));
  return (
    <section class="log-card" data-testid="log-session">
      <h3>{getType(s.type).name}{extra && <span class="tag">Extra</span>}</h3>
      <p class="meta" data-testid="log-times">{clock(s.startedAt)}{s.stoppedAt ? ` – ${clock(s.stoppedAt)} · ${mins} min` : ''}</p>
      {exercises.length > 0 && (
        <ul class="log-sets">
          {exercises.map(([id, sets]) => (
            <li key={id}>{getExercise(id)?.name ?? id}: {sets.filter((x) => x.weight !== '' || x.reps !== '').map((x) => `${x.weight || '–'} × ${x.reps || '–'}`).join(', ')}</li>
          ))}
        </ul>
      )}
      <div class="edit">
        <label>Start<input type="datetime-local" aria-label="Start time" value={start} onInput={(e) => setStart((e.target as HTMLInputElement).value)} /></label>
        <label>End<input type="datetime-local" aria-label="End time" value={stop} onInput={(e) => setStop((e.target as HTMLInputElement).value)} /></label>
        <button
          class="chip"
          onClick={() => {
            const r = onSave(s.id, fromLocalInput(start), fromLocalInput(stop));
            setMsg(r.ok ? 'Saved.' : EDIT_MESSAGES[r.error]);
          }}
        >
          Save times
        </button>
        {msg && <p class="meta" role="status" data-testid="edit-msg">{msg}</p>}
      </div>
    </section>
  );
}

interface Props {
  store: Store;
  onBack: () => void;
  onSave: (id: string, start: number, stop: number) => EditResult;
  now?: number;
}

export function History({ store, onBack, onSave, now = Date.now() }: Props) {
  const todayKey = dateKey(now);
  const [ym, setYm] = useState(() => ({ y: new Date(now).getFullYear(), m: new Date(now).getMonth() }));
  const [selected, setSelected] = useState<DateKey | null>(null);
  const cells = monthCells(ym.y, ym.m);
  const shift = (n: number) => {
    const d = new Date(ym.y, ym.m + n, 1);
    setYm({ y: d.getFullYear(), m: d.getMonth() });
    setSelected(null);
  };
  const title = new Date(ym.y, ym.m, 1).toLocaleDateString([], { month: 'long', year: 'numeric' });
  const day = selected ? sessionsOn(store, selected) : [];

  return (
    <main class="screen history">
      <button class="link" onClick={onBack}>← Back</button>
      <div class="cal-head">
        <button class="chip" aria-label="Previous month" onClick={() => shift(-1)}>‹</button>
        <h2 data-testid="cal-title">{title}</h2>
        <button class="chip" aria-label="Next month" onClick={() => shift(1)}>›</button>
      </div>
      <div class="cal" role="grid">
        {WEEKDAYS.map((w, i) => <span key={i} class="dow">{w}</span>)}
        {cells.map((k, i) => {
          if (!k) return <span key={`b${i}`} />;
          const n = sessionsOn(store, k).length;
          const cls = ['day', n ? 'on' : '', n > 1 ? 'extra' : '', k === todayKey ? 'now' : '', k === selected ? 'sel' : ''].join(' ').trim();
          return (
            <button key={k} class={cls} data-testid={`cal-day-${k}`} data-sessions={n} aria-label={`${k}${n ? `, ${n} session${n > 1 ? 's' : ''}` : ''}`} onClick={() => setSelected(k)}>
              {Number(k.slice(8))}
            </button>
          );
        })}
      </div>
      {selected && (
        <div class="day-log" data-testid="day-log">
          <h3>{parseKey(selected).toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
          {day.length === 0 ? <p class="meta" data-testid="no-session">No session logged this day.</p> : day.map((s, i) => <SessionLog key={s.id} s={s} extra={i > 0} onSave={onSave} />)}
        </div>
      )}
    </main>
  );
}

export function Forgotten({ session, onFinish, onDiscard, now = Date.now() }: { session: Session; onFinish: (stopMs: number) => EditResult; onDiscard: () => void; now?: number }) {
  const [stop, setStop] = useState(toLocalInput(Math.min(now, session.startedAt + session.durationMin * 60000)));
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <main class="screen home" data-testid="forgotten">
      <h2>A session was left running</h2>
      <p class="meta">{getType(session.type).name}, started {new Date(session.startedAt).toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })}</p>
      <label class="edit">When did you finish?
        <input type="datetime-local" aria-label="End time" value={stop} onInput={(e) => setStop((e.target as HTMLInputElement).value)} />
      </label>
      <button
        class="primary"
        onClick={() => {
          const r = onFinish(fromLocalInput(stop));
          if (!r.ok) setMsg(EDIT_MESSAGES[r.error]);
        }}
      >
        Finish it at this time
      </button>
      {msg && <p class="meta" role="status" data-testid="edit-msg">{msg}</p>}
      <button class="link" onClick={onDiscard}>Discard it</button>
    </main>
  );
}
