import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/preact';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../src/ui/App';
import { Celebration } from '../src/ui/Celebration';
import { emptyStore, saveStore, loadStore } from '../src/storage';
import { dateKey } from '../src/domain/dates';
import type { Session } from '../src/domain/types';

const NOW = new Date(2026, 0, 7, 7, 30, 0); // Wednesday

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
  vi.setSystemTime(NOW);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const doneSession = (date: string, type: Session['type'] = 'yoga'): Session => ({
  id: 's' + date, date, type, durationMin: 15, startedAt: new Date(date + 'T07:00:00').getTime(), stoppedAt: new Date(date + 'T07:12:00').getTime(), completed: true, sets: {},
});

function seed(patch: Partial<ReturnType<typeof emptyStore>>) {
  saveStore({ ...emptyStore(), ...patch });
}

describe('Home', () => {
  it('first open shows one recommendation, duration, start, and streak', () => {
    render(<App />);
    expect(screen.getByTestId('recommendation').textContent).toBe('Jogging (HIIT)');
    expect(screen.getByTestId('duration').textContent).toBe('15 minutes');
    expect(screen.getByRole('button', { name: 'Start' })).toBeTruthy();
    expect(screen.getByTestId('week-progress').textContent).toBe('0 of 5');
  });
  it('reopening the same day shows the same recommendation', () => {
    const a = render(<App />);
    const first = screen.getByTestId('recommendation').textContent;
    a.unmount();
    render(<App />);
    expect(screen.getByTestId('recommendation').textContent).toBe(first);
  });
  it('done-today state offers no second session and shows streak/week', () => {
    seed({ sessions: [doneSession(dateKey(NOW))] });
    render(<App />);
    expect(screen.getByTestId('done-today')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Start' })).toBeNull();
    expect(screen.getByTestId('week-progress').textContent).toBe('1 of 5');
  });
  it('week progress reads 3 of 5 after Mon, Tue, Thu... shown Friday', () => {
    vi.setSystemTime(new Date(2026, 0, 9, 7, 0));
    seed({ sessions: [doneSession('2026-01-05'), doneSession('2026-01-06'), doneSession('2026-01-08')] });
    render(<App />);
    expect(screen.getByTestId('week-progress').textContent).toBe('3 of 5');
  });
  it('lets the user swap to Yoga, keeping the recommended duration', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Do something else'));
    fireEvent.click(screen.getByRole('button', { name: 'Yoga' }));
    expect(loadStore().activeSession).toMatchObject({ type: 'yoga', durationMin: 15 });
  });
});

describe('Strength session', () => {
  const start = (type: string) => {
    render(<App />);
    fireEvent.click(screen.getByText('Do something else'));
    fireEvent.click(screen.getByRole('button', { name: type }));
  };
  it('shows the prominent timer and both exercises of the pair', () => {
    start('Biceps and Shoulders');
    expect(screen.getByTestId('timer').textContent).toContain('15:00');
    expect(screen.getByTestId('ex-curl')).toBeTruthy();
    expect(screen.getByTestId('ex-seated-shoulder-press')).toBeTruthy();
  });
  it('counts down with the clock', () => {
    start('Biceps and Shoulders');
    act(() => { vi.advanceTimersByTime(5 * 60_000); });
    expect(screen.getByTestId('timer').textContent).toContain('10:00');
  });
  it('logs weight × reps, pre-fills from last values, and resumes after reload', () => {
    start('Biceps and Shoulders');
    const curl = within(screen.getByTestId('ex-curl'));
    fireEvent.input(curl.getByLabelText('Curl set 1 weight'), { target: { value: '20' } });
    fireEvent.input(curl.getByLabelText('Curl set 1 reps'), { target: { value: '12' } });
    expect(loadStore().activeSession!.sets.curl[0]).toEqual({ weight: '20', reps: '12' });
    expect(loadStore().lastSets.curl).toEqual({ weight: '20', reps: '12' });
    cleanup(); // "reload"
    render(<App />);
    expect(screen.getByTestId('timer')).toBeTruthy();
    expect((within(screen.getByTestId('ex-curl')).getByLabelText('Curl set 1 weight') as HTMLInputElement).value).toBe('20');
  });
  it('add-set adds a row; next shows the following pair; last pair offers Finish', () => {
    start('Biceps and Shoulders');
    fireEvent.click(within(screen.getByTestId('ex-curl')).getByText('+ Set'));
    expect(within(screen.getByTestId('ex-curl')).getAllByRole('listitem')).toHaveLength(4);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByTestId('ex-hammer-curl')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('button', { name: 'Finish' })).toBeTruthy();
  });
  it('Chest and Legs shows incline bench with lunges 4 × 50', () => {
    start('Chest and Legs');
    expect(screen.getByTestId('ex-incline-bench-press')).toBeTruthy();
    expect(screen.getByTestId('ex-lunges').textContent).toContain('4 × 50');
  });
  it('finish early, then celebration with the message, then summary', () => {
    start('Back and Legs');
    act(() => { vi.advanceTimersByTime(9 * 60_000); });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Finish' }));
    expect(loadStore().sessions[0].completed).toBe(true);
    expect(screen.getByTestId('celebration').textContent).toContain('I know how you are feeling…');
    expect(screen.getByTestId('celebration').textContent).toContain('SuperStar.');
    act(() => { vi.advanceTimersByTime(5000); });
    expect(screen.getByTestId('summary-duration').textContent).toBe('09:00');
    expect(screen.getByTestId('summary-times')).toBeTruthy();
    expect(screen.getByTestId('week-progress').textContent).toBe('1 of 5');
    fireEvent.click(screen.getByRole('button', { name: 'Home' }));
    expect(screen.getByTestId('done-today')).toBeTruthy();
  });
  it('discard does not count', () => {
    start('Back and Legs');
    fireEvent.click(screen.getByText('Discard'));
    fireEvent.click(screen.getByText('Yes, discard'));
    expect(loadStore().sessions).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Start' })).toBeTruthy();
  });
});

describe('Timed sessions have no set fields', () => {
  it.each(['Yoga', 'Jogging (HIIT)'])('%s', (name) => {
    render(<App />);
    fireEvent.click(screen.getByText('Do something else'));
    fireEvent.click(screen.getByRole('button', { name }));
    expect(screen.getByTestId('timed-step')).toBeTruthy();
    expect(screen.queryAllByRole('textbox')).toHaveLength(0);
    expect(document.querySelectorAll('input')).toHaveLength(0);
    expect(screen.queryByText('+ Set')).toBeNull();
  });
});

describe('Celebration reduced motion', () => {
  it('renders the message without motion elements', () => {
    window.matchMedia = ((q: string) => ({ matches: q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia;
    const s = doneSession('2026-01-07');
    render(<Celebration session={s} streak={{ streak: 1, weekCount: 1, target: 5 }} onHome={() => {}} />);
    const el = screen.getByTestId('celebration');
    expect(el.className).toContain('still');
    expect(el.querySelector('.burst')).toBeNull();
    expect(el.textContent).toContain('SuperStar.');
    // @ts-expect-error cleanup
    delete window.matchMedia;
  });
});

describe('discreet naming on screen', () => {
  it('no visible text on home, session, or summary says workout/fitness/gym', () => {
    const banned = /workout|fitness|gym/i;
    render(<App />);
    expect(document.body.textContent).not.toMatch(banned);
    expect(document.body.textContent).toContain('Enjoy Life');
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    expect(document.body.textContent).not.toMatch(banned);
    fireEvent.click(screen.getByRole('button', { name: 'Finish' }));
    expect(document.body.textContent).not.toMatch(banned);
    act(() => { vi.advanceTimersByTime(5000); });
    expect(document.body.textContent).not.toMatch(banned);
  });
});
