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
  const [showPass, setShowPass] = useState(false)
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
      showToast('Logged in successfully! 🎉', 'success')
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
    <div className="page page--centered page--auth">
      <div className="card card--auth" style={{ textAlign: 'left' }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2rem' }}>
          <div
            style={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg,var(--primary),var(--accent))',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              boxShadow: '0 0 20px var(--primary-glow)',
            }}
          >
            📝
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em' }}>NoteNest</span>
        </div>

        <h1 className="auth-card__title">Welcome back</h1>
        <p className="auth-card__sub">Sign in to access your notes dashboard</p>

        {successMsg && (
          <div className="banner banner--success" style={{ marginBottom: '1.25rem' }}>
            ✅ {successMsg}
          </div>
        )}
        {error && (
          <div className="banner banner--error" style={{ marginBottom: '1.25rem' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form" noValidate>
          <div className="field">
            <label className="field__label">Username</label>
            <input
              id="login-username"
              className="input"
              type="text"
              name="username"
              autoComplete="username"
              placeholder="Your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label className="field__label">Email</label>
            <input
              id="login-email"
              className="input"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label className="field__label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                className="input"
                type={showPass ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: '3rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--muted)',
                  fontSize: '1rem',
                  padding: 0,
                }}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button id="login-submit" type="submit" className="btn btn--primary btn--block btn--lg" disabled={loading}>
            {loading ? <><span className="spinner" /> Signing in…</> : '🔑 Sign In'}
          </button>
        </form>

        <p className="auth-card__footer">
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: 700, color: 'var(--primary2)' }}>
            Register free
          </Link>
        </p>
      </div>
    </div>
  )
}
