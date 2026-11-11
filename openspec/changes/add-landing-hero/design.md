# Design

## Context

Home (`src/ui/Home.tsx`) renders a small `h1` ("Enjoy Life", 20px dim uppercase), the recommendation, Start, then `StreakBar` (a panel with two numbers). `StreakBar` is shared with the completion screen. Styling is one plain CSS file with a dark palette and a gold accent; the app must stay offline and use no network fonts. See proposal.md.

## Goals / Non-Goals

**Goals:**
- Masthead and streak dominate the first screen; Start stays visible without scrolling on a 375x667 viewport.
- No new dependencies; no remote fonts.

**Non-Goals:**
- Changing streak rules, the recommendation logic, or other screens' layout beyond reusing the streak display.

## Decisions

- **Masthead as one `h1` with two spans**: `<h1 aria-label="Enjoy Life"><span class="w1">Enjoy</span><span class="w2">Life</span></h1>`, replacing the small label. "Enjoy": system heavy sans (weight 900, tight tracking, large `clamp()` size). "Life": system serif italic (`ui-serif`, Georgia fallback) at the same optical size with a gold gradient via `background-clip: text`. Alternative: a bundled web font for more character, rejected to keep the build offline and small.
- **Entrance animation**: words slide/fade in 150ms apart, a gentle repeating shimmer on "Life" is optional; wrapped in `prefers-reduced-motion: no-preference` so reduced-motion users get a static layout.
- **Hero streak**: a new `StreakHero` component used on Home only, placed under the masthead: flame glyph (inline SVG, no emoji dependence), a very large number, caption ("day streak", or "Start today to begin" at 0), and five week dots with `data-testid="week-progress"` text kept for screen readers and tests ("3 of 5"). The existing `StreakBar` stays for the celebration screen to avoid regressions.
- **Vertical budget**: masthead ~96px, hero ~150px, recommendation and Start below; verify on a small viewport by screenshot, scaling type with `clamp()` and `dvh` so Start never falls below the fold.
- **Test ids preserved**: `streak`, `week-progress`, `recommendation`, `duration`; existing UI tests should pass unchanged.
- **Publish**: the repo already has `.github/workflows/pages.yml` (builds with a relative base). Deployment is a final, explicit step done only on request after review.

## Risks / Trade-offs

- [System serif italic varies by device] → acceptable; both iOS fonts look good and a fallback stack is set.
- [Larger header pushes Start down on small phones] → clamp sizes and verify in a 375x667 screenshot.
- [Gradient text has poor contrast in forced-colors mode] → solid gold fallback color before the gradient.
- [Publishing exposes the app publicly on a Pages URL] → confirm the repo and visibility before deploying; all data stays on-device so none is uploaded.
