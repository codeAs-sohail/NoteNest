import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, kind = 'success', duration = 3000) => {
    setToast({ message, kind })
    window.setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current))
    }, duration)
  }, [])

  const clearToast = useCallback(() => setToast(null), [])

  const value = useMemo(() => ({ toast, showToast, clearToast }), [toast, showToast, clearToast])
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

