import { useToast } from '../context/ToastContext.jsx'

export default function Toast() {
  const { toast, clearToast } = useToast()
  if (!toast) return null

  return (
    <div className={`toast toast--${toast.kind}`} role="status" aria-live="polite">
      <span>{toast.message}</span>
      <button type="button" className="toast__close" onClick={clearToast} aria-label="Close notification">
        ×
      </button>
    </div>
  )
}

