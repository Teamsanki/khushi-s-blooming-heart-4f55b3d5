## 1. Scratch-to-Reveal on Photo Pages

Embed a scratch-card overlay **inside the existing book pages** (not a separate screen). Photo + shayari render normally underneath; a silver/gradient coating sits on top until user scratches enough to reveal.

**Target pages:** photo indices `3, 6, 9, 12, 14` (every 3rd page, plus the last). Other photo pages stay normal fade-in.

### Component: `src/components/ScratchOverlay.tsx` (new)
- Wraps children (the PhotoCard content).
- Canvas absolutely positioned over the photo area, filled with a soft silver/pastel gradient + tiny "✨ Scratch karo ✨" hint text drawn on canvas.
- Pointer/touch listeners: `globalCompositeOperation = "destination-out"` to erase a soft circular brush (radius ~28px) along the path.
- Tracks % erased (sampled every N strokes via `getImageData` on a downscaled offscreen canvas for perf).
- At **55% erased** → auto fade-out the remaining coating (300ms) + sparkle burst (framer-motion particles) + haptic vibrate (if supported) + soft chime.
- Calls `onRevealed()` so parent marks page ready (so the Next button enables only after reveal).
- Light/dark theme aware via semantic HSL tokens.

### Edits to `src/components/BirthdayCard.tsx`
- Add `const SCRATCH_PAGES = new Set([3, 6, 9, 12, 14])` (1-based photo index = `currentPage`).
- In the photo branch, wrap `<PhotoCard …/>` with `<ScratchOverlay>` when `SCRATCH_PAGES.has(currentPage)`.
- Defer `setPageReady(true)` until `onRevealed` fires for scratch pages (PhotoCard's normal `onReady` still fires underneath so image is preloaded).
- Shayari fade-in delayed until reveal on those pages, so it feels like the line "appears" with the photo.

## 2. Butterfly Catch — Game 4 (`src/components/ButterflyCatchGame.tsx`, new)

Placed **after CakeBanao, before BirthdayCard**.

### Routing edit in `src/pages/Index.tsx`
- Extend `Phase` with `"game4"`.
- `game3` `onComplete` → `setPhase("game4")`.
- `game4` renders `<ButterflyCatchGame onComplete={() => setPhase("card")} />`.

### Gameplay
- 10 sequential rounds. Each round shows a target color prompt: "Ab **Pink** titli pakdo 🦋" (Hinglish), with a colored chip + count `3 / 10`.
- Colors cycle through: pink, blue, yellow, purple, orange, red, cyan, green, magenta, gold (10 distinct).
- Multiple butterflies (4–6) flutter on screen at once across all colors. User must tap the one matching current target.
  - Correct tap → butterfly does "caught" animation (shrink + sparkle + glow), +1 progress, next color prompt slides in.
  - Wrong color → butterfly does a quick "escape" wing-flap dodge away from finger, soft shake + red flash on screen edge (no penalty, just feedback).
- Round 10 cleared → confetti burst + "10/10 titliyan pakdi! 🦋✨" overlay + Continue → `onComplete()`.

### Realistic butterfly motion
- Each butterfly is a small SVG (two wing paths mirrored) animated with:
  - **Wing flap:** CSS/inline transform `scaleX` on each wing on a 90–140ms cycle (jittered per-butterfly so they're not in sync).
  - **Flight path:** RAF loop. State = `{x, y, vx, vy, heading, wingPhase}`. Each frame:
    - Add slight perlin-ish noise to `heading` (small random delta) → curving flight.
    - Occasionally pick a new waypoint and ease toward it (Bezier-ish) for that "fluttery zigzag".
    - Tilt SVG by `heading` so it banks into turns.
    - Wrap softly at screen edges (turn around, not teleport).
  - **Idle pauses:** ~10% chance per second to briefly settle (slow vx/vy, wing flap slows) on a flower/leaf SVG, then take off again.
- Hit detection: tap within bounding circle (~32px radius). Touch-friendly.
- "Escape dodge" on wrong tap: spike `vx/vy` away from tap point for 600ms.

### Visual / theme
- Background: soft garden gradient using semantic tokens (`--background` → accent), with parallax flower silhouettes drifting slowly.
- Score HUD top-center: target color chip + `caught / 10` + small "Skip / Pass" not provided (must complete).
- Light/dark mode aware.

### Audio
- Tiny "catch" chime (Web Audio API oscillator, no asset) on correct tap.
- Soft "whoosh" on wrong tap.
- Final completion: short sparkle arpeggio. (No external assets needed.)

## 3. Memory updates
- New memory `mem://features/scratch-reveal` — scratch overlay on photo pages 3/6/9/12/14, 55% threshold, gates Next button.
- New memory `mem://features/butterfly-catch` — Game 4, 10 sequential color targets, RAF physics, after CakeBanao before Card.
- Update `mem://features/memory-game` → rename concept to "4-Game Unlock Sequence" and append Butterfly Catch as step 4.
- Update `mem://index.md` Core line + Memories list.

## Files
- **New:** `src/components/ScratchOverlay.tsx`, `src/components/ButterflyCatchGame.tsx`
- **Edited:** `src/components/BirthdayCard.tsx`, `src/pages/Index.tsx`
- **Memory:** `mem://features/scratch-reveal`, `mem://features/butterfly-catch`, update existing index + memory-game note.

No backend / schema changes. No new dependencies (framer-motion already used).
