# Tasks

## 1. Extras in the streak and week count

- [x] 1.1 Update `computeStreak`/`weekProgress` in `src/domain/streak.ts` to take all session dates, add extras to the week count and the run, and apply the extra credits to the rest-day rule; verify unit tests for: unchanged behaviour with no extras, extra raises week and streak, extra offsets a miss, extra after a reset does not restore it, extras do not carry into the next week
- [x] 1.2 Allow a second session per day in `src/domain/session.ts` (`sessionsOn`, start refused at two); update `streakFor` and `history`; verify tests: second start allowed, third refused, `doneToday` still returns the first session
- [x] 1.3 Home: after the first session, show "Do an extra session" (recommended type, choose another allowed), and hide it at two; verify component tests for offered, started, and hidden at two sessions

## 2. Edit times

- [x] 2.1 Add `editSessionTimes` and `finishAt` pure functions with validation (stop after start, not in the future, target day has fewer than two other sessions) and verify unit tests for success, each refusal, and the date moving with the start time
- [x] 2.2 In Home, offer "Finish it at…" for a still-running session that started on an earlier date or has run past the stale threshold, and verify a component test that finishing at a chosen time records a completed session with that stop time

## 3. Calendar and day log

- [x] 3.1 Add `src/ui/History.tsx` with the month calendar (Monday start, marked days, extra marker, previous/next month) and a "History" link from Home; verify component tests for marked days, month navigation and an empty month
- [x] 3.2 Add the day log to History (sessions with type, start/stop, duration, sets, or an empty message) and the edit-times form wired to `editSessionTimes`, showing refusal messages; verify component tests for opening a trained and an empty day, saving a valid edit, and a refused edit
- [x] 3.3 Style the calendar and log in `src/ui/styles.css`; verify with a 375x667 screenshot and `npm test` and `npm run build` passing
- [x] 3.4 Update the README features list (extras, History, editing times) and verify it matches the app
