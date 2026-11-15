# Design

## Context

`History.tsx` shows a month grid and a day log for the selected date; `session.ts` holds pure store functions (`editSessionTimes`, `finishAt`, `sessionsOn`, `MAX_SESSIONS_PER_DAY`, `EDIT_MESSAGES`). A `Session` already holds everything a backfill needs (`id, date, type, durationMin, startedAt, stoppedAt, completed, sets`). The streak, week count and 20-minute progression are derived from `sessions`, so no derived state needs updating. See proposal.md.

## Goals / Non-Goals

**Goals:**
- One pure, tested function for validation and creation; a small form in the existing day log.
- No storage migration.

**Non-Goals:**
- Entering weights and reps for a backfilled session, deleting sessions, bulk import.

## Decisions

- **`addPastSession(store, { type, date, startMinutes, minutes }, now)`** returns the same `{ok, store} | {ok:false, error}` shape as the edit functions, with new error codes `range` (duration outside 1–180) and `future`, reusing `full`. It builds `startedAt` from the date plus the local start time, `stoppedAt = startedAt + minutes`, `date = dateKey(startedAt)`, `durationMin` = the target that applies to that date (`durationFor` over earlier history), `sets = {}`, `id = "s-" + startedAt` (made unique if it already exists). Alternative: reuse `startSession` + `finishSession` with fake times, rejected because it hides the checks and mutates the active session.
- **Form in the day log**: a "Log a workout" button when the selected date is not after today and has fewer than two sessions. The form has the six types as chips (from `WORKOUT_TYPES`), a `type="time"` start input defaulting to 07:00, and a numeric minutes input defaulting to that date's duration target. Saving closes the form and the calendar updates from the store.
- **Messages**: extend `EDIT_MESSAGES` with `range`; refused saves show the message inline like time edits.
- **Selected date today**: allowed, with the future-time check handling "later today".

## Risks / Trade-offs

- [Backfill can be used to inflate the streak] → single-user personal tracker; accepted.
- [Backfilled sessions may change the 20-minute progression date] → intended, it is derived from history.
- [Today's cached recommendation may not reflect a backfilled session] → the cache is per day and only the rotation uses history; acceptable, refreshed the next day.
