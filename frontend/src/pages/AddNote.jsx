import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

export default function AddNote() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [profileId, setProfileId] = useState('')
  const [profileLoading, setProfileLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subject, setSubject] = useState('')
  const [university, setUniversity] = useState('')
  const [pdfFile, setPdfFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/Profile/')
        if (res.data?.id) setProfileId(res.data.id)
      } catch (err) {
        console.warn('Profile fetch failed:', err?.response?.status)
      } finally {
        setProfileLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'application/pdf') {
      setPdfFile(file)
      setError(null)
    } else {
      setError('Only PDF files are accepted.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!title.trim() || !description.trim() || !subject.trim()) {
      setError('Title, Description and Subject are required.')
      return
    }
    if (!pdfFile) {
      setError('Please attach a PDF file.')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      if (profileId) formData.append('profile_id', profileId)
      formData.append('title', title)
      formData.append('description', description)
      formData.append('subject', subject)
      if (university.trim()) formData.append('university', university)
      formData.append('pdf_file', pdfFile)

      await api.post('/notes/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setSuccess(true)
      showToast('Note created successfully!', 'success')
      setTimeout(() => navigate('/dashboard'), 1400)
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          'Failed to create note. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="add-note-page">
      {/* Header */}
      <div className="page-header">
        <button className="page-header__back" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1 className="page-header__title">📝 Create a Note</h1>
        <p className="page-header__sub">Share your knowledge with the NoteNest community</p>
      </div>

      {/* Author info bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          padding: '1rem 1.25rem',
          background: 'rgba(108,99,255,0.08)',
          border: '1px solid rgba(108,99,255,0.2)',
          borderRadius: 'var(--radius)',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'linear-gradient(135deg,var(--primary),var(--accent))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: '#fff',
              fontSize: '1rem',
              flexShrink: 0,
            }}
          >
            {(user?.username || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Author</div>
            <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>{user?.username || '—'}</div>
          </div>
        </div>
        <div style={{ width: 1, height: 36, background: 'var(--border)', flexShrink: 0 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.3rem' }}>🪪</span>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Profile ID</div>
            <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>
              {profileLoading ? <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Loading…</span> : `#${profileId || '—'}`}
            </div>
          </div>
        </div>
      </div>

      {/* Banners */}
      {error && (
        <div className="banner banner--error" style={{ marginBottom: '1.25rem' }}>
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="banner banner--success" style={{ marginBottom: '1.25rem' }}>
          ✅ Note created! Redirecting to dashboard…
        </div>
      )}

      {/* Form */}
      <div className="form-card">
        <form onSubmit={handleSubmit} className="form">
          <div className="row-2">
            <div className="field">
              <label className="field__label">
                Title <span className="req">*</span>
              </label>
              <input
                id="note-title"
                className="input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g. Database Design Notes"
                maxLength={100}
                required
              />
            </div>
            <div className="field">
              <label className="field__label">
                Subject <span className="req">*</span>
              </label>
              <input
                id="note-subject"
                className="input"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="E.g. Computer Science"
                maxLength={100}
                required
              />
            </div>
          </div>

          <div className="field">
            <label className="field__label">University <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
            <input
              id="note-university"
              className="input"
              type="text"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              placeholder="E.g. MIT, Stanford…"
              maxLength={100}
            />
          </div>

          <div className="field">
            <label className="field__label">
              Description <span className="req">*</span>
            </label>
            <textarea
              id="note-description"
              className="input input--textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summarise what these notes cover…"
              rows={4}
              required
            />
          </div>

          {/* PDF Drop Zone */}
          <div className="field">
            <label className="field__label">
              PDF File <span className="req">*</span>
            </label>
            <div
              className={`upload-zone ${dragOver ? 'upload-zone--active' : ''} ${pdfFile ? 'upload-zone--selected' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('pdf_input').click()}
            >
              <input
                id="pdf_input"
                type="file"
                accept=".pdf"
                style={{ display: 'none' }}
                onChange={(e) => {
                  setPdfFile(e.target.files[0] || null)
                  setError(null)
                }}
              />
              {pdfFile ? (
                <>
                  <div className="upload-zone__icon">📄</div>
                  <p className="upload-zone__filename">{pdfFile.name}</p>
                  <p className="upload-zone__hint">
                    {(pdfFile.size / 1024 / 1024).toFixed(2)} MB — click to change
                  </p>
                </>
              ) : (
                <>
                  <div className="upload-zone__icon">☁️</div>
                  <p className="upload-zone__text">
                    Drag & drop your PDF here, or <span className="upload-zone__browse">browse</span>
                  </p>
                  <p className="upload-zone__hint">Only .pdf files are accepted</p>
                </>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--lg btn--block"
            disabled={loading || success}
          >
            {loading ? (
              <><span className="spinner" /> Creating…</>
            ) : (
              '🚀 Create Note'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
