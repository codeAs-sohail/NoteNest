import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

// ─── Edit Modal ──────────────────────────────────────────────────────────────
function EditModal({ note, onClose, onSaved }) {
  const { showToast } = useToast()
  const [form, setForm] = useState({
    title: note.title || '',
    description: note.description || '',
    subject: note.subject || '',
    university: note.university || '',
  })
  const [pdfFile, setPdfFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!form.title.trim() || !form.description.trim() || !form.subject.trim()) {
      setError('Title, description and subject are required.')
      return
    }
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('description', form.description)
      fd.append('subject', form.subject)
      const res = await api.put(`notes/${note.id}/`, fd)
      
      if (res.data && res.data.error) {
        setError(typeof res.data.error === 'string' ? res.data.error : 'Failed to update note.')
        setLoading(false)
        return
      }

      showToast('Note updated successfully!', 'success')
      onSaved(res.data)
      onClose()
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          'Failed to update note. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal__header">
          <h2 className="modal__title">✏️ Edit Note</h2>
          <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {error && <div className="banner banner--error" style={{ marginBottom: '1rem' }}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <div className="row-2">
            <div className="field">
              <label className="field__label">Title <span className="req">*</span></label>
              <input
                className="input"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Note title"
                required
              />
            </div>
            <div className="field">
              <label className="field__label">Subject <span className="req">*</span></label>
              <input
                className="input"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="E.g. Computer Science"
                required
              />
            </div>
          </div>

          <div className="field">
            <label className="field__label">University</label>
            <input
              className="input"
              name="university"
              value={form.university}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>

          <div className="field">
            <label className="field__label">Description <span className="req">*</span></label>
            <textarea
              className="input input--textarea"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe what these notes cover…"
              rows={4}
              required
            />
          </div>

          <div className="field">
            <label className="field__label">Replace PDF <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.7rem 1rem',
                background: 'rgba(255,255,255,0.04)',
                border: '1px dashed var(--border2)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                color: 'var(--text2)',
                fontSize: '0.88rem',
              }}
            >
              📎{' '}
              {pdfFile ? (
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>{pdfFile.name}</span>
              ) : (
                <span>Click to pick a new PDF</span>
              )}
              <input
                type="file"
                accept=".pdf"
                style={{ display: 'none' }}
                onChange={(e) => setPdfFile(e.target.files[0] || null)}
              />
            </label>
          </div>

          <div className="confirm-btns">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? <><span className="spinner" /> Saving…</> : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ note, onClose, onDeleted }) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const res = await api.delete(`notes/${note.id}/`)
      
      if (res.data && res.data.error) {
        showToast(typeof res.data.error === 'string' ? res.data.error : 'Failed to delete note.', 'error')
        setLoading(false)
        return
      }

      showToast('Note deleted.', 'success')
      onDeleted(note.id)
      onClose()
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to delete note.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '400px' }}>
        <div className="modal__header">
          <h2 className="modal__title">🗑️ Delete Note</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        <p style={{ color: 'var(--text2)', fontSize: '0.93rem', lineHeight: 1.6 }}>
          Are you sure you want to delete{' '}
          <strong style={{ color: 'var(--text)' }}>"{note.title}"</strong>? This action cannot be undone.
        </p>
        <div className="confirm-btns">
          <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn--danger" onClick={handleDelete} disabled={loading}>
            {loading ? <><span className="spinner" /> Deleting…</> : '🗑️ Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Note Card ───────────────────────────────────────────────────────────────
function NoteCard({ note, onEdit, onDelete }) {
  const date = note.created_at
    ? new Date(note.created_at).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null

  const pdfUrl = note.pdf_file
    ? note.pdf_file.startsWith('http')
      ? note.pdf_file
      : `http://localhost:8000${note.pdf_file}`
    : null

  return (
    <div className="note-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <span className="note-card__badge">📚 {note.subject}</span>
        {date && (
          <span style={{ fontSize: '0.72rem', color: 'var(--muted)', flexShrink: 0 }}>{date}</span>
        )}
      </div>

      <div>
        <h3 className="note-card__title">{note.title}</h3>
        {note.description && (
          <p className="note-card__desc" style={{ marginTop: '0.4rem' }}>{note.description}</p>
        )}
      </div>

      <div className="note-card__meta">
        {note.university && (
          <span className="note-card__meta-item">
            <span className="note-card__meta-icon">🏫</span>
            {note.university}
          </span>
        )}
        <span className="note-card__meta-item">
          <span className="note-card__meta-icon">⬇️</span>
          {note.download_count ?? 0} downloads
        </span>
      </div>

      <div className="note-card__actions" style={{ flexDirection: 'column', gap: '0.75rem' }}>
        {pdfUrl && (
          <a 
            href={pdfUrl} 
            download
            target="_blank" 
            rel="noreferrer" 
            className="btn btn--accent btn--block"
            title="Download your note"
          >
            📥 Download Note
          </a>
        )}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn--ghost btn--sm"
            style={{ flex: 1 }}
            onClick={() => onEdit(note)}
          >
            ✏️ Edit
          </button>
          <button
            className="btn btn--danger btn--sm"
            style={{ flex: 1 }}
            onClick={() => onDelete(note)}
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const displayName = user?.username?.trim() || user?.email?.trim() || 'there'
  const initials = displayName.charAt(0).toUpperCase()

  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  const [editingNote, setEditingNote] = useState(null)
  const [deletingNote, setDeletingNote] = useState(null)

  const [search, setSearch] = useState('')

  const fetchNotes = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const res = await api.get('notesall/')
      // Handle the backend error payload pattern
      if (res.data && res.data.error) {
        setFetchError(res.data.error)
        setNotes([])
        return
      }
      setNotes(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      if (err.response?.status === 404) {
        setNotes([])
      } else {
        setFetchError('Failed to load notes. Please refresh.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  // Optional: Function to call backend to increment download count
  // const incrementDownload = async (id) => {
  //   try { await api.post(`/notes/${id}/download/`) } catch(e){}
  // }

  const handleSaved = (updated) => {
    setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)))
  }
  const handleDeleted = (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  const filtered = notes.filter(
    (n) =>
      n.title?.toLowerCase().includes(search.toLowerCase()) ||
      n.subject?.toLowerCase().includes(search.toLowerCase()) ||
      n.description?.toLowerCase().includes(search.toLowerCase())
  )

  const totalDownloads = notes.reduce((acc, n) => acc + (n.download_count || 0), 0)

  return (
    <div className="page" style={{ paddingTop: '2rem' }}>
      {/* Hero */}
      <div className="dash-hero">
        <div>
          <h1 className="dash-hero__greeting">
            Welcome back, <span>{displayName}</span> 👋
          </h1>
          <p className="dash-hero__sub">Here's an overview of your NoteNest workspace.</p>
        </div>
        <div className="dash-actions">
          <Link to="/add-note" className="btn btn--primary btn--lg">
            ✏️ New Note
          </Link>
          <Link to="/profile" className="btn btn--ghost btn--lg">
            👤 Profile
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card stat-card--primary">
          <div className="stat-card__icon">📝</div>
          <div className="stat-card__label">Total Notes</div>
          <div className="stat-card__value">{notes.length}</div>
        </div>
        <div className="stat-card stat-card--accent">
          <div className="stat-card__icon">⬇️</div>
          <div className="stat-card__label">Total Downloads</div>
          <div className="stat-card__value">{totalDownloads}</div>
        </div>
        <div className="stat-card stat-card--warning">
          <div className="stat-card__icon">📚</div>
          <div className="stat-card__label">Subjects</div>
          <div className="stat-card__value">
            {new Set(notes.map((n) => n.subject).filter(Boolean)).size}
          </div>
        </div>
        <div className="stat-card stat-card--success">
          <div className="stat-card__icon">🏫</div>
          <div className="stat-card__label">Universities</div>
          <div className="stat-card__value">
            {new Set(notes.map((n) => n.university).filter(Boolean)).size}
          </div>
        </div>
      </div>

      {/* Notes section */}
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h2 className="section-title">📂 My Notes</h2>
          {!loading && <span className="section-count">{filtered.length}</span>}
        </div>

        {/* Search */}
        {notes.length > 0 && (
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }}>🔍</span>
            <input
              className="input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes…"
              style={{ paddingLeft: '2.25rem', width: '220px' }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="loader-page">
          <div className="spinner" />
          <span>Loading your notes…</span>
        </div>
      ) : fetchError ? (
        <div className="banner banner--error" style={{ justifyContent: 'center', padding: '1.5rem' }}>
          ⚠️ {fetchError}
          <button className="btn btn--ghost btn--sm" onClick={fetchNotes} style={{ marginLeft: '1rem' }}>
            Retry
          </button>
        </div>
      ) : (
        <div className="notes-grid">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">
                {notes.length === 0 ? '📭' : '🔍'}
              </div>
              <h3 className="empty-state__title">
                {notes.length === 0 ? 'No notes yet' : 'No results found'}
              </h3>
              <p className="empty-state__desc">
                {notes.length === 0
                  ? 'Create your first note and start sharing knowledge!'
                  : `No notes match "${search}". Try a different search.`}
              </p>
              {notes.length === 0 && (
                <Link to="/add-note" className="btn btn--primary btn--lg">
                  ✏️ Create First Note
                </Link>
              )}
            </div>
          ) : (
            filtered.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={setEditingNote}
                onDelete={setDeletingNote}
              />
            ))
          )}
        </div>
      )}

      {/* Modals */}
      {editingNote && (
        <EditModal
          note={editingNote}
          onClose={() => setEditingNote(null)}
          onSaved={handleSaved}
        />
      )}
      {deletingNote && (
        <DeleteModal
          note={deletingNote}
          onClose={() => setDeletingNote(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  )
}
