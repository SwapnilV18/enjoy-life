# Design

## Context

Sessions are stored in `Store.sessions` with `date`, `startedAt`, `stoppedAt`, `completed`; the streak is derived from the list by `computeStreak` in `src/domain/streak.ts` (dates only, one per day, rest allowance of two misses per Monday–Sunday week). `startSession` refuses when `doneToday`. Home shows a single day; there is no history view. See proposal.md.

## Goals / Non-Goals

**Goals:**
- Extras and time edits flow through the existing derived streak, with no stored counters and no storage migration.
- Pure, unit-tested domain functions; thin UI.

**Non-Goals:**
- Deleting or creating sessions in the log, editing type or sets, or syncing across devices.
- A year view, search, or charts.

## Decisions

- **Streak input becomes the session list's dates with duplicates kept.** `computeStreak` receives all completed session dates (not de-duplicated). Per date: `regular = 1`, `extra = min(count, 2) - 1`. Week count = days with a session + extras in the week. Run increments by `1 + extra` per date.
- **Credits in the rest-day rule:** within a week walk, `credit` accumulates for each extra on or before the current day; a missed day counts only when `missedInWeek - credit` reaches 3, which resets the run. This keeps today's behaviour exactly when there are no extras and satisfies the spec scenarios (an extra after a reset does not restore it). Alternative: treating the extra as a virtual next-day workout, rejected as harder to explain and to display.
- **Second session per day:** `startSession` allows a start when the day has fewer than 2 completed sessions; `doneToday` stays "first session done" for Home, and a new `sessionsOn(date)` helper feeds the extra offer and the log. The recommendation for an extra reuses the planner on history that now includes today's session, giving the next type in rotation; the user can still choose another type.
- **Edit as pure store functions:** `editSessionTimes(store, id, startedAt, stoppedAt, now)` validates (stop > start, stop <= now, target date has < 2 other sessions), recomputes `date = dateKey(startedAt)`, returns the new store or an error code; `finishAt(store, stoppedAt, now)` finishes the active session at a chosen time with the same validation. The UI uses `<input type="time">` plus a date for the start, which iOS supports natively.
- **History view:** a new `History` component, opened from a "History" link on Home, with local state for the shown month and selected date. Calendar grid is a simple 7-column CSS grid built from `weekStart`/`addDays`. No router: App holds a `view` state, consistent with the current App.
- **Forgotten active session:** when the active session started on an earlier date than today (or has run longer than a threshold such as 4 hours), Home offers "Finish it at…" instead of silently resuming. A stale session is never auto-finished.

## Risks / Trade-offs

- [Allowing edits lets the streak be inflated] → acceptable: single-user, personal tracking.
- [An edit moving a session across midnight changes the streak retroactively] → intended; the streak is recomputed from history.
- [Offset rule is subtle] → covered by explicit scenarios and unit tests for each case.
- [Two sessions on one day complicates the "done today" screen] → Home shows done state plus the extra control until two are done.
