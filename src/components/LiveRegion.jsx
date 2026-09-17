import React from 'react'
import { useApp } from '../context/AppContext.jsx'

/**
 * Shared ARIA live region. Game engines and screens call `announce(message)`
 * from AppContext rather than managing their own live regions, so assistive
 * tech users get a single consistent stream of game-state announcements.
 */
function LiveRegion() {
  const { liveMessage } = useApp()
  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {liveMessage}
    </div>
  )
}

export default LiveRegion
