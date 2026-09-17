# TODO.md

> **For Claude Code:**
>
> - Read `CLAUDE.md` before starting any task — every time
> - Read the files listed under **Reads** before writing any code for that task
> - Check off tasks with `[x]` when complete
> - Write a short implementation note in the `> Note:` line after each task
> - Commit after every task using the git conventions in `CLAUDE.md`
> - Use x.y.z numbering: x = phase, y = group, z = task (z > 10 = added later)
> - If a task reveals something unexpected, add a new x.y.z task before continuing
> - If a task would require a real backend or user accounts, stop and flag it —
>   see `SECURITY.md` and `CLAUDE.md` → Non-negotiable rules

---

# Phase 1 — Foundation

---

## 1.1 — Project scaffolding

### [x] 1.1.1 — Vite + React project skeleton

**Reads:** prompt.txt → Technical requirements
**Creates:** `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`,
`.gitignore`, `.eslintrc.cjs`
**Requirements:**
- Vite + React 18, JavaScript (no TypeScript)
- `vite.config.js` sets `base: '/chess-flash-trainer-v2/'` for GitHub Pages
- `.gitignore` excludes `node_modules/`, `dist/`
**Done when:**
- `npm run build` produces a working `dist/` bundle

```
> Note: Scaffolded manually (no create-vite) for full control over structure.
> React 18.3 + Vite 5.4 + @vitejs/plugin-react. base path set to repo name.
> ESLint configured with eslint:recommended + react + react-hooks.
```

---

### [x] 1.1.2 — Retro theme design tokens

**Reads:** prompt.txt → Visual design
**Creates:** `src/styles/global.css`
**Requirements:**
- CSS custom properties for the dark navy/charcoal/green/amber palette
- Base styles for panels, buttons (primary/accent/danger/ghost), form fields,
  tables, tags, and a `.sr-only` utility for screen-reader-only text
- Responsive `.screen` container
**Done when:**
- Design tokens are reusable across all screens/components without duplication

```
> Note: Tokens cover color, radius, shadow, and animation-speed variables so
> Custom Properties → "animation speed" can later scale --anim-* at runtime.
```

---

## 1.2 — Core game engine utilities

### [x] 1.2.1 — Config constants

**Creates:** `src/game/config.js`
**Requirements:**
- `APP_MODE` constant switching between `personal` (max 1 user) and
  `multiuser` (max 10 users), defaulting to multiuser per spec
- Exercise/phase/direction identifiers and labels, piece colors/shapes,
  default Custom Properties
**Done when:** every other module imports identifiers from here rather than
using string literals inline

```
> Note: getMaxUsers()/isMultiuser() helpers added so PersonalData doesn't
> need to know the raw APP_MODE string.
```

---

### [x] 1.2.2 — Level definitions

**Creates:** `src/game/levels.js`
**Requirements:**
- Levels 1–5 matching the spec's example table (board size, piece count,
  memorization time, flash count/interval, movement complexity, advanced-unlock)
- `isLevelUnlocked(levelId, completedLevels)` — level 1 always unlocked,
  each subsequent level requires the previous one completed
**Done when:** Level Selection screen can render lock state purely from this module

```
> Note: DEFAULT_EXERCISE_ORDER exported for the Game menu / level flow.
```

---

### [x] 1.2.3 — Placement & comparison utilities

**Creates:** `src/game/placement.js`
**Requirements:**
- `generatePieces`, `shufflePieces`, `randomPositions` (unique, non-overlapping)
- `comparePlacements` (per-piece correctness + mistake count)
- `isSquareOccupied`, `isWithinBoard`, `squareToCoordinate` / `coordinateToSquare`
  (for Super Moves' A1/E2/H8 entry)
**Done when:** every exercise engine can build/validate a board state through
this module alone, no ad-hoc position math elsewhere

```
> Note: Fisher-Yates shuffle used for randomPositions to keep distribution
> uniform across board sizes 4x4–8x8.
```

---

### [x] 1.2.4 — Movement generation

**Creates:** `src/game/movement.js`
**Requirements:**
- 8-direction delta table (up/down/left/right + 4 diagonals)
- `generateMoveSet(pieces, boardSize, complexity)` returns a move list plus the
  validated resulting positions — never pushes a piece off-board or onto an
  occupied square
**Done when:** Moves and Super Moves can both consume `generateMoveSet` output directly

```
> Note: findLegalMove() tries randomized direction/distance pairs and falls
> back to "stays in place" if the board is too crowded for a legal move —
> keeps Level 5 (8 pieces on 8x8) from ever throwing.
```

---

### [x] 1.2.5 — Scoring formula

**Creates:** `src/game/scoring.js`
**Requirements:**
- Deterministic formula: base points per correct piece × level multiplier,
  no-mistake bonus, speed bonus (capped), mistake penalty
- Returns a transparent breakdown object for the post-game results screen
**Done when:** the same inputs always produce the same score (no `Math.random`
  in this module)

```
> Note: difficultyMultiplier param reserved for Super Moves (coordinate entry
> is harder than drag-and-drop) — wired up when that engine is built.
```

---

### [ ] 1.2.6 — localStorage persistence layer

**Reads:** SECURITY.md → Sections 2–3
**Creates:** `src/utils/storage.js`
**Requirements:**
- Namespaced keys (`kgb.users`, `kgb.settings`, `kgb.stats.<userId>`, `kgb.achievements.<userId>`)
- Every read/write wrapped in try/catch with safe fallback defaults
- Schema-versioned payloads
- Helper functions: get/set users, get/set settings, get/set per-user stats
  history, get/set achievements
**Done when:** no component or screen calls `localStorage` directly

---

### [ ] 1.2.7 — Statistics aggregation utilities

**Creates:** `src/utils/statsAggregation.js`
**Requirements:**
- Aggregate a per-user session history into: totals played/completed/
  succeeded/failed, success %, best/average score, average time, best result
  per exercise, level progress
- Leaderboard aggregation across all users for Best Intelligencers
**Done when:** Statistics and Best Intelligencers screens are pure render
  layers over this module's output

---

## 1.3 — Global app state

### [ ] 1.3.1 — App context, reducer, and view routing

**Creates:** `src/context/AppContext.jsx`
**Requirements:**
- Holds: current view, user list + selected user, custom properties/settings,
  per-user stats
- View switch is state-based (no React Router), per `CLAUDE.md`
- Handles multiuser eviction: adding a user beyond `getMaxUsers()` removes the
  oldest user and deletes their saved results
**Done when:** every screen reads/writes app state only through this context

---

### [ ] 1.3.2 — Game session finite-state machine

**Creates:** `src/context/GameContext.jsx`
**Requirements:**
- Phases: idle, memorizing, waitingForFirstConfirmation, transformation,
  solving, submitting, results (from `PHASES` in config.js)
- Exposes the current exercise, level, active pieces, player's in-progress
  placement, elapsed time, attempt number
- Prevents invalid transitions (e.g. submitting before all pieces placed)
**Done when:** all five exercise engines drive their flow through this reducer

---

# Phase 2 — Core UI components

### [ ] 2.1 — ChessBoard component

**Creates:** `src/components/ChessBoard.jsx`, `src/components/ChessBoard.css`
**Requirements:** configurable size, coordinate labels, drag-and-drop +
click-to-select/click-to-place, keyboard support, highlight states (selected,
valid drop, correct, incorrect, active), no duplicate-occupancy

### [ ] 2.2 — Piece component

**Creates:** `src/components/Piece.jsx`
**Requirements:** unique id, color, shape (CSS/SVG/Unicode, no copyrighted
assets), accessible label, selected/correct/incorrect visual + text state

### [ ] 2.3 — GameControls + GameStatus

**Creates:** `src/components/GameControls.jsx`, `src/components/GameStatus.jsx`
**Requirements:** Start/OK/Answer buttons gated by current phase; status bar
shows user, exercise, level, score, phase per spec

### [ ] 2.4 — Modal, Toast, ARIA live region

**Creates:** `src/components/Modal.jsx`, `src/components/Toast.jsx`,
`src/components/LiveRegion.jsx`
**Requirements:** accessible dialog (focus trap, Escape to close), transient
toast notifications, a single shared `aria-live="polite"` region for
game-state announcements

### [ ] 2.5 — MenuBar + Layout

**Creates:** `src/components/MenuBar.jsx`, `src/components/Layout.jsx`
**Requirements:** Game menu (New, Statics, Transposition, Flashes, Moves,
Super Moves, Custom..., Custom Properties..., Levels..., Statistics...,
Best Intelligencers..., Exit) + Help menu (Help, About); collapses to a
responsive menu below tablet width; "New" returns to Personal Data; "Exit"
shows the friendly can't-close-the-browser message

---

# Phase 3 — Screens

### [ ] 3.1 — Personal Data screen
### [ ] 3.2 — Level Selection screen
### [ ] 3.3 — Main Game screen (hosts the active exercise engine)
### [ ] 3.4 — Custom Mode screen
### [ ] 3.5 — Custom Properties screen
### [ ] 3.6 — Statistics screen
### [ ] 3.7 — Best Intelligencers (leaderboard) screen
### [ ] 3.8 — Help screen

_(Each expanded into its own Reads/Creates/Requirements/Done-when block as it's started — see `prompt.txt` for the per-screen spec.)_

---

# Phase 4 — Exercise engines

### [ ] 4.1 — Statics
### [ ] 4.2 — Transposition
### [ ] 4.3 — Flashes
### [ ] 4.4 — Moves *(advanced edition only)*
### [ ] 4.5 — Super Moves *(advanced edition only)*

---

# Phase 5 — Ship it

### [ ] 5.1 — Install deps and verify build in cloud workspace
### [ ] 5.2 — Transfer project source to `C:\Git_Projects\chess-flash-trainer-v2`
### [ ] 5.3 — Init local git repo, `.gitignore`, initial commit
### [ ] 5.4 — Install GitHub CLI on device, user completes `gh auth login`
### [ ] 5.5 — Create GitHub repo, push, add GitHub Actions → Pages workflow
### [ ] 5.6 — Final verification: production build + live github.io URL both work

---

_KGB's Secrets — TODO.md_
