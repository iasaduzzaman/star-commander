# Artemis Base Commander

A turn-based browser game for the **2026 NASA Space Apps Challenge: Build a Junior Astronaut Mission Trainer**.
Players run a four-person outpost on the rim of Shackleton crater for 30 sols, balancing **power, life support,
food production and radiation shielding**. No random event cards: hazards are predictable and shown on a timeline,
and problems come from the player's own plan and the state of the crew.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build in dist/  (deploy this to Vercel or Netlify)
npm run build:single # one self-contained HTML file in dist-single/ (for offline classrooms, USB sticks)
npm run sim          # headless balance check: plays 5 strategies and prints results
```

Deploy on Vercel: push to GitHub, import the repo, framework preset "Vite". No backend needed.

## NASA open data used

| Dataset | What the game does with it | File |
|---|---|---|
| **NASA DONKI** space weather database (CCMC, NASA Goddard) | Every mission's solar storm is a real flare with linked solar energetic particle events. Flare class (C/M/X) sets storm strength; a linked >100 MeV proton event lowers shielding effectiveness. When hosted, the game also calls the live API (`api.nasa.gov/DONKI/FLR` and `/SEP`) for recent events. | `src/data/nasa/donki_events.json`, `src/data/nasa/donkiLive.js` |
| **NASA LRO CRaTER** daily dose rates | Real radiation measured near the Moon during four 2012 storms. Sets how the storm's dose spreads across sols, and is charted in the setup and debrief screens. | `src/data/nasa/crater_storms_2012.json` |

Sources: https://ccmc.gsfc.nasa.gov/tools/DONKI and https://crater-products.sr.unh.edu/data/inst/dose/table_l30drate.php (archived at NASA PDS PPI, volume LROCRA_2XXX).

Optional: get a free key at https://api.nasa.gov and set `VITE_NASA_API_KEY` in Vercel's environment variables. Without it the game uses `DEMO_KEY`, and falls back to the saved records if the API is unreachable.

## How the game works

| Phase | What happens |
|---|---|
| Setup | Pick 2 of 5 science objectives, load cargo within a mass budget, meet the crew |
| Morning | Timeline shows upcoming hazards. A crew storylet may ask for a decision |
| Plan | Assign each astronaut a task. Set life support (Full / Eco / Off) and grow lights |
| End Sol | Simulation runs. Report shows what changed and why |
| Sol 30 | Flight Director Debrief explains the mission's key moments with real NASA data |

**Fixed environment (Shackleton rim):** shadow passage Sols 11 to 14 (no solar), dust from Sol 6, flare forecast Sol 18,
particle storm from Sol 20 (length and strength from real NASA data), second shadow Sols 25 to 26.

**Difficulty modes:** Cadet (status words, tips every sol, 3000 kg cargo), Astronaut (real numbers, 2500 kg),
Flight Specialist (tap gauges for equations, no tips, 2200 kg).

## Project structure

```
src/
  data/          all game content and numbers (edit these to rebalance)
    constants.js   every tunable number, in one place
    timeline.js    illumination schedule and hazard calendar
    crew.js        the four astronauts, their bonuses, task list
    objectives.js  the five science objectives
    cargo.js       cargo items and masses
    debrief.js     Flight Director explanations
    sources.js     citations shown on the in-game "Mission data" screen
  engine/        pure JS, no React. Testable in Node.
    simulate.js    newMission, powerBudget, advanceSol, hints
    storylets.js   findStorylet, applyStoryletChoice
  store/         Zustand store, saved to localStorage
  components/    React UI (BaseViewer.jsx is the SVG hero scene)
scripts/balance-check.mjs
```

## Before you submit: verify the numbers

Values are rounded from real sources so the game stays playable. **Check each citation in
`src/data/sources.js` against the original document** and adjust if needed. Known simplifications to mention
honestly in your write-up:

- Greenhouse crops reach harvest in about 10 sols (real lettuce takes about 4 weeks); harvests supplement food rather than replace it.
- Water use treats all electrolysis water as lost; real systems recover some through CO₂ reduction.
- Radiation health effects are simplified into a health penalty; real effects below 1 Sv are long-term risks, not sickness.
- CRaTER measures dose in silicon detectors in lunar orbit. The game uses only the *shape* of each storm (share of dose per day), not its absolute value. Storm strength is a game scaling of the DONKI flare class.
- The daily surface dose (1.37 mSv/day) comes from China's Chang'e-4 lander, not NASA.
- Solar array output is a single per-sol figure, not a full illumination model.

## Accessibility

Easy-read font (Atkinson Hyperlegible), colour-blind palette with ✓ ▲ ✕ symbols on every status,
reduce-motion toggle (also respects the OS setting), keyboard navigation and focus outlines,
native selects for screen readers, works offline as a PWA when hosted over HTTPS.

## Ideas for after the hackathon

Mars mode (dust storms, MOXIE oxygen), more crew storylets, a teacher dashboard, sound design,
translations (all text lives in `src/data/`).
