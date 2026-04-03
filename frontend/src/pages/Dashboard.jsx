import { useAuth } from '../context/AuthContext.jsx'

export default function Dashboard() {
  const { user } = useAuth()
  const displayName = user?.username?.trim() || user?.email?.trim() || 'there'

  return (
    <div className="page page--centered page--top">
      <div className="card card--narrow card--plain">
        <h1 className="card__title">Dashboard</h1>
        <p className="lead">
          Welcome back, <strong>{displayName}</strong>.
        </p>
        <p className="muted">You are signed in with JWT authentication.</p>
      </div>
    </div>
  )
}
