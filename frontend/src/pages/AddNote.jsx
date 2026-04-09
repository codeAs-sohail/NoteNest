import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

export default function AddNote() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subject, setSubject] = useState('')
  const [university, setUniversity] = useState('')
  const [pdfFile, setPdfFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

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
      formData.append('title', title.trim())
      formData.append('description', description.trim())
      formData.append('subject', subject.trim())
      formData.append('university', university.trim() || '')
      formData.append('pdf_file', pdfFile)

      const res = await api.post('notes/', formData)

      // Backend returns HTTP 200 but includes an 'error' key if it caught an exception
      if (res.data && res.data.error) {
        setError(typeof res.data.error === 'string' ? res.data.error : 'Failed to create note.')
        setLoading(false)
        return
      }

      setSuccess(true)
      showToast('Note created successfully!', 'success')
      setTimeout(() => navigate('/dashboard'), 1200)
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          'Failed to create note. Please check your connection and try again.'
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

      {/* Banners */}

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
