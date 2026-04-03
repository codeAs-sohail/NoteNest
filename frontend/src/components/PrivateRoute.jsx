import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function PrivateRoute({ children }) {
  const { isAuthenticated, ready } = useAuth()
  const location = useLocation()

  if (!ready) {
    return (
      <div className="page page--centered">
        <p className="muted">Loading…</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
