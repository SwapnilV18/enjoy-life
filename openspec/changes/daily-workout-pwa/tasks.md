# Tasks

## 1. Project setup

- [x] 1.1 Scaffold a Vite + Preact + TypeScript project in the repo root with vite-plugin-pwa and Vitest; verify `npm run build` and `npm test` run successfully
- [x] 1.2 Add README with run/build/deploy and iPhone install steps; verify the documented commands work as written

## 2. Workout library (workout-library)

- [x] 2.1 Define the six workout types, exercises, muscle tags, fixed prescriptions (incline bench first, lunges 4 × 50), and yoga/jogging as timed sequences; verify with unit tests asserting each type's exercise list
- [x] 2.2 Implement superset pairing (different muscles first, odd one alone); verify unit tests for Back and Legs, Biceps and Shoulders, Triceps and Abs, and an odd-count case
- [x] 2.3 Source or author looping animated clips (or animated SVG placeholders) for every exercise, size-optimised and mapped by exercise id; verify a test that every exercise id resolves to an existing media file

## 3. Storage and domain logic

- [x] 3.1 Implement the versioned localStorage store (sessions, active session, last-used set values, daily-plan cache) with safe reads and a storage-persist request; verify with unit tests including corrupt/missing data
- [x] 3.2 Implement daily-plan logic (rotation, muscle-conflict avoidance, 15→20 progression after two consecutive 5-workout weeks, stays at 20, per-day stable cache); verify unit tests for each daily-plan spec scenario (including non-consecutive weeks and permanence) using fixed dates
- [x] 3.3 Implement streak and week-progress logic (Mon–Sun, 5 target, third missed day resets, today not missed, one workout per day counts once); verify unit tests for each streak-tracking scenario, including week rollover and timezone-local dates

## 4. Session experience (workout-session)

- [ ] 4.1 Build the timestamp-based countdown/overtime timer with visibilitychange handling, wake lock, and resume of an active session after reload; verify unit tests with a fake clock and a manual lock-screen check on iPhone
- [x] 4.2 Build the superset screen showing two exercises with animation and per-set weight × reps fields, add-set, pre-fill from last values, next-pair navigation; verify component tests and manual use at iPhone width
- [x] 4.3 Build jogging (HIIT interval) and yoga timed-sequence screens without set fields; verify component tests that no weight/reps fields render
- [x] 4.4 Implement finish (records stop time and counts as completed, early finish allowed) and discard (not counted); verify unit tests for both paths

## 5. Home and celebration

- [x] 5.1 Build the home screen showing the recommendation, start button, swap-type chooser, streak and week progress, and the done-today state with no second session offered; verify component tests for first open, reopen, and done-today
- [x] 5.2 Build the animated "I know how you are feeling… SuperStar." screen with reduced-motion fallback and the summary (duration, start/stop, streak, week); verify component tests and manual check of the animation
- [x] 5.3 Apply the discreet "Enjoy Life" visual design with a prominent timer, large touch targets, and safe-area padding; verify visually on a 390px-wide viewport

## 6. PWA shell (app-shell)

- [x] 6.1 Add manifest, icons, `apple-mobile-web-app-*` meta tags, standalone display, and the "Enjoy Life" name; verify with a Lighthouse PWA/installability check and a grep that no visible name contains workout, fitness, or gym
- [x] 6.2 Configure the service worker to precache the app and all exercise media; verify the app and a full session work offline in a production build with the network disabled

## 7. Integration

- [ ] 7.1 Deploy to a static HTTPS host and install on the iPhone via Add to Home Screen; verify launch full-screen, offline run of a full session, and persistence after force-quit
- [x] 7.2 Walk through every spec scenario end to end and run `openspec validate daily-workout-pwa`; verify validation passes and note any gaps

## Workflow follow-up

- Archive the change after the app is verified on the iPhone.
