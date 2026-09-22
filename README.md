# Memory Match (Levels)

A flip-card memory game with three grid sizes, a live timer/move counter, and
best-score tracking saved in the browser.

## Play

Open `index.html` in a browser (or visit the live link, if this repo has
GitHub Pages enabled). No build step, no dependencies.

1. Pick a difficulty: Easy (4×4), Medium (6×6), or Hard (8×8).
2. Flip two cards per turn. Matching pairs stay face up; mismatches flip
   back after a short delay.
3. Match every pair to win. Your best time and fewest moves per grid size
   are saved automatically (`localStorage`) and shown on the menu.

Cards are keyboard-accessible: tab to a card and press Enter/Space to flip it.

## Files

- `index.html` — screens (menu / game / win)
- `style.css` — layout, responsive grid, 3D flip animation
- `script.js` — game logic, timer, best-score persistence

## Notes

- Best scores are per-device (browser localStorage), not synced anywhere.
- The board grid uses `1fr` columns inside a `min(94vw, 480px)`-wide
  container, so it scales down cleanly on narrow screens for every size.
