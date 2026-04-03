import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios.js'
import { useToast } from '../context/ToastContext.jsx'

const YEARS = ['2020', '2021', '2022', '2023', '2024', '2025']

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

  const errCls = (name) => (fieldErrors[name] ? 'input--error' : '')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFieldErrors({})
    setFormError('')
    setLoading(true)
    try {
      await api.post('/Register/', form)
      showToast('Registration completed. Please sign in.', 'success')
      navigate('/login', { replace: true })
    } catch (err) {
      const data = err.response?.data
      if (data?.error && typeof data.error === 'string') setFormError(data.error)
      else if (data && typeof data === 'object' && !data.detail) setFieldErrors(mapFieldErrors(data))
      else setFormError(typeof data?.detail === 'string' ? data.detail : 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page page--centered">
      <div className="card">
        <h1 className="card__title">Create account</h1>
        {formError ? <p className="banner banner--error">{formError}</p> : null}
        <form onSubmit={handleSubmit} className="form" noValidate>
          <label className="field">
            <span className="field__label">Username</span>
            <input
              className={`input ${errCls('username')}`}
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
              required
              maxLength={100}
            />
            {fieldErrors.username ? <span className="field__error">{fieldErrors.username}</span> : null}
          </label>
          <label className="field">
            <span className="field__label">University</span>
            <input
              className={`input ${errCls('university')}`}
              name="university"
              placeholder="Your university"
              value={form.university}
              onChange={(e) => setForm((p) => ({ ...p, university: e.target.value }))}
              required
              maxLength={100}
            />
            {fieldErrors.university ? <span className="field__error">{fieldErrors.university}</span> : null}
          </label>
          <label className="field">
            <span className="field__label">Year</span>
            <select
              className={`input ${errCls('year')}`}
              name="year"
              value={form.year}
              onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))}
              required
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            {fieldErrors.year ? <span className="field__error">{fieldErrors.year}</span> : null}
          </label>
          <label className="field">
            <span className="field__label">Bio</span>
            <textarea
              className={`input input--textarea ${errCls('bio')}`}
              name="bio"
              placeholder="Short bio"
              value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              maxLength={200}
              rows={3}
            />
            {fieldErrors.bio ? <span className="field__error">{fieldErrors.bio}</span> : null}
          </label>
          <label className="field">
            <span className="field__label">Email</span>
            <input
              className={`input ${errCls('email')}`}
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              required
              maxLength={70}
            />
            {fieldErrors.email ? <span className="field__error">{fieldErrors.email}</span> : null}
          </label>
          <label className="field">
            <span className="field__label">Password</span>
            <input
              className={`input ${errCls('password')}`}
              type="password"
              name="password"
              placeholder="Up to 8 characters (per server)"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              required
              maxLength={8}
            />
            {fieldErrors.password ? <span className="field__error">{fieldErrors.password}</span> : null}
          </label>
          <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>
        <p className="card__footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
