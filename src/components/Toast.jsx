import React from 'react'
import { useApp } from '../context/AppContext.jsx'
import './Toast.css'

function Toast() {
  const { toasts, dismissToast } = useApp()
  if (toasts.length === 0) return null

  return (
    <div className="toast-stack" role="status" aria-live="off">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.tone}`}>
          <span>{t.message}</span>
          <button type="button" className="toast__close" aria-label="Dismiss notification" onClick={() => dismissToast(t.id)}>
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

export default Toast
