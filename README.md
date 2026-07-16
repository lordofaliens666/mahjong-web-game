# Jade Parlour — Mahjong Web Game

A single-player mahjong game that runs entirely in the browser — no build step, no backend. You play East against three randomly-named AI opponents, in one of three rulesets: Singapore, Hong Kong, or American.

Play it live at: `https://<your-username>.github.io/<repo-name>/` (once GitHub Pages is enabled — see below).

## Play locally

Any static file server works, since the pages use ES module `<script type="module">` imports (which browsers block over `file://`). For example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## What's implemented

- **Hero, lobby, and table screens** matching the original design.
- **Three rulesets**, picked in the Lobby:
  - **Singapore** — 4 sets + 1 pair, tai scoring, no minimum to win.
  - **Hong Kong** — same win shape, fan scoring, with a real 3-fan minimum gating win eligibility (a shape-complete but cheap hand can't be declared).
  - **American** — Jokers as wildcards, no chi/kong calls, wins matched against an original 10-pattern set (not the real, copyrighted NMJL card) instead of a generic shape.
- **Full turn engine**: wall of 144 tiles (+ 8 jokers in American), dealing, drawing, discarding.
- **Calling**: Chi, Pong, Kong (off a discard) and self-draw/discard win, with correct call-priority resolution (win > kong > pong > chi, chi restricted to the next seat — and disabled entirely in American).
- **Win detection**: a real 4-sets-+-1-pair hand decomposition solver for Singapore/Hong Kong (not a lookup table), and a pattern matcher with joker substitution for American.
- **Bot AI**: heuristic discard choice (keeps pairs/triplets and sequence-adjacent tiles, discards isolated ones) and call decisions.
- **Profile & settings**: a flower-icon avatar picker (five flowers from Cantonese/Lingnan culture), lifetime stats, table color themes, and bot-speed control — all persisted to `localStorage`.

## Project structure

```
index.html      Hero / landing page
lobby.html      Table browser + ruleset picker (stub — "joining" starts a bot game)
play.html       The game table UI
rules.html      Rules reference for all three rulesets
css/style.css   Shared design tokens & components
js/tiles.js     Tile rendering + deck construction
js/engine.js    Game state machine, win-shape solver, scoring (Singapore/Hong Kong)
js/american.js  American hand-pattern definitions + matcher
js/bot.js       Bot discard heuristic
js/game.js      UI controller wiring the engine to play.html
js/theme.js     Table color themes + settings persistence
js/avatars.js   Profile flower icons
js/profile.js   Profile modal + lifetime stats
js/settings.js  Settings modal
```

## Enabling GitHub Pages

1. Push this repo to GitHub (see below).
2. On GitHub: **Settings → Pages → Source → Deploy from a branch**.
3. Branch: `main`, folder: `/ (root)` → **Save**.
4. Your game will be live at `https://<your-username>.github.io/<repo-name>/` within a minute or two.

## Pushing to GitHub

```bash
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```
