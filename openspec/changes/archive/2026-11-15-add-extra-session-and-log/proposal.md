# Proposal

## Why

Sometimes you train early, feel good, and want to bank tomorrow's session today, so that a later off day does not cost you the streak. Today the app counts one session per day, so that second session earns nothing. Also, when you forget to stop a session its times are wrong and cannot be fixed, and there is no way to look back at what you did on a given day.

## What Changes

- **Extra session:** after today's session is done, Home offers "Do an extra session". It runs like a normal session and is recorded as an extra. At most one extra per day (two sessions per day).
- **Extras count as one more day:** an extra adds one day to the week's count and one to the streak, and it offsets one missed day in the same Monday–Sunday week, so a week can reach 5 with fewer calendar days trained.
- **Edit times:** in a session log you can change the start and stop time of any past session; the duration and the date follow. A still-running session left over from an earlier time can be finished at a chosen stop time.
- **Calendar and log:** a new History screen shows a month calendar marking days you trained (extras marked differently). Tapping a day shows that day's log: type, start and stop time, duration and logged sets, with the edit-times control. Month navigation moves back and forward.

## Capabilities

### New Capabilities
- `workout-log`: the calendar of trained days, the per-day session log, and editing session times (including finishing a forgotten session).

### Modified Capabilities
- `streak-tracking`: a second session on a day counts as an extra; extras add to the week count and streak and offset missed days.

## Impact

- `src/domain/streak.ts`, `src/domain/session.ts`: extras in the streak and week count; allow a second session per day; edit-times and finish-at-time functions.
- `src/ui/Home.tsx`, `src/ui/App.tsx`: "Do an extra session" button and navigation to History.
- New `src/ui/History.tsx` (calendar and day log) and styles.
- `README.md` features list.
- No storage schema change: sessions already store start/stop/date and the streak is derived from them.

## Assumptions

- An extra is a plain credit for the week and streak. It does not pre-fill or skip tomorrow's session; tomorrow's recommendation still appears and training that day is optional.
- Extras only offset misses in the same Monday–Sunday week, and only misses on or after the day the extra was done. They do not carry over to the next week.
- The maximum is two sessions per day; further sessions are not offered.
- Edits change time only (not type, sets or deletion). Editing a start time can move a session to a different day; it is refused if that day already has two sessions or the stop time would not be after the start or would be in the future.
- Calendar is month-based, starting weeks on Monday to match the weekly target.
