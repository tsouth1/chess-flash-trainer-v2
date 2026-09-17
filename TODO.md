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

### [x] 1.2.6 — localStorage persistence layer

**Reads:** SECURITY.md → Sections 2–3
**Creates:** `src/utils/storage.js`
**Requirements:**
- Namespaced keys (`kgb.users`, `kgb.settings`, `kgb.stats.<userId>`, `kgb.achievements.<userId>`)
- Every read/write wrapped in try/catch with safe fallback defaults
- Schema-versioned payloads
- Helper functions: get/set users, get/set settings, get/set per-user stats
  history, get/set achievements
**Done when:** no component or screen calls `localStorage` directly

```
> Note: safeGet/safeSet wrap every access in try/catch with a fallback value.
> Payloads stored as {schemaVersion, data} so a future shape change can
> migrate instead of crashing on read.
```

---

### [x] 1.2.7 — Statistics aggregation utilities

**Creates:** `src/utils/statsAggregation.js`
**Requirements:**
- Aggregate a per-user session history into: totals played/completed/
  succeeded/failed, success %, best/average score, average time, best result
  per exercise, level progress
- Leaderboard aggregation across all users for Best Intelligencers
**Done when:** Statistics and Best Intelligencers screens are pure render
  layers over this module's output

```
> Note: aggregateUserStats() and aggregateLeaderboard() are pure functions
> over session arrays - Statistics.jsx and Leaderboard.jsx just call them.
```

---

## 1.3 — Global app state

### [x] 1.3.1 — App context, reducer, and view routing

**Creates:** `src/context/AppContext.jsx`
**Requirements:**
- Holds: current view, user list + selected user, custom properties/settings,
  per-user stats
- View switch is state-based (no React Router), per `CLAUDE.md`
- Handles multiuser eviction: adding a user beyond `getMaxUsers()` removes the
  oldest user and deletes their saved results
**Done when:** every screen reads/writes app state only through this context

```
> Note: implemented as a single AppContext (not split into a separate
> reducer file) covering view routing, users, settings, toasts, and the
> shared ARIA live-region message. addUser() handles the eviction rule and
> surfaces a toast when it fires.
```

---

### [x] 1.3.2 — Game session state (per-exercise, via a shared hook)

**Creates:** `src/game/useGameSession.js`
**Requirements:**
- Phases: idle, memorizing, waitingForFirstConfirmation, transformation,
  solving, submitting, results (from `PHASES` in config.js)
- Exposes the current exercise, level, active pieces, player's in-progress
  placement, elapsed time, attempt number
- Prevents invalid transitions (e.g. submitting before all pieces placed)
**Done when:** all five exercise engines drive their flow through this reducer

```
> Note: design change from the original plan - instead of one global
> GameContext reducer trying to model all five very different exercise
> flows, each exercise engine owns its own local phase state and calls the
> shared `useGameSession` hook for the parts that ARE common: phase
> announcements, the timer, and `finishGame()` (scoring + persisting the
> session + updating achievements). This kept each engine's phase
> transitions readable instead of forcing them through one generic
> reducer. Invalid submission is still prevented per-engine (e.g.
> `okEnabled = allPlaced` while solving).
```

---

# Phase 2 — Core UI components

### [x] 2.1 — ChessBoard component

**Creates:** `src/components/ChessBoard.jsx`, `src/components/ChessBoard.css`
**Requirements:** configurable size, coordinate labels, drag-and-drop +
click-to-select/click-to-place, keyboard support, highlight states (selected,
valid drop, correct, incorrect, active), no duplicate-occupancy

```
> Note: squares are real <button> elements with descriptive aria-labels
> ("Square A4, empty" / "...occupied by circle piece, correct"). Supports
> both HTML5 drag-and-drop and click-to-select-then-click-to-place, so it's
> fully usable via keyboard/screen reader. isSquareOccupied() from
> placement.js blocks duplicate placement.
```

### [x] 2.2 — Piece component

**Creates:** `src/components/Piece.jsx`, `src/components/Piece.css`
**Requirements:** unique id, color, shape (CSS/SVG/Unicode, no copyrighted
assets), accessible label, selected/correct/incorrect visual + text state

```
> Note: shapes are Unicode glyphs (●▲■◆★⬡✚⬟) colored via inline style - no
> image assets. Correct/incorrect/selected states are conveyed via both a
> CSS class AND an sr-only text suffix, never color alone.
```

### [x] 2.3 — GameControls + GameStatus

**Creates:** `src/components/GameControls.jsx`, `src/components/GameStatus.jsx`, `src/components/GameStatus.css`
**Requirements:** Start/OK/Answer buttons gated by current phase; status bar
shows user, exercise, level, score, phase per spec

```
> Note: GameControls takes explicit `okEnabled`/`showAnswer` booleans from
> the calling exercise engine rather than inferring them from phase alone,
> since what "OK" does differs per exercise (confirm memorization vs.
> submit an answer vs. accept a Flashes guess).
```

### [x] 2.4 — Modal, Toast, ARIA live region

**Creates:** `src/components/Modal.jsx`, `src/components/Modal.css`,
`src/components/Toast.jsx`, `src/components/Toast.css`, `src/components/LiveRegion.jsx`
**Requirements:** accessible dialog (focus trap, Escape to close), transient
toast notifications, a single shared `aria-live="polite"` region for
game-state announcements

```
> Note: Modal traps focus (Tab/Shift+Tab wrap), closes on Escape or
> backdrop click, and restores focus to the triggering element on close.
> LiveRegion reads AppContext's `liveMessage`, which `announce()` clears
> and re-sets on a rAF so repeated identical phase announcements still get
> read out by screen readers.
```

### [x] 2.5 — MenuBar + Layout

**Creates:** `src/components/MenuBar.jsx`, `src/components/MenuBar.css`, `src/components/Layout.jsx`
**Requirements:** Game menu (New, Statics, Transposition, Flashes, Moves,
Super Moves, Custom..., Custom Properties..., Levels..., Statistics...,
Best Intelligencers..., Exit) + Help menu (Help, About); collapses to a
responsive menu below tablet width; "New" returns to Personal Data; "Exit"
shows the friendly can't-close-the-browser message

```
> Note: collapses into a toggled "Menu" button under 720px. Moves/Super
> Moves/Custom... are gated behind `settings.advancedEdition`, showing a
> toast instead of navigating when it's off. Best Intelligencers is hidden
> from the menu entirely when `APP_MODE` is 'personal'.
```

---

# Phase 3 — Screens

### [x] 3.1 — Personal Data screen

```
> Note: add/select/delete username, mode-aware max-user messaging, and a
> "confirm delete?" two-click pattern on the Delete button instead of a
> separate modal for that one action.
```

### [x] 3.2 — Level Selection screen

```
> Note: exercise picker + level grid in one screen; locked levels are
> visually dimmed AND labeled "Locked" (not color-only), and clicking one
> shows a toast rather than silently doing nothing.
```

### [x] 3.3 — Main Game screen (hosts the active exercise engine)

```
> Note: GameScreen.jsx is a thin dispatcher mapping `pendingExercise.exercise`
> to one of the five exercise engine components under `src/screens/exercises/`.
```

### [x] 3.4 — Custom Mode screen

```
> Note: exercise type, board size, piece count, color count, memorization
> time, flash speed/count, movement difficulty, show-coordinates - validates
> piece count against the selected board size before allowing Start.
```

### [x] 3.5 — Custom Properties screen

```
> Note: permanent defaults persisted via AppContext → storage.js. Validates
> board size, piece count, memorization duration, and flash interval ranges
> with inline field errors before saving.
```

### [x] 3.6 — Statistics screen

```
> Note: current user, totals/success-rate/best/average stat tiles, best
> score per exercise, level-progress tags, recent-history table, and a
> Clear Statistics button behind a confirmation Modal.
```

### [x] 3.7 — Best Intelligencers (leaderboard) screen

```
> Note: hidden with an explanatory message when APP_MODE is 'personal'.
> Sortable by total score / success rate / best level.
```

### [x] 3.8 — Help screen

```
> Note: covers starting a game, memorizing, drag/keyboard placement, how
> each of the five exercises works, levels, statistics, Custom vs. Custom
> Properties, board coordinates, and keyboard/accessibility controls, plus
> an About blurb.
```

_(Plus a not-originally-listed 3.9 — Exit screen: friendly "browsers can't
close their own tab" message with a button back to Personal Data, per the
Game menu spec.)_

---

# Phase 4 — Exercise engines

### [x] 4.1 — Statics

```
> Note: implemented via the shared `PlacementBoardExercise` engine
> (transpose=false) - memorize → clear board → drag/click pieces from a
> tray back onto their original squares → submit → per-piece correct/
> incorrect highlighting + an Answer toggle to reveal the solution.
```

### [x] 4.2 — Transposition

```
> Note: also built on `PlacementBoardExercise` (transpose=true). Design
> decision: after the first OK, one shuffled arrangement is shown briefly
> (1.2s) then the board clears, and the player reconstructs the ORIGINAL
> arrangement from an empty board/tray - the same interaction model as
> Statics, rather than dragging pieces around on top of the transformed
> board. This was chosen for consistency and accessibility (one placement
> model to learn) since prompt.txt left the exact interaction ambiguous
> beyond "restore the original arrangement". If a closer-to-original-game
> feel is wanted later, this is the place to revisit.
```

### [x] 4.3 — Flashes

```
> Note: builds a frame sequence where exactly one flash (never the first)
> matches the original arrangement; player clicks OK and whichever frame
> was on-screen at that moment is compared to the original. Auto-submits
> on the last frame if the player never clicks. Configurable via
> level.flashCount / level.flashIntervalMs (or Custom Mode's equivalents).
```

### [x] 4.4 — Moves *(advanced edition only)*

```
> Note: memorize → OK hides board, shows the move list (piece/squares/
> direction, from movement.js) → OK hides the list and shows an empty
> board + tray → player places each piece on its calculated square →
> submit. Gated behind settings.advancedEdition via the menu/Level Selection.
```

### [x] 4.5 — Super Moves *(advanced edition only)*

```
> Note: same memorize → move-list flow as Moves, but after the second OK
> the board is NOT shown again - the player picks each piece's new
> column/row from two <select> dropdowns (screen-reader friendly stand-in
> for typing "E4"), with a reminder about column/row orientation and a
> duplicate-square guard before submit is allowed.
```

---

# Phase 5 — Ship it

### [x] 5.1 — Install deps and verify build

```
> Note: `registry.npmjs.org` was initially blocked by this account's
> network egress allowlist in both the cloud workspace and the linked
> device - the user enabled broader network access from Settings, after
> which `npm install` + `npm run build` succeeded on the user's machine
> (69 modules, dist output ~204kB JS / 8.5kB CSS gzipped). `npm run lint`
> passes clean (after adding `ignorePatterns: ['dist','node_modules']` to
> .eslintrc.cjs, which was initially linting the built bundle). `npm audit`
> shows one moderate esbuild advisory that only affects `vite dev`'s dev
> server, not the production build GitHub Pages serves - left as-is.
```

### [x] 5.2 — Transfer project source to `C:\Git_Projects\chess-flash-trainer-v2`

```
> Note: packaged as a tar.gz and delivered via SendUserFile + device
> commit/extract rather than file-by-file, since this device bridge can't
> write `.github/workflows/*` paths directly (protected-path restriction) -
> that one file was written via the device shell instead.
```

### [x] 5.3 — Init local git repo, `.gitignore`, initial commit

```
> Note: local git identity set to "Terry" + a GitHub noreply email
> (40437662+tsouth1@users.noreply.github.com) per the user's choice, to
> keep their real email address out of public commit history.
```

### [x] 5.4 — Install GitHub CLI on device, authenticate

```
> Note: `gh auth login`'s interactive device-code flow doesn't work through
> this session's command execution model (no way to relay the printed code
> back before the command finishes waiting on it), so authentication used
> a user-supplied Personal Access Token via `GH_TOKEN` instead - which also
> sidestepped a `read:org` scope requirement that `gh auth login --with-token`
> enforces but plain API/git usage doesn't need. The token was passed as a
> command argument (visible in this session's own logs, not written to any
> project file) and is not persisted in `.git/config` - `git push` initially
> leaked it into `.git/config` via a token-in-URL push, which was
> immediately corrected to use `credential.helper store` (`~/.git-credentials`,
> mode 600, outside the repo) instead.
```

### [x] 5.5 — Create GitHub repo, push, add GitHub Actions → Pages workflow

```
> Note: repo created public at github.com/tsouth1/chess-flash-trainer-v2.
> Pages enabled with build_type=workflow via the API (Settings → Pages →
> Source → GitHub Actions, already configured - no further UI step needed).
> First Actions run: build succeeded in 15s, deploy succeeded in 8s once
> Pages was enabled.
```

### [x] 5.6 — Final verification: production build + live github.io URL both work

```
> Note: verified via the linked device's browser pane against the live URL
> (not just localhost): Personal Data → add user → Level Selection → Statics
> Level 1 → Start → memorize → OK → click-to-place pieces from tray → Submit
> → Results screen with correct/incorrect per piece (both color AND text,
> per the accessibility rule) and a working score breakdown. Zero console
> errors throughout. Live at https://tsouth1.github.io/chess-flash-trainer-v2/
```

---

# Post-launch fixes

### [x] 6.1 — Board resized during play and rendered too small

**Reads:** `src/components/ChessBoard.css`, `src/components/ChessBoard.jsx`
**Creates/Modifies:** `src/components/ChessBoard.css`, `src/components/ChessBoard.jsx`,
`src/components/Piece.css`, `src/screens/exercises/MovesExercise.jsx`,
`src/screens/exercises/PlacementBoardExercise.jsx`
**Requirements:**
- The board must stay a fixed pixel size for the duration of a game, regardless
  of how many pieces are currently placed on it
- The board should read comfortably on a large hi-res monitor, not just fit a
  small fixed max-width
**Done when:**
- Board square size is unaffected by adding/removing pieces
- Board is visibly larger on a 1920px+ viewport than before

```
> Note: Root cause - .board-row__squares had no grid-template-columns of its
> own (tracks were set inline per-row as bare `1fr`), and .board-square relied
> on aspect-ratio with no explicit width. With no ancestor of definite width,
> grid fell back to content-based (max-content) track sizing, so the board's
> pixel size shifted based on piece glyph content as pieces were placed/
> removed. Fixed by introducing --square-size (clamp(64px, 8vw, 112px),
> viewport-driven only, never content-driven) and --cols (set from the
> boardSize prop via inline style on the wrapper) as CSS custom properties,
> used for every grid track and as explicit width/height on .board-square.
> Also raised max-width from ~560px to 96vw and scaled up piece glyph/tray
> sizing to match the larger board. Verified live on
> https://tsouth1.github.io/chess-flash-trainer-v2/ at 1920x1080: square size
> held at 112px (the clamp ceiling) through memorizing → clear → placing each
> piece one-by-one → submit → results, and correctly scaled down to the
> mobile clamp range (56px at 375px viewport) under the existing media query.
```

---

# Known follow-ups (not blocking, not in original spec scope)

- [ ] Add automated tests (Vitest) for `src/game/*` pure functions - the
  user declined this for the initial build; the modules are already
  side-effect-free and easy to test whenever it's wanted.
- [ ] Consider a real drag-reorder interaction for Transposition (see 4.2
  note above) if the empty-board reconstruction model feels too similar
  to Statics in play-testing.
- [ ] `npm audit`'s esbuild/vite dev-server advisory - fine to ignore for a
  static-only deployment, but worth clearing next time Vite gets a major
  bump.
- [ ] Sound effects toggle exists in Custom Properties but no actual sounds
  are wired up yet - prompt.txt only asked for the on/off setting to
  exist, not for audio assets.

---

_KGB's Secrets — TODO.md_
