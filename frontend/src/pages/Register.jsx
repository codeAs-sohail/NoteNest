import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios.js'
import { useToast } from '../context/ToastContext.jsx'

const YEARS = ['2020', '2021', '2022', '2023', '2024', '2025', '2026']

function mapFieldErrors(data) {
  if (!data || typeof data !== 'object') return {}
  const out = {}
  for (const [key, val] of Object.entries(data)) {
    if (Array.isArray(val) && val.length) out[key] = val.join(' ')
    else if (typeof val === 'string') out[key] = val
    else if (val && typeof val === 'object') out[key] = JSON.stringify(val)
  }
  return out
}

export default function Register() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  
  const [form, setForm] = useState({
    username: '',
    university: '',
    year: '2025',
    bio: '',
    email: '',
    password: '',
  })
  
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const errCls = (name) => (fieldErrors[name] ? 'input--error' : '')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFieldErrors({})
    setFormError('')
    setLoading(true)
    try {
      await api.post('/Register/', form)
      showToast('Account created! Please sign in. 🎉', 'success')
      navigate('/login', { replace: true, state: { message: 'Registration successful! Please sign in.' } })
    } catch (err) {
      const data = err.response?.data
      if (data?.error && typeof data.error === 'string') {
        setFormError(data.error)
      } else if (data && typeof data === 'object' && !data.detail) {
        setFieldErrors(mapFieldErrors(data))
      } else {
        setFormError(typeof data?.detail === 'string' ? data.detail : 'Registration failed. Please check your inputs.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page page--centered page--auth">
      <div className="card card--auth" style={{ maxWidth: '520px' }}>
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

        <h1 className="auth-card__title">Create Account</h1>
        <p className="auth-card__sub">Join NoteNest to start sharing and managing your notes</p>

        {formError && (
          <div className="banner banner--error" style={{ marginBottom: '1.5rem' }}>
            ⚠️ {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form" noValidate>
          <div className="row-2">
            <div className="field">
              <label className="field__label">Username</label>
              <input
                className={`input ${errCls('username')}`}
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                required
                maxLength={100}
              />
              {fieldErrors.username && <span className="field__error">{fieldErrors.username}</span>}
            </div>
            <div className="field">
              <label className="field__label">Email</label>
              <input
                className={`input ${errCls('email')}`}
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                maxLength={70}
              />
              {fieldErrors.email && <span className="field__error">{fieldErrors.email}</span>}
            </div>
          </div>

          <div className="row-2">
            <div className="field">
              <label className="field__label">University</label>
              <input
                className={`input ${errCls('university')}`}
                name="university"
                placeholder="Your university"
                value={form.university}
                onChange={handleChange}
                required
                maxLength={100}
              />
              {fieldErrors.university && <span className="field__error">{fieldErrors.university}</span>}
            </div>
            <div className="field">
              <label className="field__label">Year</label>
              <select
                className={`input ${errCls('year')}`}
                name="year"
                value={form.year}
                onChange={handleChange}
                required
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              {fieldErrors.year && <span className="field__error">{fieldErrors.year}</span>}
            </div>
          </div>

          <div className="field">
            <label className="field__label">Bio</label>
            <textarea
              className={`input input--textarea ${errCls('bio')}`}
              name="bio"
              placeholder="Tell us a bit about yourself…"
              value={form.bio}
              onChange={handleChange}
              maxLength={200}
              rows={3}
            />
            {fieldErrors.bio && <span className="field__error">{fieldErrors.bio}</span>}
          </div>

          <div className="field">
            <label className="field__label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className={`input ${errCls('password')}`}
                type={showPass ? 'text' : 'password'}
                name="password"
                placeholder="Secure password"
                value={form.password}
                onChange={handleChange}
                required
                maxLength={8}
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
            <span style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
              Max 8 characters (server limit)
            </span>
            {fieldErrors.password && <span className="field__error">{fieldErrors.password}</span>}
          </div>

          <button type="submit" className="btn btn--primary btn--block btn--lg" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? <><span className="spinner" /> Creating account…</> : '🚀 Create Account'}
          </button>
        </form>

        <p className="auth-card__footer">
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 700, color: 'var(--primary2)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
