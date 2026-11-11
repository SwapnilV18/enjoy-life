export type Muscle = 'back' | 'legs' | 'chest' | 'biceps' | 'shoulders' | 'triceps' | 'abs' | 'cardio' | 'mobility';
export type WorkoutKind = 'strength' | 'jogging' | 'yoga';

export interface Exercise {
  id: string;
  name: string;
  muscle: Muscle;
  /** Fixed prescription shown instead of free set entry defaults, e.g. 4 × 50. */
  target?: { sets: number; reps: number };
}

export interface TimedStep {
  id: string;
  name: string;
  /** Share of the session, in relative weight (used to lay out the sequence). */
  weight: number;
}

export interface WorkoutType {
  id: WorkoutTypeId;
  name: string;
  kind: WorkoutKind;
  /** Primary muscle groups, used to avoid training the same muscles on consecutive days. */
  muscles: Muscle[];
  exercises: Exercise[];
}

export type WorkoutTypeId = 'jogging' | 'back-legs' | 'chest-legs' | 'biceps-shoulders' | 'triceps-abs' | 'yoga';

const ex = (id: string, name: string, muscle: Muscle, target?: Exercise['target']): Exercise => ({ id, name, muscle, target });

/** Fixed library order; also the tie-break order for recommendations. */
export const WORKOUT_TYPES: WorkoutType[] = [
  {
    id: 'jogging',
    name: 'Jogging (HIIT)',
    kind: 'jogging',
    muscles: [],
    exercises: [ex('jog-warmup', 'Easy jog', 'cardio'), ex('jog-sprint', 'Sprint', 'cardio'), ex('jog-recover', 'Walk / recover', 'cardio')],
  },
  {
    id: 'back-legs',
    name: 'Back and Legs',
    kind: 'strength',
    muscles: ['back', 'legs'],
    exercises: [ex('pull-ups', 'Pull-ups', 'back'), ex('squats', 'Squats', 'legs'), ex('chest-supported-row', 'Chest-supported row', 'back')],
  },
  {
    id: 'chest-legs',
    name: 'Chest and Legs',
    kind: 'strength',
    muscles: ['chest', 'legs'],
    exercises: [
      ex('incline-bench-press', 'Incline bench press', 'chest'),
      ex('lunges', 'Lunges', 'legs', { sets: 4, reps: 50 }),
      ex('incline-fly', 'Incline fly', 'chest'),
    ],
  },
  {
    id: 'biceps-shoulders',
    name: 'Biceps and Shoulders',
    kind: 'strength',
    muscles: ['biceps', 'shoulders'],
    exercises: [
      ex('curl', 'Curl', 'biceps'),
      ex('seated-shoulder-press', 'Seated shoulder press', 'shoulders'),
      ex('hammer-curl', 'Hammer curl', 'biceps'),
      ex('side-raise', 'Side raise', 'shoulders'),
      ex('front-raise', 'Front raise', 'shoulders'),
    ],
  },
  {
    id: 'triceps-abs',
    name: 'Triceps and Abs',
    kind: 'strength',
    muscles: ['triceps', 'abs'],
    exercises: [
      ex('triceps-pullover', 'Dumbbell triceps pullover', 'triceps'),
      ex('ab-cycle', 'Ab cycle', 'abs'),
      ex('triceps-extension', 'Dumbbell triceps extension', 'triceps'),
      ex('ab-crunch', 'Ab crunch', 'abs'),
      ex('hanging-abs', 'Hanging abs', 'abs'),
    ],
  },
  {
    id: 'yoga',
    name: 'Yoga',
    kind: 'yoga',
    muscles: [],
    exercises: [
      ex('cat-cow', 'Cat-cow', 'mobility'),
      ex('superman', 'Superman', 'mobility'),
      ex('cross-body-stretch', 'Cross-body stretch', 'mobility'),
      ex('upward-stretch', 'Upward stretch', 'mobility'),
      ex('childs-pose', "Child's pose", 'mobility'),
      ex('hug-knees', 'Hug knees to chest', 'mobility'),
    ],
  },
];

export function getType(id: WorkoutTypeId): WorkoutType {
  const t = WORKOUT_TYPES.find((w) => w.id === id);
  if (!t) throw new Error(`Unknown workout type ${id}`);
  return t;
}

export function allExercises(): Exercise[] {
  return WORKOUT_TYPES.flatMap((t) => t.exercises);
}

export function getExercise(id: string): Exercise | undefined {
  return allExercises().find((e) => e.id === id);
}

/**
 * Group exercises into supersets: take the first remaining exercise and pair it with
 * the next remaining exercise of a different muscle (falling back to the next one),
 * leaving a final odd exercise alone.
 */
export function pairExercises(exercises: Exercise[]): Exercise[][] {
  const rest = [...exercises];
  const pairs: Exercise[][] = [];
  while (rest.length > 0) {
    const first = rest.shift()!;
    if (rest.length === 0) {
      pairs.push([first]);
      break;
    }
    let i = rest.findIndex((e) => e.muscle !== first.muscle);
    if (i < 0) i = 0;
    pairs.push([first, rest.splice(i, 1)[0]]);
  }
  return pairs;
}

/** Display label for the exercise target, e.g. "4 × 50". */
export function targetLabel(e: Exercise): string | undefined {
  return e.target ? `${e.target.sets} × ${e.target.reps}` : undefined;
}

export const JOG_INTERVALS = { warmupSec: 120, sprintSec: 30, recoverSec: 60 };

/** Build the timed sequence for jogging/yoga for a given total duration (minutes). */
export function buildTimedSequence(type: WorkoutType, minutes: number): { exercise: Exercise; seconds: number }[] {
  const total = minutes * 60;
  if (type.kind === 'jogging') {
    const [warm, sprint, recover] = type.exercises;
    const seq: { exercise: Exercise; seconds: number }[] = [{ exercise: warm, seconds: JOG_INTERVALS.warmupSec }];
    let used = JOG_INTERVALS.warmupSec;
    const round = JOG_INTERVALS.sprintSec + JOG_INTERVALS.recoverSec;
    while (used + round <= total) {
      seq.push({ exercise: sprint, seconds: JOG_INTERVALS.sprintSec }, { exercise: recover, seconds: JOG_INTERVALS.recoverSec });
      used += round;
    }
    if (used < total) seq.push({ exercise: warm, seconds: total - used });
    return seq;
  }
  const per = Math.floor(total / type.exercises.length);
  return type.exercises.map((exercise, i) => ({
    exercise,
    seconds: i === type.exercises.length - 1 ? total - per * (type.exercises.length - 1) : per,
  }));
}
