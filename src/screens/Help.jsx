import React from 'react'

function Help() {
  return (
    <div>
      <h1>Help</h1>

      <div className="panel">
        <h2>Starting a game</h2>
        <p>
          From Personal Data, select or create a username, then click Start Game. Pick an exercise and a level
          (or open Custom... for a one-off configuration), then click Start on the game screen.
        </p>
      </div>

      <div className="panel">
        <h2>Memorizing piece positions</h2>
        <p>
          Study the board carefully during the memorizing phase. Click OK once you&rsquo;re confident - some
          exercises give you a fixed window, others let you continue whenever you&rsquo;re ready.
        </p>
      </div>

      <div className="panel">
        <h2>Dragging and placing pieces</h2>
        <p>
          Drag a piece from the tray (or the board) onto a square to place it. Prefer the keyboard or a screen
          reader? Click or press Enter/Space on a piece to select it, then click or press Enter/Space on a
          square to place it there.
        </p>
      </div>

      <div className="panel">
        <h2>How each exercise works</h2>
        <ul>
          <li>
            <strong>Statics</strong> - memorize the board, then rebuild the exact same arrangement from an empty board.
          </li>
          <li>
            <strong>Transposition</strong> - memorize the board, watch it change once, then reconstruct the
            <em> original</em> arrangement (not the changed one).
          </li>
          <li>
            <strong>Flashes</strong> - watch the board repeatedly reshuffle and click OK the instant it matches
            the original layout again.
          </li>
          <li>
            <strong>Moves</strong> <em>(advanced)</em> - memorize the board, read a list of how each piece moves, then
            place every piece on its calculated new square.
          </li>
          <li>
            <strong>Super Moves</strong> <em>(advanced)</em> - like Moves, but after reading the move list the board
            never reappears - you must choose each piece&rsquo;s new coordinate (e.g. E4) from memory.
          </li>
        </ul>
      </div>

      <div className="panel">
        <h2>How levels work</h2>
        <p>
          Levels 1-5 increase board size, piece count, and movement difficulty. Completing a level with a perfect
          placement unlocks the next one. Level 1 is always unlocked.
        </p>
      </div>

      <div className="panel">
        <h2>How statistics work</h2>
        <p>
          Every completed attempt is recorded for your current user: score, success/failure, and time taken.
          The Statistics screen aggregates this into totals, averages, best results per exercise, and recent
          history. You can clear your statistics at any time.
        </p>
      </div>

      <div className="panel">
        <h2>How Custom mode works</h2>
        <p>
          Custom... (advanced edition) lets you configure a one-off game: exercise type, board size, piece count,
          colors, memorization time, flash speed/count, movement difficulty, and whether coordinates are shown.
          Custom Properties... instead changes your <em>permanent</em> defaults used everywhere else.
        </p>
      </div>

      <div className="panel">
        <h2>Board coordinates</h2>
        <p>
          Columns are lettered A onward, left to right. Rows are numbered starting at 1 nearest the bottom of the
          board, increasing upward - e.g. the bottom-left square of an 8x8 board is A1, the top-right is H8.
        </p>
      </div>

      <div className="panel">
        <h2>Keyboard and accessibility controls</h2>
        <ul>
          <li>Tab / Shift+Tab moves focus between pieces, squares, and buttons.</li>
          <li>Enter or Space selects a piece, and Enter or Space on a square places the selected piece there.</li>
          <li>All important state changes (phase, results) are announced to screen readers automatically.</li>
          <li>Correctness is always shown with both color and text/icons, never color alone.</li>
        </ul>
      </div>

      <div className="panel">
        <h2>About</h2>
        <p>
          <strong>KGB&rsquo;s Secrets</strong> is a memory and concentration training game inspired by classic
          chessboard-based brain-training exercises. It runs entirely in your browser - no account, no server,
          no tracking. Your progress is saved locally on this device.
        </p>
      </div>
    </div>
  )
}

export default Help
