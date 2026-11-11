import type { Exercise } from '../domain/library';
import { targetLabel } from '../domain/library';
import type { LoggedSet } from '../domain/types';
import { ExerciseMedia } from './Media';

interface Props {
  exercise: Exercise;
  sets: LoggedSet[];
  onChange: (sets: LoggedSet[]) => void;
}

export function ExerciseCard({ exercise, sets, onChange }: Props) {
  const set = (i: number, patch: Partial<LoggedSet>) => onChange(sets.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const last = sets[sets.length - 1] ?? { weight: '', reps: '' };
  const target = targetLabel(exercise);
  return (
    <section class="card" data-testid={`ex-${exercise.id}`}>
      <ExerciseMedia id={exercise.id} name={exercise.name} />
      <div class="card-body">
        <h3>{exercise.name}{target && <span class="target"> · {target}</span>}</h3>
        <ol class="sets">
          {sets.map((s, i) => (
            <li key={i}>
              <input inputMode="decimal" aria-label={`${exercise.name} set ${i + 1} weight`} placeholder="kg" value={s.weight} onInput={(e) => set(i, { weight: (e.target as HTMLInputElement).value })} />
              <span>×</span>
              <input inputMode="numeric" aria-label={`${exercise.name} set ${i + 1} reps`} placeholder="reps" value={s.reps} onInput={(e) => set(i, { reps: (e.target as HTMLInputElement).value })} />
            </li>
          ))}
        </ol>
        <button class="chip" onClick={() => onChange([...sets, { ...last }])}>+ Set</button>
      </div>
    </section>
  );
}
