import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { allExercises } from '../src/domain/library';

describe('exercise media', () => {
  it('every exercise id resolves to an two existing, small photo frames', () => {
    for (const e of allExercises()) {
      for (const n of [0, 1]) {
        const p = fileURLToPath(new URL(`../public/media/${e.id}-${n}.jpg`, 'file://' + __dirname + '/'));
        expect(existsSync(p), `${e.id}-${n}`).toBe(true);
        expect(readFileSync(p).length).toBeLessThan(300 * 1024);
      }
    }
  });
});
