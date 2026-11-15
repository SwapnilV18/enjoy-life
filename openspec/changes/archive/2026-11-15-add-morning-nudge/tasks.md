# Tasks

## 1. Message pool and shuffle bag

- [x] 1.1 Add `src/domain/nudge.ts` with the message pool (about 20 messages, each 120 characters or fewer, no "workout", "fitness" or "gym") and verify with a test asserting length and forbidden words
- [x] 1.2 Implement pure `nextMessage(state, poolSize, rng)` (Fisher–Yates bag, no repeat at cycle boundary) and verify tests: full cycle shows each index once, boundary differs from last, invalid/mismatched state resets safely
- [x] 1.3 Add optional `nudge` field to `Store` in `src/storage.ts` with defensive parsing and verify storage tests (missing, malformed, wrong pool size all fall back without throwing; v1 data still loads)

## 2. Show the message

- [x] 2.1 In `src/ui/App.tsx` pick a message once on mount and on `visibilitychange` to visible when today is not done, persist the bag, and verify a component test: two opens give different messages and re-render keeps the same one
- [x] 2.2 Render the message in `src/ui/Home.tsx` above Start, hidden when done today, with matching styles in `src/ui/styles.css`; verify component tests for shown and done states, and that `npm test` and `npm run build` pass
- [ ] 2.3 Verify offline behavior by running `npm run build && npm run preview` and opening with the network disabled (message still appears)
- [x] 2.4 Add the reminder message to the README features list and verify the text matches the app
