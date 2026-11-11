# Enjoy Life

A discreet, installable, offline-first web app (PWA) that tells you each morning which short session to do today, so there is nothing to decide. It is deliberately titled "Enjoy Life" rather than presented as a fitness app. Single user, no accounts, no backend: all data stays on your device (`localStorage`).

Built with Preact, TypeScript and Vite; tested with Vitest.

## Features

- **One recommendation per day**: one of six session types for 15 minutes. It rotates through the type you did longest ago and avoids the same muscles two days running. The recommendation is stable all day, and you can swap to another type.
- **Duration progression**: moves to 20 minutes, permanently, after two consecutive Monday–Sunday weeks that each reach 5 workout days.
- **Session screen**: a very large countdown timer (continues as overtime), recorded start/stop times, and the timer stays correct through screen lock and reloads.
- **Supersets**: two exercises on screen at a time, each with start/end photos and compact `weight × reps` fields. Fields pre-fill from your last values, and sets can be added.
- **Session types**: Jogging (HIIT), Back and Legs, Chest and Legs, Biceps and Shoulders, Triceps and Abs, Yoga. Jogging and Yoga run as timed sequences without set fields.
- **Landing screen**: a large two-style "Enjoy" / "Life" masthead and a hero streak (flame, big number, five week dots) above the Start button.
- **Streak**: weekly target of 5 (Mon–Sun) with up to 2 rest days per week; the third missed day resets the streak. Derived from history, never stored.
- **Celebration**: an animated "I know how you are feeling… SuperStar." screen after finishing, with a reduced-motion fallback, then a summary.
- **Offline and installable**: works in airplane mode after the first load; installs to the iPhone Home Screen as "Enjoy Life".

## Run

```bash
npm install
npm run dev        # dev server (http://localhost:5173)
npm test           # unit + component tests (Vitest)
npm run build      # type-check and production build into dist/
npm run preview    # serve the production build (http://localhost:4173)
```

To try it on a phone on the same Wi-Fi: `npm run build && npx vite preview --host`. Installing and offline mode need HTTPS (see below).

`npm run gen:media` regenerates the app icons.

## Deploy

The build in `dist/` is a plain static site (relative base path), so any static HTTPS host works. Service workers require HTTPS.

- **GitHub Pages**: publish `dist/` (for example with an Actions workflow that runs `npm ci && npm run build`).
- **Cloudflare Pages**: build command `npm run build`, output directory `dist`.

## Install on iPhone

1. Open the deployed URL in **Safari** on the iPhone.
2. Tap Share, then **Add to Home Screen**. The label is "Enjoy Life".
3. Launch it from the Home Screen icon; it opens full-screen.
4. Open it once online so everything is cached; after that it works offline.

If you updated the app and still see the old version, close and reopen it twice (the service worker updates on the next load), or remove and re-add the Home Screen icon.

## Project layout

- `src/domain/`: pure logic: `library` (types, exercises, supersets), `plan` (recommendation, progression), `streak`, `session`, `dates`
- `src/storage.ts`: versioned localStorage store with safe reads
- `src/ui/`: screens (home, session, celebration)
- `public/media/`: exercise photos, `<exercise-id>-0.jpg` and `-1.jpg` (start/end position)
- `tests/`: unit and component tests
- `openspec/`: the specs, design and tasks this app was built from

## Credits

Exercise photos come from [free-exercise-db](https://github.com/yuhonas/free-exercise-db), released into the public domain (Unlicense).

## Status

Implemented and tested. Still to do: on-device checks on an iPhone (lock-screen timer behaviour, Home Screen install, offline after force-quit) after deploying to an HTTPS host.
