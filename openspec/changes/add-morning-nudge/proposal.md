# Proposal

## Why

You already have a simple alarm that reminds you to start. What the app can add is a warm, fresh nudge the moment you open it, so the screen you land on keeps feeling new instead of the same static view every morning. The aim is that opening the app turns into starting the session soon after, ideally within a few minutes.

## What Changes

- Add a pool of short, varied reminder messages (discreet wording, consistent with the "Enjoy Life" branding).
- On opening the app (cold start or return to foreground) on a day with no completed session, Home shows one message from the pool above the Start control.
- Messages are drawn by shuffle-without-repeat ("bag") so every pass through the pool uses each message once, and the same message is never shown twice in a row, even across a pool reset.
- A message is only advanced on a new open, not on re-renders, so it does not flicker while the screen is visible.
- Once today's session is done, no reminder message is shown.

## Capabilities

### New Capabilities
- `morning-nudge`: varied, shuffled reminder message shown when the app is opened on a day not yet completed.

### Modified Capabilities

## Impact

- New `src/domain/nudge.ts` (message pool, shuffle bag) and tests.
- `src/storage.ts`: persist the bag state (new optional field; schema stays backward compatible).
- `src/ui/Home.tsx`, `src/ui/App.tsx`: show the message.
- `README.md`: features list.
- No new dependencies, no backend, no notifications, no Shortcuts.

## Assumptions

- You set your own alarm and open the app by hand; the app does not schedule, trigger or play anything.
- "Start within a few minutes" is the intended outcome, not something the app enforces or measures.
- Message wording is mine to draft; you can edit the list afterwards.
