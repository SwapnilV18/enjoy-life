/** Short, discreet reminder messages shown on the landing screen. */
export const NUDGES: readonly string[] = [
  'Your future self is already thanking you. Start now.',
  'Fifteen minutes. That is all today asks of you.',
  'The hardest part is opening the app. You did that.',
  'Show up for yourself this morning.',
  'Small steps, every day. Take today’s.',
  'Tie the laces. The rest follows.',
  'Make today a good one, starting with this.',
  'You do not need motivation. You need a start.',
  'Do it now, enjoy the rest of the day more.',
  'A strong day begins with a few good minutes.',
  'Keep the streak glowing. One more day.',
  'Be the person who showed up.',
  'Energy comes after you begin, not before.',
  'Five minutes in, you will be glad you came.',
  'Your body is ready. Let it have its moment.',
  'Not perfect, just present. Press Start.',
  'Quiet win time. Go get it.',
  'Move a little, feel a lot better.',
  'Today counts. Let it count.',
  'The best time to start is right about now.',
];

export interface NudgeState {
  order: number[];
  pos: number;
  last: number;
}

const isInt = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n);

/** True when the saved state is a valid permutation of 0..size-1 with an in-range position. */
export function validNudgeState(s: unknown, size: number): s is NudgeState {
  if (typeof s !== 'object' || s === null) return false;
  const { order, pos, last } = s as Partial<NudgeState>;
  if (!Array.isArray(order) || order.length !== size || !isInt(pos) || !isInt(last)) return false;
  if (pos < 0 || pos > size || last < -1 || last >= size) return false;
  const seen = new Set(order);
  return seen.size === size && order.every((i) => isInt(i) && i >= 0 && i < size);
}

function shuffled(size: number, rng: () => number): number[] {
  const a = Array.from({ length: size }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Draw the next message index from a shuffle bag. Every index is used once per
 * cycle; the first of a new cycle never equals the last shown.
 */
export function nextMessage(state: NudgeState | null, size: number, rng: () => number = Math.random): { index: number; state: NudgeState } {
  if (size <= 0) throw new Error('empty pool');
  let s: NudgeState = validNudgeState(state, size) ? state : { order: shuffled(size, rng), pos: 0, last: -1 };
  if (s.pos >= size) {
    const order = shuffled(size, rng);
    if (size > 1 && order[0] === s.last) [order[0], order[1]] = [order[1], order[0]];
    s = { order, pos: 0, last: s.last };
  }
  const index = s.order[s.pos];
  return { index, state: { order: s.order, pos: s.pos + 1, last: index } };
}
