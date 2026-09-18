# Third-Party Asset Licenses

KGB's Secrets is otherwise original code (no separate project-wide license
has been declared yet). This file covers the one third-party creative asset
used in the app and the attribution required for it.

---

## Chess piece graphics

**File:** `src/components/pieceGraphics.jsx`

The chess piece artwork rendered on the board (king/queen/rook/bishop/
knight/pawn, white and black) is the standard chess piece SVG set originally
published on Wikimedia Commons.

- **Source:** Wikimedia Commons, "Category:SVG chess pieces"
  https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces
  (specific file reference: https://commons.wikimedia.org/w/index.php?curid=1499810)
- **Original author:** Colin M.L. Burnett ("Cburnett" on Wikimedia Commons / Wikipedia)
- **License:** Creative Commons Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0)
  https://creativecommons.org/licenses/by-sa/3.0/

### Required attribution

> Chess piece graphics from Wikimedia Commons.
> Original author: Colin M.L. Burnett (Cburnett)
> License: CC BY-SA 3.0 Unported <https://creativecommons.org/licenses/by-sa/3.0/>
> Modifications: outline (stroke) color of the black piece set adjusted for
> contrast against this app's dark board theme. No other changes.

### Note on the license version

The Cburnett SVG chess set, and the copy of it this project's artwork was
adapted from (the React port in `Clariity/react-chessboard`, whose own
`src/pieces.tsx` carries this exact credit inline), is licensed **CC BY-SA
3.0 Unported**, not 4.0 - that's the version stated in the source file and
corroborated by other projects that redistribute this same set. If a
specific derivative of this artwork encountered elsewhere on Wikimedia
Commons is separately licensed under CC BY-SA 4.0 by another contributor,
its own credit line would be:

> Sunny3113, CC BY-SA 4.0 <https://creativecommons.org/licenses/by-sa/4.0>, via Wikimedia Commons

That tag is included here for completeness in case it applies to a specific
file this project's artwork is later found to trace through, but it is not
the license this project's copy is actually distributed under - see the
"Required attribution" block above for the operative one.

### ShareAlike notice

CC BY-SA's "ShareAlike" term means a derivative of this artwork must itself
be licensed CC BY-SA (3.0 or a later version, at the licensee's choice).
The color modification made in `src/components/pieceGraphics.jsx` is a
derivative for this purpose, so **that file's contents are themselves
licensed CC BY-SA 3.0 Unported** (or later, at your choice), independent of
whatever license, if any, the rest of this project's original code carries.

### React adaptation

The component structure (one function per piece, returning inline SVG) was
adapted from `Clariity/react-chessboard` (https://github.com/Clariity/react-chessboard),
an MIT-licensed project - only the Cburnett piece geometry was reused from
it, not any of that project's other MIT-licensed code, and the geometry
itself is CC BY-SA per above regardless of the MIT license on the project it
was copied out of.

---

_KGB's Secrets — LICENSE.md_
