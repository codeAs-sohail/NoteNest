import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
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

export default function Profile() {
  const { user, syncUserProfile } = useAuth()
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

  const errCls = (name) => (fieldErrors[name] ? 'input--error' : '')
  const canUpdate = useMemo(() => Boolean(userId), [userId])

  const handleChange = (name, value) => setForm((p) => ({ ...p, [name]: value }))

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
      const msg = typeof res.data === 'string' ? res.data : res.data?.message
      syncUserProfile({ username: payload.username, email: payload.email })
      showToast(msg || 'Profile updated successfully.', 'success')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const data = err.response?.data
      if (data?.error && typeof data.error === 'string') setBanner({ kind: 'error', message: data.error })
      else if (data && typeof data === 'object') {
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
    if (deleting) return
    const ok = window.confirm('Delete your profile? This cannot be undone.')
    if (!ok) return

    setDeleting(true)
    setBanner(null)
    try {
      const res = await api.delete('/Profile/')
      const msg = typeof res.data === 'string' ? res.data : res.data?.message
      showToast(msg || 'Profile deleted successfully.', 'success')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Delete failed. Please try again.'
      setBanner({ kind: 'error', message: msg })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="page page--centered">
      <div className="card card--narrow">
        <h1 className="card__title">Update / Delete Profile</h1>
        {banner ? (
          <p className={`banner ${banner.kind === 'success' ? 'banner--success' : 'banner--error'}`}>
            {banner.message}
          </p>
        ) : null}

        <form onSubmit={handleUpdate} className="form" noValidate>
          <label className="field">
            <span className="field__label">Username</span>
            <input
              className={`input ${errCls('username')}`}
              value={form.username}
              onChange={(e) => handleChange('username', e.target.value)}
              required
              maxLength={100}
              placeholder="Username"
            />
            {fieldErrors.username ? <span className="field__error">{fieldErrors.username}</span> : null}
          </label>

          <label className="field">
            <span className="field__label">University</span>
            <input
              className={`input ${errCls('university')}`}
              value={form.university}
              onChange={(e) => handleChange('university', e.target.value)}
              required
              maxLength={100}
              placeholder="University"
            />
            {fieldErrors.university ? <span className="field__error">{fieldErrors.university}</span> : null}
          </label>

          <label className="field">
            <span className="field__label">Year</span>
            <select
              className={`input ${errCls('year')}`}
              value={form.year}
              onChange={(e) => handleChange('year', e.target.value)}
              required
            >
              <option value="">Select year</option>
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
              value={form.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              maxLength={200}
              placeholder="Bio (optional)"
              rows={3}
            />
            {fieldErrors.bio ? <span className="field__error">{fieldErrors.bio}</span> : null}
          </label>

          <label className="field">
            <span className="field__label">Email</span>
            <input
              className={`input ${errCls('email')}`}
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
              maxLength={70}
              placeholder="you@example.com"
            />
            {fieldErrors.email ? <span className="field__error">{fieldErrors.email}</span> : null}
          </label>

          <button type="submit" className="btn btn--primary btn--block" disabled={updating}>
            {updating ? 'Updating…' : 'Update Profile'}
          </button>
        </form>

        <button type="button" className="btn btn--danger btn--block" disabled={deleting} onClick={handleDelete}>
          {deleting ? 'Deleting…' : 'Delete Profile'}
        </button>
      </div>
    </div>
  )
}

