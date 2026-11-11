# Design

## Context

Greenfield, single-user app for one iPhone. No existing code. See proposal.md for motivation and the specs for behavior. Constraints: no native iOS app, no backend, works offline, must feel instant on a phone, and iOS Safari/standalone PWA quirks apply (no background timers, screen lock suspends JS, limited install prompts).

## Goals / Non-Goals

**Goals:**
- Installable PWA that runs well in iOS standalone mode (Safari "Add to Home Screen"; also works from Chrome on iOS).
- Pure client-side; the domain logic (recommendation, progression, streak) is pure functions that are unit-testable without a browser.
- Timer that is correct regardless of screen lock.

**Non-Goals:**
- Accounts, cloud sync, multi-device sharing, social features.
- Push notifications for a morning reminder (iOS support is limited; can be a follow-up).
- Native iOS app, Apple Health integration, workout editing UI.

## Decisions

1. **Preact + TypeScript + Vite, with vite-plugin-pwa (Workbox).** Small bundle, fast load on mobile, mature PWA tooling. Alternatives: vanilla JS (more hand-rolled UI state), React (heavier), SvelteKit (more machinery than needed for a static app).

2. **Domain logic as pure modules separate from UI** (`plan`, `streak`, `library`, `session`). They take dates and session history as inputs and return values. This makes the trickiest rules (rotation, 10-workout progression, Mon–Sun streak with rest allowance) testable with Vitest by passing fixed dates.

3. **Timer by timestamps, not ticks.** Store `startedAt` (epoch ms) when starting; compute remaining time as `target − (now − startedAt)` on every render, re-rendered by `requestAnimationFrame`/1s interval and on `visibilitychange`. The active session is persisted on start, so reload resumes. Alternative `setInterval` counters drift and stop when the screen locks. A Screen Wake Lock is requested during a session where supported (iOS 16.4+), and failure is ignored.

4. **Persistence in `localStorage` with a versioned JSON schema** (`sessions[]`, `activeSession`, last-used set values). Data volume is tiny (≈5 sessions/week). IndexedDB would add async complexity without need. `navigator.storage.persist()` is requested on first run. Trade-off: no sync/backup; a manual JSON export is a possible follow-up.

5. **Streak and week progress are derived, never stored.** Computed from the session list and today's date each render, so editing or deleting history cannot leave a stale counter. Algorithm: walk days from the first workout day forward; maintain per-Mon–Sun-week missed-day count for *elapsed* days; the third missed day in a week resets the run; the streak is the count of workout days since the last reset. Today is excluded from "missed" until midnight. Dates use the device's local timezone via local-date keys (`YYYY-MM-DD`).

6. **Recommendation is deterministic per day.** Computed from history and cached by date in storage so reopening the app returns the same answer (spec: stable within a day). Rotation: rank types by days since last completed (never-done first), drop types sharing a primary muscle group with yesterday's session if an alternative exists, break ties by a fixed library order. Muscle tags: Back and Legs {back, legs}, Chest and Legs {chest, legs}, Biceps and Shoulders {biceps, shoulders}, Triceps and Abs {triceps, abs}; Jogging and Yoga are untagged.

7. **Progression:** derived from history by a pure function: group workout days into Monday–Sunday weeks; find the first pair of consecutive weeks that each have 5 workout days; `duration = 20` from the day after the 5th workout day of the second week, else 15. Once earned it never reverts (the earned date is derived, so no stored flag). The duration is a property of the day's recommendation and is recorded on each session. One workout per day is enforced: after a session is finished the start control is replaced by the done state.

8. **Superset pairing:** the library stores each exercise with a `muscle` tag in a preferred order; pairing takes the first remaining exercise and pairs it with the next remaining exercise of a different muscle, falling back to the next one if none differs (e.g. Biceps and Shoulders pairs curl + seated press, hammer + side raise, front raise alone). Incline bench stays first in Chest and Legs (paired with lunges).

9. **Exercise media as short looping, muted, `playsinline` video/animated WebP of a muscular figure**, referenced from the library by id and precached by the service worker for offline use. A placeholder animated SVG figure ships if licensed media is not yet sourced, so the app is never blocked on assets. Alternative Lottie adds a runtime and still needs authored animations.

10. **Hosting:** any static HTTPS host (service workers require HTTPS); GitHub Pages or Cloudflare Pages recommended. The app is installed from Safari on the iPhone; manifest name and `apple-mobile-web-app-title` are "Enjoy Life".

11. **Celebration:** CSS/SVG animation (staggered text reveal plus a star burst), disabled under `prefers-reduced-motion`. No library.

## Risks / Trade-offs

- [Animated exercise assets are the largest unknown (licensing, ~25 clips, size)] → Library references media by id with a placeholder fallback; keep clips small (<300 KB) and precache.
- [iOS may evict storage for a PWA that is rarely opened] → Installed Home Screen apps are exempt from the 7-day Safari eviction; also request persistent storage and consider JSON export later.
- [iOS has no background timers; the screen may lock mid-workout] → Timestamp-based timer plus wake lock.
- [Streak rule interpretation is ambiguous] → Written down precisely in the streak-tracking spec; logic isolated in one pure module with tests so it is cheap to adjust.
- [Service worker caching can strand users on an old version] → Auto-update with prompt-free reload on next open.

## Open Questions

- Which source/licence will provide the animated exercise clips (purchase, free library, or generated)?
- Weight unit is assumed kg; switchable later without affecting specs.
- The "cross" yoga pose and the further yoga poses are to be chosen from a standard list during library authoring (cross-body and other basic poses).
