# KGB's Secrets

A retro-styled chessboard memory and concentration training game. Built with React
and Vite, runs entirely client-side (no backend, no accounts), and deploys as a
static site to GitHub Pages.

## What it is

Five memory exercises played on a configurable chessboard with colored, non-chess
pieces:

- **Statics** — memorize a layout, then rebuild it from an empty board.
- **Transposition** — memorize a layout, watch it change once, then restore the
  *original* layout.
- **Flashes** — watch the board repeatedly reshuffle and click OK the instant it
  matches the original layout again.
- **Moves** *(advanced)* — memorize a layout, read how each piece moves, then place
  every piece on its calculated new square.
- **Super Moves** *(advanced)* — like Moves, but the board never reappears after
  the move list; you pick each piece's new coordinate (e.g. `E4`) from memory.

Progress, statistics, achievements, and up to 10 local user profiles are all
stored in your browser's `localStorage` — nothing leaves your device.

See `prompt.txt` for the full original feature spec, `TODO.md` for build status,
`CLAUDE.md` for project conventions, and `SECURITY.md` for the (small) threat model.

## Development

```bash
npm install
npm run dev       # start the dev server
npm run build      # production build to dist/
npm run preview    # preview the production build locally
npm run lint        # ESLint
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the app
and publishes `dist/` to GitHub Pages via GitHub's official Pages actions. Enable
Pages once, under the repository's **Settings → Pages → Source → GitHub Actions**.

`vite.config.js` sets `base: '/chess-flash-trainer-v2/'` to match this repository's
name — update it together with any repo rename.
