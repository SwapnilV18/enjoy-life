# Proposal

## Why

The landing screen opens with a small, quiet "ENJOY LIFE" label and shows the streak in a panel below the Start button. For a daily-habit app the streak is the strongest motivator, and the brand is the first thing seen. Both deserve to be the hero of the screen.

## What Changes

- Replace the small uppercase heading on Home with a large two-word masthead: "Enjoy" and "Life" at equal, very large size but in contrasting styles (for example a heavy geometric sans for "Enjoy" and a flowing italic serif with a gold gradient for "Life"), with a subtle entrance animation that respects reduced motion.
- Move the streak to the top of Home as a hero element: a large streak number with a flame/spark mark and a short caption, with the weekly progress shown as five dots (filled for completed days) instead of only "3 of 5" text.
- Keep one recommendation, duration and Start control directly below, still reachable without scrolling on a small iPhone.
- Apply to both the not-done and done-today states.
- Publish the finished app to GitHub Pages (the repo already has a Pages workflow) once the change is implemented and reviewed.

## Capabilities

### New Capabilities

### Modified Capabilities
- `streak-tracking`: the streak count display requirement now requires the streak to be the most prominent element on the home screen, with a visual weekly progress indicator.
- `app-shell`: the discreet title requirement now covers a large two-style "Enjoy" / "Life" masthead on the landing screen.

## Impact

- `src/ui/Home.tsx`, `src/ui/styles.css` (masthead, hero streak, week dots); `StreakBar` is also used by the completion screen and keeps working.
- Possibly a web font; the design avoids one (system fonts only) to stay offline and light.
- Existing UI tests keep their test ids (`streak`, `week-progress`, `recommendation`, `duration`).
- Deployment: `.github/workflows/pages.yml` and a GitHub remote.

## Assumptions

- "Creative" is mine to interpret; I propose the sans + italic-serif-gold pairing and the dots/flame, which you can veto at review.
- The heading must still read "Enjoy Life" for accessibility and the branding tests.
- This is separate from `add-morning-nudge`, which is unaffected.
- Publishing happens only after you ask in the apply phase; nothing is published while planning.
