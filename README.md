# ♻️ SwipeSort – Beat the Clock

A web rebuild of the Power Apps game. Sort every item into the right bin before 45 seconds run out.
React 18 · Vite · TypeScript · Tailwind CSS · Framer Motion. No backend: high scores and settings live in `localStorage`.

## Setup

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # Vitest (scoring, combo, level filtering, item picking)
npm run build      # type-check + production build
```

## Controls

| Action | Touch / mouse | Keyboard |
| --- | --- | --- |
| ♻️ Recycle | swipe card left, or tap bin | ← |
| 🗑️ Trash | swipe card right, or tap bin | → |
| 🌱 Compost (Medium, Hard) | swipe card down, or tap bin | ↓ |
| 🔌 E-waste (Hard) | swipe card up, or tap bin | ↑ |
| Pause / resume | – | Esc |
| Quit | ✕ Quit button (asks to confirm) | Esc, then Quit |

Drag the card toward a bin: it tilts, and the target bin glows as you get close. Release past the threshold to drop it, or let go early and it springs back.
The round also pauses automatically when the browser tab is hidden.

## Rules

- 3-2-1 countdown, then 45 seconds.
- Correct: +10 points, streak +1. Every 5 correct in a row gives a +25 COMBO bonus (first combo "x2", then "x3", …).
- Wrong: streak resets and the card shakes. No points are lost. The right bin is highlighted for 600 ms and a tip is shown.
- Items are shuffled and not repeated until the pool for the level is used up.
- Best score and best streak per level are saved when the round ends.

## Configuration

Everything tunable is in [src/data/levels.ts](src/data/levels.ts): round time, points, combo size and bonus, urgency threshold, drag threshold, reveal time, plus the bins and levels.

## Adding items

Open [src/data/items.ts](src/data/items.ts) and append to the `ITEMS` array:

```ts
{ id: 'glass-cup', name: 'Glass Cup', emoji: '🥃', bin: 'recycle', tip: 'Drinking glass is not recyclable curbside…' },
```

- `id` must be unique.
- `bin` is `'recycle' | 'trash' | 'compost' | 'ewaste'`. Items whose bin isn't on the chosen level are filtered out automatically.
- `tip` is shown after a wrong answer and on the Game Over review list.

## Structure

```
src/
  components/  HUD, TimerBar, ItemCard, Bin, ComboToast, Countdown, SoundToggles
  screens/     HomeScreen, GameScreen, GameOverScreen
  hooks/       useGameTimer, useHighScores, useSound
  data/        items.ts, levels.ts
  logic/       game.ts (pure functions) + game.test.ts
```

## Accessibility

Bins are real `<button>`s with `aria-label`s, focus rings are visible, feedback is announced through an `aria-live` region, and `prefers-reduced-motion` is respected (tilt, shake and fly animations are reduced). Sound and vibration have mute toggles that are remembered.
