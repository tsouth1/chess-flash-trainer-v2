import React from 'react'
import { useApp, VIEWS } from '../context/AppContext.jsx'

function ExitScreen() {
  const { navigate } = useApp()
  return (
    <div>
      <h1>Exit</h1>
      <div className="panel">
        <p>
          KGB&rsquo;s Secrets runs entirely in your browser, so it can&rsquo;t close the browser window or tab for
          you - browsers intentionally don&rsquo;t allow web pages to do that.
        </p>
        <p>You can safely close this tab yourself, or head back to Personal Data to keep training.</p>
        <div className="btn-row">
          <button type="button" className="btn btn-primary" onClick={() => navigate(VIEWS.PERSONAL_DATA)}>
            Back to Personal Data
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExitScreen
