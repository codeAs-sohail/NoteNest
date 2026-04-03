import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const { showToast } = useToast()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const successMsg = location.state?.message

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/Login/', { username, email, password })
      const access = data.access
      const refresh = data.refresh
      if (!access || !refresh) {
        setError('Invalid response from server.')
        return
      }
      login(access, refresh, { username, email })
      showToast('Logged in successfully.', 'success')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        'Login failed. Please try again.'
      setError(typeof msg === 'string' ? msg : 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page page--centered">
      <div className="card card--narrow">
        <h1 className="card__title">Sign in</h1>
        {successMsg ? <p className="banner banner--success">{successMsg}</p> : null}
        {error ? <p className="banner banner--error">{error}</p> : null}
        <form onSubmit={handleSubmit} className="form" noValidate>
          <label className="field">
            <span className="field__label">Username</span>
            <input
              className="input"
              type="text"
              name="username"
              autoComplete="username"
              placeholder="Your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span className="field__label">Email</span>
            <input
              className="input"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span className="field__label">Password</span>
            <input
              className="input"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>
        <p className="card__footer">
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  )
}
