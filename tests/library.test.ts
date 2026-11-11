import { describe, expect, it } from 'vitest';
import { WORKOUT_TYPES, getType, pairExercises, buildTimedSequence, targetLabel } from '../src/domain/library';

const names = (id: Parameters<typeof getType>[0]) => getType(id).exercises.map((e) => e.name);

describe('library', () => {
  it('has exactly the six types', () => {
    expect(WORKOUT_TYPES.map((t) => t.name)).toEqual([
      'Jogging (HIIT)', 'Back and Legs', 'Chest and Legs', 'Biceps and Shoulders', 'Triceps and Abs', 'Yoga',
    ]);
  });
  it('Back and Legs contents', () => {
    expect(names('back-legs')).toEqual(['Pull-ups', 'Squats', 'Chest-supported row']);
  });
  it('Chest and Legs: incline bench first, lunges 4 × 50', () => {
    const t = getType('chest-legs');
    expect(t.exercises[0].name).toBe('Incline bench press');
    expect(names('chest-legs')).toContain('Incline fly');
    expect(targetLabel(t.exercises.find((e) => e.id === 'lunges')!)).toBe('4 × 50');
  });
  it('Biceps and Shoulders contents', () => {
    expect([...names('biceps-shoulders')].sort()).toEqual(
      ['Curl', 'Front raise', 'Hammer curl', 'Seated shoulder press', 'Side raise'].sort());
  });
  it('Triceps and Abs contents', () => {
    expect([...names('triceps-abs')].sort()).toEqual(
      ['Ab crunch', 'Ab cycle', 'Dumbbell triceps extension', 'Dumbbell triceps pullover', 'Hanging abs'].sort());
  });
  it('Yoga has cat-cow, superman, a cross pose and more', () => {
    const ids = getType('yoga').exercises.map((e) => e.id);
    expect(ids).toEqual(expect.arrayContaining(['cat-cow', 'superman', 'cross-body-stretch']));
    expect(ids.length).toBeGreaterThan(3);
  });
  it('timed sequences fill the duration exactly', () => {
    for (const id of ['jogging', 'yoga'] as const) {
      const total = buildTimedSequence(getType(id), 15).reduce((s, x) => s + x.seconds, 0);
      expect(total).toBe(900);
    }
  });
});

describe('superset pairing', () => {
  const pairNames = (id: Parameters<typeof getType>[0]) => pairExercises(getType(id).exercises).map((p) => p.map((e) => e.name));
  it('Back and Legs: pull-ups+squats, row alone', () => {
    expect(pairNames('back-legs')).toEqual([['Pull-ups', 'Squats'], ['Chest-supported row']]);
  });
  it('Chest and Legs: incline bench paired with lunges', () => {
    expect(pairNames('chest-legs')).toEqual([['Incline bench press', 'Lunges'], ['Incline fly']]);
  });
  it('Biceps and Shoulders pairs mix muscles, last alone', () => {
    const pairs = pairExercises(getType('biceps-shoulders').exercises);
    expect(pairs.map((p) => p.length)).toEqual([2, 2, 1]);
    for (const p of pairs.filter((x) => x.length === 2)) expect(p[0].muscle).not.toBe(p[1].muscle);
  });
  it('Triceps and Abs mixes triceps and abs', () => {
    const pairs = pairExercises(getType('triceps-abs').exercises);
    expect(pairs.map((p) => p.length)).toEqual([2, 2, 1]);
    for (const p of pairs.filter((x) => x.length === 2)) expect(p[0].muscle).not.toBe(p[1].muscle);
  });
  it('odd count leaves the last alone; single muscle falls back to next', () => {
    const e = (id: string, muscle: 'back') => ({ id, name: id, muscle });
    expect(pairExercises([e('a', 'back'), e('b', 'back'), e('c', 'back')]).map((p) => p.length)).toEqual([2, 1]);
  });
});
