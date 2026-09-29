/*
  context/ToastContext.jsx — Lightweight Toast Notification System

  WHY A CUSTOM TOAST CONTEXT?
  Instead of importing heavy external packages (like react-toastify or react-hot-toast),
  we build a simple 40-line Context provider.
  - Keeps bundle size tiny
  - Easy to explain in interviews ("I built a lightweight React context for notifications instead of adding another npm dependency")
*/

import { createContext, useContext, useState } from 'react'

const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null) // { message, type: 'success' | 'error' | 'info' }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    // Auto dismiss after 3 seconds
    setTimeout(() => {
      setToast(null)
    }, 3000)
  }

  const hideToast = () => setToast(null)

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce-in">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white transition-all ${
              toast.type === 'error'
                ? 'bg-red-600'
                : toast.type === 'info'
                ? 'bg-blue-600'
                : 'bg-emerald-600'
            }`}
          >
            <span>
              {toast.type === 'error' ? '⚠️' : toast.type === 'info' ? 'ℹ️' : '✅'}
            </span>
            <span>{toast.message}</span>
            <button
              onClick={hideToast}
              className="ml-2 opacity-70 hover:opacity-100 font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
