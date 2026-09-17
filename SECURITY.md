# SECURITY.md

> This document applies to every contribution to **KGB's Secrets**, human or AI.
> The app is a public, client-side-only static site — the threat model is small,
> but the few rules here exist to keep it that way and to keep the public repo
> and its GitHub Pages deployment safe to point anyone at.

---

## ⚡ Quick reference — absolute rules

```
❌ NEVER commit API keys, tokens, or credentials of any kind — this app needs none
❌ NEVER add a backend, database, or third-party analytics/tracking script
❌ NEVER collect or store anything beyond a player-chosen display name
❌ NEVER use dangerouslySetInnerHTML on player-supplied text (usernames, custom labels)
❌ NEVER fetch remote scripts, fonts, or assets at runtime from untrusted origins
❌ NEVER add a dependency without a clear reason — every package is attack surface
❌ NEVER write real personal data (yours or anyone else's) into commits, code,
   comments, or example data, since this repository is public

✅ ALWAYS let React's default JSX escaping render player-supplied text
✅ ALWAYS validate and clamp numeric input on Custom Properties (board size,
   piece count, timers) before it reaches game logic
✅ ALWAYS keep GitHub Actions workflow permissions scoped to the minimum needed
   (contents: read, pages: write, id-token: write — nothing broader)
✅ ALWAYS pin dependency versions in package.json and review `npm audit` output
   before merging a dependency bump
✅ ALWAYS treat localStorage content as owned by the browser's user, not as a
   trust boundary — never assume its shape without validating on read
```

---

## 1. No backend, no accounts, no secrets

KGB's Secrets is a static bundle of HTML/CSS/JS served from GitHub Pages. There
is no server, no API, no authentication, and therefore nothing to leak that
would require a secret in the first place.

- Never introduce a `.env` file, API key, or webhook URL "for later" — if a
  future feature genuinely needs one, that's a signal to stop and discuss the
  architecture change first, not to quietly add it.
- Never add a login/signup flow. "Users" in this app are just locally-stored
  display names for switching between local save profiles — not accounts.

## 2. Player-supplied data

The only data a player enters is a display name (and, in Custom Properties,
numeric settings). Treat it as untrusted display text:

- Render it through normal JSX interpolation (`{username}`), which escapes it
  automatically. Never use `dangerouslySetInnerHTML` with it.
- Enforce a reasonable max length on usernames (see `src/screens/PersonalData.jsx`)
  so a pathological string can't blow up layout or storage.
- When a username or setting is read back out of `localStorage`, validate its
  shape (string/number/expected range) before using it — a hand-edited or
  corrupted localStorage value should degrade gracefully, not throw.

## 3. localStorage handling

All persistence goes through `src/utils/storage.js`. Rules for that module:

- Wrap every `localStorage.getItem` / `setItem` call in try/catch — private
  browsing, storage quotas, and disabled storage can all throw.
- Namespace every key under the `kgb.` prefix to avoid colliding with anything
  else that might share the origin (unlikely on GitHub Pages, but cheap to do).
- Version the stored schema (a `schemaVersion` field) so a future shape change
  can migrate or safely discard old data instead of crashing on read.
- Never store anything the player didn't explicitly create in-app (no browser
  fingerprinting, no timestamps tied to real-world identity beyond in-game
  session history the player themselves generated).

## 4. Dependencies and supply chain

- Keep the dependency list small and deliberate — `react`, `react-dom`, and the
  Vite toolchain cover this project's needs. Think twice before adding a
  drag-and-drop library, animation library, or UI kit; the spec is achievable
  with plain React state and CSS.
- Pin versions in `package.json` (already done for the initial scaffold) and
  run `npm audit` after any dependency change; resolve high/critical findings
  before merging.
- Don't add `postinstall` scripts or anything that executes arbitrary code
  during `npm install`.

## 5. Build and deploy (GitHub Actions → GitHub Pages)

- The deploy workflow (`.github/workflows/deploy.yml`) should request only the
  permissions it needs: `contents: read`, `pages: write`, `id-token: write`.
  Never widen this without a specific reason.
- The workflow must build from source on every run (`npm ci && npm run build`)
  rather than trusting a pre-built `dist/` committed to the repo — keeps the
  deployed artifact traceable to a specific commit.
- Since the repo is public, assume the entire commit history, including old
  commits, is permanently visible. Never commit something you'd need to purge
  later — it's much easier to keep it out in the first place.

## 6. Error handling

Failures should degrade the game, never crash the tab or corrupt saved data:

```js
// Correct — corrupted/missing data falls back to a safe default
try {
  const raw = localStorage.getItem(STORAGE_KEYS.users)
  return raw ? JSON.parse(raw) : []
} catch {
  return []
}

// NEVER — let a parse error or quota error bubble up and white-screen the app
const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.users))
```

---

_KGB's Secrets — SECURITY.md_
_Small app, small threat model — keep it that way._
