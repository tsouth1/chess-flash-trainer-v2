# CLAUDE.md

> Single entry point for Claude Code on the **KGB's Secrets** project.
> Read this file first — always. Then read `TODO.md` for current status and
> `SECURITY.md` before touching persistence, dependencies, or the deploy workflow.

---

## Read these files before writing any code

| File | When to read |
|------|--------------|
| **SECURITY.md** | Always — every task, every time |
| **TODO.md** | Before starting any task — confirm what phase/task you're on |
| **prompt.txt** | The original full feature spec. Source of truth for "is X in scope". |
| **README.md** | Before changing how the project is run, built, or deployed |
| **LICENSE.md** | Before touching `src/components/pieceGraphics.jsx`, or before adding any other third-party image/icon/font/audio asset |

**Rule:** If a requirement in `prompt.txt` is ambiguous, make the most reasonable
call, note the decision inline as a code comment, and record it in `TODO.md` under
the relevant task's note line rather than silently guessing and moving on.

---

## Your role

You are working on **KGB's Secrets**, a retro-styled chessboard memory and
concentration training game. It is a 100% client-side static web app: no backend,
no auth, no network calls, no telemetry. Everything a player does — users,
settings, statistics, achievements — lives in `localStorage` in their own browser.

Keep that boundary intact. The moment a task seems to need a server, a database,
or an account system, that's a sign the task has drifted out of scope — stop and
flag it rather than reaching for a backend.

---

## Non-negotiable rules

1. **No backend, ever.** Pure static site — HTML/CSS/JS built by Vite, deployable
   as-is to GitHub Pages. No API routes, no server-rendered content.
2. **Every third-party asset needs a known, compatible license and a recorded
   attribution — no "unclear licensing" imports, ever.** The one exception in
   this project is `src/components/pieceGraphics.jsx`: the standard Wikimedia
   Commons "Cburnett" chess piece SVG set, CC BY-SA 3.0 Unported, explicitly
   approved for use here with the attribution recorded in `LICENSE.md`. That
   approval is specific to that one asset — it is not a green light to import
   other third-party art, icon packs, fonts, or audio without going through
   the same process first: confirm the exact license, record the required
   attribution in `LICENSE.md`, and flag any ShareAlike/copyleft term here
   (see `LICENSE.md`'s ShareAlike notice — because `pieceGraphics.jsx` is a
   CC BY-SA derivative, that one file is itself CC BY-SA 3.0, independent of
   whatever license the rest of this project's code carries). When there's
   any doubt about a new asset's license, don't import it — use a CSS shape,
   a Unicode glyph, or original inline SVG instead, same as before this
   piece set was approved.
3. **localStorage is the only persistence layer.** All reads/writes to it go
   through `src/utils/storage.js` — never call `localStorage` directly from a
   component. This keeps schema versioning and error handling in one place.
4. **Accessibility is not optional.** Every interactive control needs a label,
   a visible focus state, and a keyboard path. Game-state changes that matter
   (phase transitions, correct/incorrect results) must be announced through the
   shared ARIA live region, not conveyed by color alone.
5. **Deterministic scoring.** The formula in `src/game/scoring.js` is the single
   source of truth for points. Don't add ad-hoc score math inside a screen or
   exercise engine.
6. **`vite.config.js`'s `base` must match the GitHub repo name.** If the repo is
   ever renamed, update `base: '/repo-name/'` in the same commit as the rename,
   or GitHub Pages will serve a blank page.
7. **Keep logic out of components where practical.** Random placement, position
   comparison, movement generation, boundary validation, scoring, and stats
   aggregation belong in `src/game/*` / `src/utils/*`, not inlined in JSX.
8. **Commit after every logical unit.** See git conventions below.

---

## Tech stack

| Component | Technology | Notes |
|-----------|------------|-------|
| Framework | React 18 (JavaScript, not TypeScript) | Functional components + hooks only |
| Build tool | Vite | `npm run dev` / `npm run build` / `npm run preview` |
| Routing | Internal state-based view switch (no React Router) | Keeps GitHub Pages deploy simple — no server rewrites needed |
| Styling | Plain CSS with custom properties (`src/styles/global.css`) | Retro navy/charcoal/green/amber theme |
| Persistence | Browser `localStorage` via `src/utils/storage.js` | No backend, no cookies, no external DB |
| Hosting | GitHub Pages, built by GitHub Actions | See `.github/workflows/deploy.yml` |
| Linting | ESLint (`eslint:recommended` + `react`, `react-hooks`) | `npm run lint` |

---

## Language & naming

| Context | Convention |
|---------|-----------|
| Code, comments, identifiers | English |
| Commit messages | English, present tense |
| Components | PascalCase file + export (`ChessBoard.jsx`) |
| Utility modules | camelCase file, named exports (`placement.js`) |
| CSS classes | kebab-case, component-scoped prefix where useful (`.board-square`) |
| localStorage keys | prefixed `kgb.` (e.g. `kgb.users`, `kgb.settings`) |

---

## Git conventions

```bash
# Feature work
git add <relevant files only>
git commit -m "feat(exercises): add Super Moves coordinate entry"

# Bug fix
git add <relevant files only>
git commit -m "fix(board): prevent two pieces occupying the same square"

# Styling / theme
git add <relevant files only>
git commit -m "style(theme): apply retro amber accent to status bar"

# Configuration / deploy
git add <relevant files only>
git commit -m "config(pages): add GitHub Actions deploy workflow"

# Documentation
git add <relevant files only>
git commit -m "docs(todo): check off Phase 2 exercise engines"
```

**Commit types:** feat, fix, style, config, refactor, test, docs, chore
**Format:** `type(scope): description in present tense, lowercase`
**Scopes:** board, piece, exercises, state, screens, menu, stats, leaderboard,
help, custom, theme, storage, pages, deploy, docs

**Rule:** Never `git add -A` / `git add .` blindly — review `git status` first.
Never commit `node_modules/` or `dist/` (already in `.gitignore`).

---

## Task completion checklist

Run before checking off any task in `TODO.md`:

### Correctness
- [ ] Feature matches the relevant section of `prompt.txt`
- [ ] No console errors/warnings in dev mode
- [ ] `npm run build` succeeds

### Code quality
- [ ] No unused imports or variables
- [ ] Game logic lives in `src/game/` or `src/utils/`, not inlined in components
- [ ] `npm run lint` passes (or pre-existing warnings only)

### Accessibility
- [ ] Interactive elements have labels and visible focus states
- [ ] Keyboard-only flow works for the feature
- [ ] Important state changes are announced via the ARIA live region

### Persistence
- [ ] Any new persisted data goes through `src/utils/storage.js`
- [ ] Schema additions are backward-compatible with existing saved data (or a
      migration/default is provided)

### Git
- [ ] Committed after this logical unit of work
- [ ] Commit message follows `type(scope): description`
- [ ] No `node_modules/`, `dist/`, or secrets staged

---

## Project file structure

```
chess-flash-trainer-v2/
├── CLAUDE.md
├── SECURITY.md
├── TODO.md
├── README.md
├── LICENSE.md                  ← third-party asset attribution (chess piece SVGs)
├── prompt.txt                  ← original feature spec
├── index.html
├── vite.config.js
├── package.json
├── .github/workflows/deploy.yml
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── context/                ← global state (users, settings, game FSM)
    ├── components/              ← ChessBoard, Piece, pieceGraphics (CC BY-SA - see LICENSE.md), MenuBar, Modal, Toast, ...
    ├── screens/                 ← PersonalData, GameScreen, Statistics, ...
    ├── game/                    ← config, levels, placement, movement, scoring
    ├── utils/                   ← storage.js, statsAggregation.js
    └── styles/                  ← global.css (retro theme)
```

---

_KGB's Secrets — CLAUDE.md_
_Read this file first — always._
