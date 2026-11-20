# Leonida Legend — GTA 6 Trophy Guide &amp; Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/bangpateng/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/bangpateng/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![Invite](https://img.shields.io/badge/invite-0h2zmzc4-2de2e6)](https://make.fun/r/0h2zmzc4)

The complete **Grand Theft Auto VI** trophy guide: all **55 official trophies** (1 Platinum, 2 Gold, 6 Silver, 46 Bronze) with a guide in plain words for every one, a roadmap to the Platinum, and a checklist tracker that works fully offline. Built for make.fun's ["Build the best GTA 6 trophy guide"](https://make.fun/bounty/gta6-trophy-guide-01) bounty.

## What it does

- **All 55 trophies, verified against the official list** — names, descriptions and grades as published on PlayStation Network on 2026-11-18 (cross-checked by PlanetGTA6 against Exophase, PSNProfiles and TrueAchievements). The same 55 exist on Xbox as achievements worth 1,000 Gamerscore.
- **A guide for every trophy, in its own words, with sources** — what it is, how to earn it, and a tip, plus the sources behind it. No trophy is left unsourced.
- **Honest about the unknowns** — 46 trophies confirmed, 7 partly confirmed (the requirement is clear, the exact spot or method is still being confirmed), and 2 with no verified method yet (*Bad Luck, I Guess* and *The Truth Is Out There*). The guide says so instead of inventing steps.
- **Roadmap to the Platinum** — three phases (story 60–80 hrs, 100% completion ~100 hrs, cleanup 10–20 hrs), the full 100% checklist table for *A Long Road*, and the facts that matter: ~200 hours, difficulty 4/10, no mission replay, no New Game Plus, cheats disable trophies, 0 online trophies.
- **The one missable trophy, flagged first** — *Positive Mental Attitude* (meditate at all 18 spots) and Lucia's balcony meditation in Chapter 1, with the save strategy that protects it.
- **Tracker** — tick trophies off; progress is saved in the browser (local storage) and survives reloads. Export and import progress as JSON, or reset it.
- **Filters** — search, grade, kind (story, character strands, collectibles, activities, robberies, combat, exploration, miscellaneous), missable-only, hide-earned.
- **Spoiler setting** — the 28 hidden/story trophies stay hidden until earned (or until you turn spoilers off). Filtered views are shareable by URL (`?grade=silver&spoilers=shown`).
- **Offline** — static files under `app/`, no network requests, no external assets. Open `app/index.html` in desktop Chrome with the network off and everything works.

## Run it

```sh
node serve.ts            # serves app/ on http://localhost:8080
# or open app/index.html directly in a browser
```

## How it is built

- `app/index.html`, `app/style.css`, `app/app.js` — the guide and tracker (ES module, no build step, no dependencies).
- `app/data/trophies.json` — the 55 trophies with official names/descriptions, grades, hidden/missable flags, per-trophy guides and sources.
- `main.ts` (Node 22) — validates the guide (55 trophies, the grade mix, 28 hidden, exactly 1 missable, every guide sourced) and the screenshots, then copies `app/` and `screenshots/` to the output and writes `dossier.json` with the vendored make.fun library.
- `shots.json` — which views the four screenshots were taken of.
- `vendor/makefun-frontend.ts` — copied from the make.fun kit, unchanged.

## Sources

- PlayStation Network trophy list, 2026-11-18 — via Exophase, cross-checked with PSNProfiles and TrueAchievements.
- PlanetGTA6 — GTA 6 Trophies: All 55 trophies and Xbox achievements.
- KeenGamer — GTA 6 Trophy Guide &amp; Platinum Roadmap, All 55 Trophies (2026-11-19).

Unofficial fan guide. Not affiliated with Rockstar Games or Take-Two Interactive. No Rockstar logo or official artwork is used anywhere in this guide.

## Licence

MIT — see [LICENSE](LICENSE).
