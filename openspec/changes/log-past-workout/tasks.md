# Tasks

## 1. Domain

- [x] 1.1 Add `addPastSession` and the `range` error with its message in `src/domain/session.ts`; verify unit tests for success (type, date, start/stop, duration target), future time, duration 0 and 500, full day, second session on a day is an extra, and the streak/week count updating
  
## 2. UI

- [x] 2.1 Add the "Log a workout" action and form (six type chips, start time, minutes) to the day log in `src/ui/History.tsx`, hidden for future dates and full days, with styles in `src/ui/styles.css`; verify component tests for backfilling a missed day (calendar marks it, log shows the times), offered types equal the app's types, refusal messages, and the action being absent for a future date and a full day
- [x] 2.2 Verify a 375x667 screenshot of the form, run `npm test` and `npm run build`, and add the feature to the README features list
