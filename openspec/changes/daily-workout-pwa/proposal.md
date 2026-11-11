# Proposal

## Why

The user wants a morning ritual that tells them, without thinking, what short workout to do today to feel better. It must run on an iPhone but without a native iOS app, so it is built as an installable web app (PWA) opened from the Home Screen. The product is deliberately discreet: it is titled "Enjoy Life" rather than presented as a fitness app, so the title lands emotionally rather than clinically.

## What Changes

- New single-user, offline-capable web app (PWA) titled **Enjoy Life** (no "workout"/"fitness" branding on screen).
- Each morning the app recommends one 15-minute session from six workout types; duration moves to 20 minutes once two consecutive Monday–Sunday weeks each reach 5 workouts (10 on-track workouts). One workout per day.
- A session screen with a very prominent timer, recorded start/stop times, and two exercises shown at a time as a superset (muscle groups alternated so each rests), each with an animated illustration of a muscular figure and compact `weight × reps` set fields.
- A completion screen with an animated "I know how you are feeling… SuperStar." celebration.
- A streak counter built around a Monday–Sunday week with a target of 5 workouts and 2 allowed rest days.
- All data stored locally on the device; no accounts, no backend.

## Capabilities

### New Capabilities
- `daily-plan`: Morning recommendation of today's workout type and duration, including the 15→20 minute progression (two on-track weeks) and rotation across workout types.
- `workout-library`: The catalogue of six workout types, their exercises, and exercise animations, plus superset pairing rules.
- `workout-session`: Running a session — timer, start/stop recording, superset display, set logging (weight × reps), finishing.
- `streak-tracking`: Weekly 5-workout target, rest-day allowance, and streak count.
- `completion-celebration`: The animated finish message after a session.
- `app-shell`: Installable PWA behaviour, offline use, local persistence, and discreet "Enjoy Life" branding.

### Modified Capabilities
<!-- None: greenfield project, no existing specs. -->

## Impact

- New codebase in `/Users/swapnil/develop/workout` (no existing code).
- Dependencies: a static front-end toolchain, a service worker, and browser storage (IndexedDB/localStorage). No server.
- Assets: ~25 animated exercise illustrations must be sourced or created (licensing to be confirmed).
- Assumptions recorded here (can be revised via update): "chrome app" means an installable PWA used on iPhone via Home Screen; data is single-user and local-only; "10 workouts regularly" means two consecutive Monday–Sunday weeks with 5 workout days each (one workout per day), after which 20 minutes stays permanently; the exact streak rule is defined in the `streak-tracking` spec.
