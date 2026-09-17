import React, { useState } from 'react'
import { useApp, VIEWS } from '../context/AppContext.jsx'
import { EXERCISES, isMultiuser } from '../game/config.js'
import './MenuBar.css'

function MenuBar() {
  const { navigate, settings, showToast, setPendingExercise } = useApp()
  const [open, setOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState(null)

  const advancedRequired = (exercise) => {
    const advancedExercises = [EXERCISES.MOVES, EXERCISES.SUPER_MOVES, EXERCISES.CUSTOM]
    if (advancedExercises.includes(exercise) && !settings.advancedEdition) {
      showToast('This mode is only available in the advanced edition. Enable it in Custom Properties.', 'warning')
      return true
    }
    return false
  }

  const chooseExercise = (exercise) => {
    if (advancedRequired(exercise)) return
    setPendingExercise({ exercise })
    if (exercise === EXERCISES.CUSTOM) {
      navigate(VIEWS.CUSTOM_MODE)
    } else {
      navigate(VIEWS.LEVELS)
    }
    closeAll()
  }

  const closeAll = () => {
    setOpen(false)
    setOpenMenu(null)
  }

  const go = (view) => {
    navigate(view)
    closeAll()
  }

  const toggleMenu = (name) => setOpenMenu((current) => (current === name ? null : name))

  return (
    <nav className="menu-bar" aria-label="Main menu">
      <div className="menu-bar__brand">KGB&rsquo;s Secrets</div>

      <button
        type="button"
        className="menu-bar__toggle btn btn-ghost"
        aria-expanded={open}
        aria-controls="menu-bar-links"
        onClick={() => setOpen((v) => !v)}
      >
        Menu
      </button>

      <div id="menu-bar-links" className={`menu-bar__links ${open ? 'menu-bar__links--open' : ''}`}>
        <div className="menu-dropdown">
          <button
            type="button"
            className="btn btn-ghost"
            aria-expanded={openMenu === 'game'}
            onClick={() => toggleMenu('game')}
          >
            Game
          </button>
          {openMenu === 'game' && (
            <ul className="menu-dropdown__list" role="menu">
              <li role="none">
                <button role="menuitem" onClick={() => go(VIEWS.PERSONAL_DATA)}>
                  New
                </button>
              </li>
              <li role="none">
                <button role="menuitem" onClick={() => chooseExercise(EXERCISES.STATICS)}>
                  Statics
                </button>
              </li>
              <li role="none">
                <button role="menuitem" onClick={() => chooseExercise(EXERCISES.TRANSPOSITION)}>
                  Transposition
                </button>
              </li>
              <li role="none">
                <button role="menuitem" onClick={() => chooseExercise(EXERCISES.FLASHES)}>
                  Flashes
                </button>
              </li>
              <li role="none">
                <button role="menuitem" onClick={() => chooseExercise(EXERCISES.MOVES)}>
                  Moves
                </button>
              </li>
              <li role="none">
                <button role="menuitem" onClick={() => chooseExercise(EXERCISES.SUPER_MOVES)}>
                  Super Moves
                </button>
              </li>
              <li role="none">
                <button role="menuitem" onClick={() => chooseExercise(EXERCISES.CUSTOM)}>
                  Custom...
                </button>
              </li>
              <li role="none">
                <button role="menuitem" onClick={() => go(VIEWS.CUSTOM_PROPERTIES)}>
                  Custom Properties...
                </button>
              </li>
              <li role="none">
                <button role="menuitem" onClick={() => go(VIEWS.LEVELS)}>
                  Levels...
                </button>
              </li>
              <li role="none">
                <button role="menuitem" onClick={() => go(VIEWS.STATISTICS)}>
                  Statistics...
                </button>
              </li>
              {isMultiuser() && (
                <li role="none">
                  <button role="menuitem" onClick={() => go(VIEWS.LEADERBOARD)}>
                    Best Intelligencers...
                  </button>
                </li>
              )}
              <li role="none">
                <button role="menuitem" onClick={() => go(VIEWS.EXIT)}>
                  Exit
                </button>
              </li>
            </ul>
          )}
        </div>

        <div className="menu-dropdown">
          <button
            type="button"
            className="btn btn-ghost"
            aria-expanded={openMenu === 'help'}
            onClick={() => toggleMenu('help')}
          >
            Help
          </button>
          {openMenu === 'help' && (
            <ul className="menu-dropdown__list" role="menu">
              <li role="none">
                <button role="menuitem" onClick={() => go(VIEWS.HELP)}>
                  Help
                </button>
              </li>
              <li role="none">
                <button role="menuitem" onClick={() => go(VIEWS.HELP)}>
                  About
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  )
}

export default MenuBar
