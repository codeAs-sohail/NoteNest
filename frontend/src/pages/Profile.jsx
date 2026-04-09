import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
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

export default function Profile() {
  const { user, syncUserProfile, logout } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const userId = user?.user_id ?? null

  const [form, setForm] = useState({
    username: user?.username || '',
    university: '',
    year: '',
    bio: '',
    email: user?.email || '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [banner, setBanner] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const errCls = (name) => (fieldErrors[name] ? 'input--error' : '')
  const canUpdate = useMemo(() => Boolean(userId), [userId])

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  useEffect(() => {
    setForm((p) => ({
      ...p,
      username: user?.username ?? p.username,
      email: user?.email ?? p.email,
    }))
  }, [user?.username, user?.email])

  const handleUpdate = async (e) => {
    e.preventDefault()
    setFieldErrors({})
    setBanner(null)
    setUpdating(true)
    try {
      if (!canUpdate) {
        setBanner({ kind: 'error', message: 'Session user is missing. Please log in again.' })
        return
      }
      const payload = {
        user: userId,
        username: form.username,
        university: form.university,
        year: form.year,
        bio: form.bio,
        email: form.email,
      }
      const res = await api.put('/Profile/', payload)
      syncUserProfile({ username: payload.username, email: payload.email })
      showToast(res.data?.message || 'Profile updated successfully!', 'success')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const data = err.response?.data
      if (data?.error && typeof data.error === 'string') {
        setBanner({ kind: 'error', message: data.error })
      } else if (data && typeof data === 'object') {
        const mapped = mapFieldErrors(data)
        if (Object.keys(mapped).length) setFieldErrors(mapped)
        else setBanner({ kind: 'error', message: 'Update failed. Please check your inputs.' })
      } else {
        setBanner({ kind: 'error', message: 'Update failed. Please try again.' })
      }
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    setBanner(null)
    try {
      const res = await api.delete('/Profile/')
      showToast(res.data?.message || 'Profile deleted.', 'success')
      logout()
    } catch (err) {
      setBanner({
        kind: 'error',
        message: err.response?.data?.error || 'Delete failed. Please try again.',
      })
      setShowDeleteConfirm(false)
    } finally {
      setDeleting(false)
    }
  }

  const initials = (user?.username || user?.email || 'U').charAt(0).toUpperCase()

  return (
    <div className="page" style={{ maxWidth: '720px', margin: '0 auto', paddingTop: '2rem' }}>
      {/* Profile Header Card */}
      <div className="profile-header">
        <div className="profile-avatar-big">{initials}</div>
        <div className="profile-info">
          <div className="profile-info__name">{user?.username || '—'}</div>
          <div className="profile-info__email">{user?.email || '—'}</div>
          <div className="profile-info__badge">✅ Authenticated</div>
        </div>
      </div>

      {/* Update Form */}
      <div className="form-card" style={{ marginBottom: '1.25rem' }}>
        <h2 className="form-card__title">✏️ Update Profile</h2>

        {banner && (
          <div className={`banner ${banner.kind === 'success' ? 'banner--success' : 'banner--error'}`} style={{ marginBottom: '1.25rem' }}>
            {banner.kind === 'error' ? '⚠️' : '✅'} {banner.message}
          </div>
        )}

        <form onSubmit={handleUpdate} className="form" noValidate>
          <div className="row-2">
            <div className="field">
              <label className="field__label">Username</label>
              <input
                className={`input ${errCls('username')}`}
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                maxLength={100}
                placeholder="Username"
              />
              {fieldErrors.username && <span className="field__error">{fieldErrors.username}</span>}
            </div>
            <div className="field">
              <label className="field__label">Email</label>
              <input
                className={`input ${errCls('email')}`}
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                maxLength={70}
                placeholder="you@example.com"
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
                value={form.university}
                onChange={handleChange}
                maxLength={100}
                placeholder="Your university"
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
              >
                <option value="">Select year</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
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
              value={form.bio}
              onChange={handleChange}
              maxLength={200}
              placeholder="Tell us a bit about yourself…"
              rows={3}
            />
            {fieldErrors.bio && <span className="field__error">{fieldErrors.bio}</span>}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => navigate('/dashboard')}
              style={{ flex: 1 }}
            >
              ← Back
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={updating}
              style={{ flex: 2 }}
            >
              {updating ? <><span className="spinner" /> Updating…</> : '💾 Update Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div
        className="form-card"
        style={{ borderColor: 'rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.04)' }}
      >
        <h2 className="form-card__title" style={{ color: 'var(--danger)' }}>⚠️ Danger Zone</h2>
        <p style={{ color: 'var(--text2)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
          Deleting your profile is permanent and cannot be undone. All your notes and data will be removed.
        </p>

        {!showDeleteConfirm ? (
          <button
            type="button"
            className="btn btn--danger"
            onClick={() => setShowDeleteConfirm(true)}
          >
            🗑️ Delete My Profile
          </button>
        ) : (
          <div
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '1.25rem',
            }}
          >
            <p style={{ color: '#fca5a5', fontWeight: 600, marginBottom: '1rem', fontSize: '0.92rem' }}>
              Are you absolutely sure? This action is irreversible.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn btn--ghost"
                onClick={() => setShowDeleteConfirm(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                className="btn btn--danger"
                onClick={handleDelete}
                disabled={deleting}
                style={{ flex: 1, background: 'var(--danger)', color: '#fff' }}
              >
                {deleting ? <><span className="spinner" /> Deleting…</> : 'Yes, Delete Everything'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
