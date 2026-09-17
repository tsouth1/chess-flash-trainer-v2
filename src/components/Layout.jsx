import React from 'react'
import MenuBar from './MenuBar.jsx'
import Toast from './Toast.jsx'
import LiveRegion from './LiveRegion.jsx'

function Layout({ children }) {
  return (
    <div className="app-shell">
      <MenuBar />
      <main className="screen">{children}</main>
      <Toast />
      <LiveRegion />
    </div>
  )
}

export default Layout
