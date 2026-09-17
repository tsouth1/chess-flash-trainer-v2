import React from 'react'
import { AppProvider, useApp, VIEWS } from './context/AppContext.jsx'
import Layout from './components/Layout.jsx'
import PersonalData from './screens/PersonalData.jsx'
import LevelSelection from './screens/LevelSelection.jsx'
import GameScreen from './screens/GameScreen.jsx'
import CustomMode from './screens/CustomMode.jsx'
import CustomProperties from './screens/CustomProperties.jsx'
import Statistics from './screens/Statistics.jsx'
import Leaderboard from './screens/Leaderboard.jsx'
import Help from './screens/Help.jsx'
import ExitScreen from './screens/ExitScreen.jsx'

function Screens() {
  const { view, selectedUser, navigate } = useApp()

  // Every screen except Personal Data requires an active user.
  if (view !== VIEWS.PERSONAL_DATA && !selectedUser) {
    navigate(VIEWS.PERSONAL_DATA)
    return <PersonalData />
  }

  switch (view) {
    case VIEWS.PERSONAL_DATA:
      return <PersonalData />
    case VIEWS.LEVELS:
      return <LevelSelection />
    case VIEWS.GAME:
      return <GameScreen />
    case VIEWS.CUSTOM_MODE:
      return <CustomMode />
    case VIEWS.CUSTOM_PROPERTIES:
      return <CustomProperties />
    case VIEWS.STATISTICS:
      return <Statistics />
    case VIEWS.LEADERBOARD:
      return <Leaderboard />
    case VIEWS.HELP:
      return <Help />
    case VIEWS.EXIT:
      return <ExitScreen />
    default:
      return <PersonalData />
  }
}

function App() {
  return (
    <AppProvider>
      <Layout>
        <Screens />
      </Layout>
    </AppProvider>
  )
}

export default App
