# Design

## Context

Single-user Preact PWA, state in one versioned `localStorage` store (`src/storage.ts`, parsed defensively, schema v1). Home (`src/ui/Home.tsx`) is shown whenever there is no active session. The user triggers the moment themselves with their own phone alarm and opens the app by hand, so the app has no scheduling responsibility. See proposal.md.

## Goals / Non-Goals

**Goals:**
- Fresh message per open, shuffled without repeats, deterministic and unit-testable.
- Zero backend, zero new dependencies.

**Non-Goals:**
- Triggers, alarms, sounds, notifications, web push or Shortcuts.
- Measuring whether the session actually started soon after opening.
- User-editable messages or a settings UI.

## Decisions

- **Shuffle bag persisted in the store**: `nudge: { order: number[]; pos: number; last: number } | null`. Pure function `nextMessage(state, poolSize, rng)` returns the index plus new state; on exhaustion it reshuffles (Fisher–Yates) and swaps the first element if it equals `last`. Persisting makes cycles survive restarts; a pure function with injected `rng` makes tests deterministic. Alternative: plain random with no-repeat-last, rejected since it does not guarantee a full cycle.
- **Advance once per open**: App picks the message in a mount effect and on `visibilitychange` to visible, only when the day is not done, and passes the string to Home as a prop. Re-renders reuse the held value (state), satisfying "stable while visible". Cold start and resuming from background both count as an open.
- **Pool and state tolerance**: messages live in `src/domain/nudge.ts` as a const array (about 20). Parsing validates `order` against the current pool size; any mismatch (pool edited) resets the bag, keeping `parseStore` non-throwing. Schema version stays 1 because the field is optional.
- **UI**: message shown as a prominent line above the Start button, hidden when done today.

## Risks / Trade-offs

- [Switching back to the app repeatedly burns through messages] → acceptable; ordering still guarantees no early repeats.
- [Pool edited mid-cycle] → bag reset, at worst one repeated message.
