# Proposal

## Why

When you train but forget to open the app (or the session happened away from the phone), that day shows as a gap in the calendar and the streak takes the hit. The History calendar can show and edit logged sessions, but it cannot add one that was never recorded.

## What Changes

- In History, selecting a past date (or today, for an earlier time) offers "Log a workout" on that day.
- The form offers the same six session types the app already has (Jogging (HIIT), Back and Legs, Chest and Legs, Biceps and Shoulders, Triceps and Abs, Yoga), a start time and a duration in minutes, with sensible defaults.
- Saving records a completed session on that date. It then counts like any other session: it marks the calendar day, adds to the week count and streak, and a second one on the same day is an extra.
- Refused with a clear message when the time would be in the future, the duration is out of range, or the day already has two sessions.

## Capabilities

### New Capabilities

### Modified Capabilities
- `workout-log`: adds logging a workout for a past date from the calendar.

## Impact

- `src/domain/session.ts`: a pure `addPastSession` function with validation.
- `src/ui/History.tsx` (+ styles): the "Log a workout" form in the day log.
- Streak, week count and the 20-minute progression are derived from history, so backfilled sessions change them automatically; no storage schema change.
- `README.md` features list.

## Assumptions

- A backfilled session records type, date, start time and duration only. Weights and reps cannot be entered for it (they can be added in a later change).
- Default start time is 07:00 and default duration is the target for that date (15 minutes, or 20 once 20-minute sessions apply). The duration is editable, from 1 to 180 minutes.
- Future dates and times are not allowed. Today is allowed for a time that has already passed.
- At most two sessions per day applies, as for live sessions; the second is shown as the day's extra.
- The new session counts for the streak and the 20-minute progression exactly like a live one. If that rewrites an old streak gap, that is intended.
