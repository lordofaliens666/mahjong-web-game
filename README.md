# Jade Parlour — Mahjong Web Game

A single-player Singapore-style mahjong game that runs entirely in the browser — no build step, no backend. You play East against three AI opponents (Amir, Su Mei, Farid).

Play it live at: `https://<your-username>.github.io/<repo-name>/` (once GitHub Pages is enabled — see below).

## Play locally

Any static file server works, since the pages use ES module `<script type="module">` imports (which browsers block over `file://`). For example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## What's implemented

- **Hero, lobby, and table screens** matching the original design.
- **Full turn engine**: wall of 144 tiles (dots/bamboo/characters, winds, dragons, 8 flowers), dealing, drawing, discarding.
- **Calling**: Chi, Pong, Kong (off a discard) and self-draw/discard win, with correct call-priority resolution (win > kong > pong > chi, chi restricted to the next seat).
- **Win detection**: a real 4-sets-+-1-pair hand decomposition solver (not a lookup table).
- **Scoring**: a simplified tai count (self-draw, concealed hand, flush, all-triplets, dragon/seat-wind triplets) — not the full official Singapore rule book.
- **Bot AI**: heuristic discard choice (keeps pairs/triplets and sequence-adjacent tiles, discards isolated ones) and call decisions.

## Project structure

```
index.html      Hero / landing page
lobby.html      Table browser (stub — "joining" starts a bot game)
play.html       The game table UI
css/style.css   Shared design tokens & components
js/tiles.js     Tile rendering + deck construction
js/engine.js    Game state machine, win-shape solver, scoring
js/bot.js       Bot discard heuristic
js/game.js      UI controller wiring the engine to play.html
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
