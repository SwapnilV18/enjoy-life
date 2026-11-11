import type { WorkoutTypeId } from './library';
import type { DateKey } from './dates';

export interface LoggedSet { weight: string; reps: string }

export interface Session {
  id: string;
  date: DateKey; // local date of start
  type: WorkoutTypeId;
  durationMin: 15 | 20;
  startedAt: number; // epoch ms
  stoppedAt?: number; // set when finished
  completed: boolean;
  sets: Record<string, LoggedSet[]>; // by exercise id
}
