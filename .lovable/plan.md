# 3-Game Sequence for Khushi 🎂

Current flow: `splash → countdown → game (MemoryGame) → card → ending`

New flow: `splash → countdown → game1 (BalloonPop) → game2 (MemoryGame) → game3 (CakeBanao) → card → ending`

Har game complete hone ke baad next game auto-trigger hoga. Teeno complete hone ke baad hi BirthdayCard khulega.

---

## Game 1 — Balloon Pop 🎈 (KHUSHI Speller)

**Concept:** Screen pe floating balloons, tap karke pop. Har balloon me ek letter — sahi order me K-H-U-S-H-I spell karna hai.

**Mechanics:**
- 6 letters spell karne hain: **K → H → U → S → H → I**
- Continuously balloons spawn hote rahenge (random colors: pink, purple, blue, yellow, mint), bottom se top tak float karte hue
- Har balloon pe ek letter (mix of needed + distractor letters like A, B, M, R, etc.)
- User ko **sequence** maintain karna hai — agla expected letter wala balloon hi pop kare
- Galat letter pop kiya → balloon shake + red flash, progress reset nahi hoga but "Oops!" toast
- Sahi letter → balloon burst animation (scale + fade + confetti particles), top header me letter light up
- Top header: `_ _ _ _ _ _` slots — pop hote hi letter fill ho jaata hai with bounce
- Saare 6 letters complete → "KHUSHI! 🎉" celebration + auto-advance to Game 2

**Visuals:**
- Soft pastel gradient background (already-matching dark/light theme tokens)
- Balloons: SVG/CSS shapes with string, gentle sway animation
- Float duration: ~6-8s per balloon, spawn rate ~1.2s
- Use existing `motion` from framer-motion (already in project)

**Files:**
- New: `src/components/BalloonPopGame.tsx`

---

## Game 2 — Memory Match 🧠 (existing, untouched)

Current `MemoryGame.tsx` as-is. 6-pair emoji match. Onki naya prop pass hoga `onComplete` jo Game 3 trigger karega.

---

## Game 3 — Cake Banao 🎂 (Drag & Drop Assembly)

**Concept:** Khushi ke liye apna birthday cake step-by-step assemble karna. 4 stages — each stage me ek ingredient drag karke cake pe drop karna.

**Stages:**
1. **Base** — Plate pe sponge base drag karo
2. **Cream** — Cream/frosting ki layer base pe drag karo
3. **Cherries** — 3 cherries one-by-one top pe drag karo
4. **Candles** — Lit candle drag karo (with flame animation)

**Mechanics:**
- Left side: ingredient tray (current stage ka item highlighted, others dimmed)
- Center: cake assembly area (showing progress visually)
- Right/bottom: instruction text: "Step 1/4: Base rakhho 🍰"
- HTML5 native drag-and-drop (`draggable`, `onDragStart`, `onDrop`) — no extra library, works on desktop
- Touch: use pointer events / framer-motion `drag` for mobile compatibility
- Drop zone has hover-glow when ingredient is dragged over
- Wrong drop area → ingredient snap-back with shake
- Correct drop → ingredient locks into place with bounce, progress bar advances, next stage unlocks
- Last candle placed → cake "glows", flame animates, confetti burst, "Happy Birthday Khushi! 🎉" → auto-advance to BirthdayCard

**Visuals:**
- Cake built as stacked SVG layers (plate → sponge → cream → cherries → candles)
- Each layer fades-in + scales when dropped
- Cream layer = soft white/pink gradient with drip edges
- Candles flicker with small flame `<motion.div>` animation

**Files:**
- New: `src/components/CakeBanaoGame.tsx`

---

## Index.tsx Wiring Changes

**Phase type update:**
```ts
type Phase = "splash" | "countdown" | "game1" | "game2" | "game3" | "card" | "ending";
```

**Render section:**
```tsx
{phase === "game1" && <BalloonPopGame onComplete={() => setPhase("game2")} />}
{phase === "game2" && <MemoryGame onComplete={() => setPhase("game3")} />}
{phase === "game3" && <CakeBanaoGame onComplete={() => setPhase("card")} />}
```

**Countdown unlock:**
```ts
const handleCountdownUnlock = useCallback(() => setPhase("game1"), []);
```

**3-min auto re-lock effect:** Update condition to include `game1`, `game2`, `game3` in `isPostUnlock` so re-lock works during all games too:
```ts
const isPostUnlock = ["game1","game2","game3","card","ending"].includes(phase);
```

**Audio logic:** Update `prev === "countdown" && phase === "game"` → `prev === "countdown" && phase === "game1"` for birthday.mp3 crossfade trigger.

---

## Shared UI Pattern (consistency across all 3 games)

- Same card container style: `bg-card rounded-2xl shadow-2xl border border-border`
- Same header band: `bg-primary` with title + progress dots
- Same completion screen: spring-scale `🎉` + "Unlocked!" / "Next Game!" copy + 1.5s auto-advance
- All use semantic tokens (no hardcoded colors)
- Dark/light mode auto-supported via existing tokens

---

## Memory Update (after build)

Update `mem://features/memory-game` description → rename concept to **"3-Game Unlock Sequence"** and document the order: Balloon Pop → Memory Match → Cake Banao.

---

## Technical Summary

| File | Action |
|---|---|
| `src/components/BalloonPopGame.tsx` | **New** — floating balloons, KHUSHI sequence speller |
| `src/components/CakeBanaoGame.tsx` | **New** — 4-stage drag-drop cake assembly |
| `src/components/MemoryGame.tsx` | Unchanged |
| `src/pages/Index.tsx` | Add `game1`/`game2`/`game3` phases, update audio + re-lock conditions |
| Memory file | Update to reflect 3-game sequence |

No backend changes. No new dependencies. Pure frontend, framer-motion only.
