# Tasks

## 1. Masthead

- [x] 1.1 Replace the Home `h1` with the two-span "Enjoy"/"Life" masthead (accessible name "Enjoy Life") and styles in `src/ui/styles.css` incl. reduced-motion handling; verify with a component test for the heading name and `tests/branding.test.ts` still passing
- [x] 1.2 Add the entrance animation under `prefers-reduced-motion: no-preference`; verify visually in `npm run dev` and that reduced motion shows a static layout

## 2. Hero streak

- [x] 2.1 Add `StreakHero` (flame SVG, large number, caption, five week dots) and render it above Start on both the not-done and done-today Home states; verify tests cover 0 streak caption, 3 of 5 filled dots, and preserved `streak` / `week-progress` test ids
- [x] 2.2 Keep `StreakBar` on the celebration screen unchanged; verify existing celebration tests pass
- [x] 2.3 Verify the layout in a 375x667 viewport screenshot (Start visible without scrolling) and run `npm test` and `npm run build`
- [x] 2.4 Update the README features list for the new landing screen and verify the text matches the app

## 3. Publish

- [ ] 3.1 After review, with the user's confirmation, publish to GitHub Pages: ensure a GitHub remote exists, push, enable Pages from Actions, and verify the workflow run succeeds and the live URL loads and installs on the iPhone

## Workflow follow-up

- Archive the change after publishing is verified.
