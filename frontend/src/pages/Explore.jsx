import { useEffect, useState, useCallback, useMemo } from 'react'
import api from '../api/axios.js'
import { Link } from 'react-router-dom'

function ExploreNoteCard({ note }) {
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
    <div className="note-card animate-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <span className="note-card__badge">📚 {note.subject}</span>
        {date && (
          <span style={{ fontSize: '0.72rem', color: 'var(--muted)', flexShrink: 0 }}>{date}</span>
        )}
      </div>

      <div style={{ margin: '0.85rem 0', flex: 1 }}>
        <h3 className="note-card__title">{note.title}</h3>
        {note.description && (
          <p className="note-card__desc" style={{ marginTop: '0.6rem' }}>{note.description}</p>
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

      <div className="note-card__actions" style={{ marginTop: '1.5rem' }}>
        {pdfUrl ? (
          <a 
            href={pdfUrl} 
            download 
            target="_blank" 
            rel="noreferrer" 
            className="btn btn--accent btn--block"
            title="Download this note directly"
          >
            📥 Download Note
          </a>
        ) : (
          <button className="btn btn--ghost btn--block" disabled>Download Unavailable</button>
        )}
      </div>
    </div>
  )
}

export default function Explore() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Three search fields
  const [filters, setFilters] = useState({
    title: '',
    university: '',
    subject: ''
  })

  const fetchExploreNotes = useCallback(async (currentFilters = filters) => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (currentFilters.title) params.title = currentFilters.title
      if (currentFilters.university) params.university = currentFilters.university
      if (currentFilters.subject) params.subject = currentFilters.subject

      const res = await api.get('notesexplore/', { params })
      
      if (res.data && res.data.error) {
        setError(res.data.error)
        setNotes([])
        return
      }

      setNotes(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      if (err.response?.status === 404) {
        setNotes([])
      } else {
        setError('Failed to fetch community notes. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchExploreNotes()
  }, []) // Initial load once

  const handleSearch = (e) => {
    e.preventDefault()
    fetchExploreNotes()
  }

  const handleClear = () => {
    const cleared = { title: '', university: '', subject: '' }
    setFilters(cleared)
    fetchExploreNotes(cleared)
  }

  return (
    <div className="page" style={{ paddingTop: '2.5rem' }}>
      <div className="dash-hero" style={{ marginBottom: '3.5rem', textAlign: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '800px' }}>
          <h1 className="dash-hero__greeting" style={{ fontSize: '2.8rem' }}>
            The <span>Note Vault</span> 🌍
          </h1>
          <p className="dash-hero__sub" style={{ fontSize: '1.15rem', marginTop: '0.85rem' }}>
            High-quality study materials shared by users across the world. 
            Download whatever you need for your university journey.
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem', marginBottom: '3rem' }}>
        <form onSubmit={handleSearch}>
          <div className="section-header" style={{ marginBottom: '1.5rem' }}>
            <h2 className="section-title">🔍 Discover Notes</h2>
            {!loading && <span className="section-count">{notes.length} results</span>}
          </div>
          
          <div className="search-grid">
            <div className="field">
              <label className="field__label">Note Title</label>
              <input
                className="input"
                value={filters.title}
                onChange={(e) => setFilters({ ...filters, title: e.target.value })}
                placeholder="Math, AI, Physics..."
              />
            </div>
            <div className="field">
              <label className="field__label">University</label>
              <input
                className="input"
                value={filters.university}
                onChange={(e) => setFilters({ ...filters, university: e.target.value })}
                placeholder="University name..."
              />
            </div>
            <div className="field">
              <label className="field__label">Subject</label>
              <input
                className="input"
                value={filters.subject}
                onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                placeholder="Software Eng, History..."
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn--primary" style={{ flex: 2 }}>
                Search
              </button>
              <button type="button" className="btn btn--ghost" onClick={handleClear} style={{ flex: 1 }}>
                Reset
              </button>
            </div>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="loader-page">
          <div className="spinner" />
          <span style={{ marginTop: '1rem', fontWeight: 500 }}>Scanning the community vault...</span>
        </div>
      ) : error ? (
        <div className="banner banner--error" style={{ justifyContent: 'center', padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ marginBottom: '1rem' }}>⚠️ {error}</p>
            <button className="btn btn--ghost btn--sm" onClick={() => fetchExploreNotes()}>
              🔄 Retry Fetch
            </button>
          </div>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.length === 0 ? (
            <div className="empty-state" style={{ padding: '6rem 2rem' }}>
              <div className="empty-state__icon">🌌</div>
              <h3 className="empty-state__title">We found nothing</h3>
              <p className="empty-state__desc" style={{ maxWidth: '400px', margin: '0.5rem auto 2rem' }}>
                No notes match your current search criteria. Try using broader keywords or clearing your filters.
              </p>
              <button className="btn btn--ghost" onClick={handleClear}>
                Clear All Search Criteria
              </button>
            </div>
          ) : (
            notes.map((note) => (
              <ExploreNoteCard key={note.id} note={note} />
            ))
          )}
        </div>
      )}
    </div>
  )
}


