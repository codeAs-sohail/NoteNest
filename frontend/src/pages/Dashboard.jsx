import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Plus, Search, Trash2, Edit3, X, Download, School, Calendar, BookOpen, Heart, Loader2, Save, UploadCloud, AlertTriangle, User } from 'lucide-react'
import api from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
import { downloadPdf } from '../utils/downloadPdf.js'
import toast from 'react-hot-toast'

// ─── Edit Modal ──────────────────────────────────────────────────────────────
function EditModal({ note, onClose, onSaved }) {
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
      fd.append('university', form.university || '')
      if (pdfFile) fd.append('pdf_file', pdfFile)
      const res = await api.put(`notes/${note.id}/`, fd)
      
      if (res.data && res.data.error) {
        setError(typeof res.data.error === 'string' ? res.data.error : 'Failed to update note.')
        setLoading(false)
        return
      }

      toast.success('Note updated successfully!')
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
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-xl bg-[#0f172a] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
        >
          <div className="flex items-center justify-between px-8 pt-8 pb-5 border-b border-white/5">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2"><Edit3 className="w-5 h-5 text-indigo-400" /> Edit Note</h2>
              <p className="text-slate-500 text-sm mt-0.5">Update your note details</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="mx-8 mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Title</label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input name="title" value={form.title} onChange={handleChange} required placeholder="E.g. Data Structures Chapter 3"
                  className="w-full bg-[#060c1c] border border-white/5 text-white placeholder-slate-600 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-medium" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Subject</label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input name="subject" value={form.subject} onChange={handleChange} required placeholder="Physics"
                    className="w-full bg-[#060c1c] border border-white/5 text-white placeholder-slate-600 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-medium" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">University</label>
                <div className="relative">
                  <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input name="university" value={form.university} onChange={handleChange} placeholder="Optional"
                    className="w-full bg-[#060c1c] border border-white/5 text-white placeholder-slate-600 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-medium" />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} required placeholder="What does this note cover..."
                className="w-full bg-[#060c1c] border border-white/5 text-white placeholder-slate-600 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-medium resize-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Replace PDF <span className="text-slate-600 normal-case">(optional)</span></label>
              <label className={`block border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${pdfFile ? 'border-teal-500/30 bg-teal-500/5' : 'border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.02]'}`}>
                <input type="file" accept=".pdf" className="hidden" onChange={(e) => setPdfFile(e.target.files[0] || null)} />
                {pdfFile ? (
                  <div className="flex items-center justify-center gap-2 text-teal-400 text-sm font-bold"><UploadCloud className="w-4 h-4" /> {pdfFile.name}</div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-slate-500 text-sm"><UploadCloud className="w-4 h-4" /> Click to upload</div>
                )}
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 font-bold text-sm hover:bg-white/5 transition-all">Cancel</button>
              <button type="submit" disabled={loading}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-black text-sm transition-all shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ note, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const res = await api.delete(`notes/${note.id}/`)
      if (res.data && res.data.error) {
        toast.error(typeof res.data.error === 'string' ? res.data.error : 'Failed to delete note.')
        setLoading(false)
        return
      }
      toast.success('Note deleted.')
      onDeleted(note.id)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete note.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-md bg-[#0f172a] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Trash2 className="w-7 h-7 text-rose-400" />
          </div>
          <h2 className="text-xl font-black text-white mb-2">Delete Note</h2>
          <p className="text-slate-400 text-sm font-medium mb-8">
            Are you sure you want to delete <strong className="text-white">"{note.title}"</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 font-bold text-sm hover:bg-white/5 transition-all">Cancel</button>
            <button onClick={handleDelete} disabled={loading}
              className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-sm transition-all shadow-[0_0_20px_-5px_rgba(244,63,94,0.4)] flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4" /> Delete</>}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Dashboard Note Card ─────────────────────────────────────────────────────
function DashNoteCard({ note, onEdit, onDelete }) {
  const date = note.created_at
    ? new Date(note.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    : null



  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className="group bg-[#0f172a]/80 backdrop-blur-md rounded-[28px] p-6 border border-white/5 hover:border-indigo-500/30 transition-all duration-300 flex flex-col h-[300px] shadow-lg hover:shadow-indigo-500/10"
    >
      {/* Top */}
      <div className="flex justify-between items-start mb-3">
        <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-indigo-500/20">
          {note.subject || 'General'}
        </span>
        {date && <span className="text-[11px] text-slate-500 font-medium">{date}</span>}
      </div>

      {/* Body */}
      <div className="flex-1">
        <h3 className="text-lg font-black text-white leading-snug mb-2 line-clamp-2">{note.title}</h3>
        {note.description && <p className="text-sm text-slate-400 line-clamp-2 mt-1 font-medium">{note.description}</p>}
        
        <div className="space-y-1.5 mt-3">
          {note.university && (
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
              <School className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">{note.university}</span>
            </div>
          )}
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Heart className="w-3 h-3 text-rose-400" /> {note.likes_count || 0}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Download className="w-3 h-3 text-teal-400" /> {note.download_count || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-4 mt-auto border-t border-white/5 flex items-center gap-2">
        {note.pdf_file && (
          <button onClick={() => downloadPdf(note.pdf_file, note.title || 'Note', note.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-xl text-indigo-300 text-xs font-bold hover:from-indigo-500/20 hover:to-violet-500/20 transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] active:scale-95">
            <Download className="w-3.5 h-3.5" /> Download
          </button>
        )}
        <button onClick={() => onEdit(note)}
          className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/20 rounded-xl transition-all">
          <Edit3 className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onDelete(note)}
          className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 rounded-xl transition-all">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const displayName = user?.username?.trim() || user?.email?.trim() || 'there'

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
      const res = await api.get('notes/all/')
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

  useEffect(() => { fetchNotes() }, [fetchNotes])

  const handleSaved = (updated) => setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)))
  const handleDeleted = (id) => setNotes((prev) => prev.filter((n) => n.id !== id))

  const filtered = notes.filter(
    (n) =>
      n.title?.toLowerCase().includes(search.toLowerCase()) ||
      n.subject?.toLowerCase().includes(search.toLowerCase()) ||
      n.description?.toLowerCase().includes(search.toLowerCase())
  )

  const totalDownloads = notes.reduce((acc, n) => acc + (n.download_count || 0), 0)
  const totalLikes = notes.reduce((acc, n) => acc + (n.likes_count || 0), 0)

  return (
    <div className="space-y-10 pb-20 w-full">
      
      {/* Hero Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-[#0f172a] to-[#0a1128] border border-white/5 p-8 lg:p-12 shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-[20px] bg-gradient-to-tr from-indigo-500 to-fuchsia-500 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-500/20 shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">{displayName}</span>
              </h1>
              <p className="text-slate-400 font-medium text-lg mt-2">Here's your NoteNest workspace overview.</p>
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link to="/create" className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)] active:scale-95">
              <Plus className="w-4 h-4" /> New Note
            </Link>
            <Link to="/profile" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all">
              <User className="w-4 h-4" /> Profile
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div 
        initial="hidden" animate="show" 
        variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard icon={<FileText className="w-5 h-5" />} label="Total Notes" value={notes.length} color="indigo" />
        <StatCard icon={<Download className="w-5 h-5" />} label="Downloads" value={totalDownloads} color="teal" />
        <StatCard icon={<Heart className="w-5 h-5" />} label="Likes" value={totalLikes} color="rose" />
        <StatCard icon={<BookOpen className="w-5 h-5" />} label="Subjects" value={new Set(notes.map((n) => n.subject).filter(Boolean)).size} color="violet" />
      </motion.div>

      {/* Notes Section */}
      <div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-indigo-500/20 rounded-xl">
              <FileText className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">My Notes</h2>
              {!loading && <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">{filtered.length} record{filtered.length !== 1 ? 's' : ''} found</p>}
            </div>
          </div>

          {notes.length > 0 && (
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes…"
                className="w-full bg-[#060c1c] border border-white/5 text-white placeholder-slate-600 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-medium"
              />
            </div>
          )}
        </div>

        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
            <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Loading your notes…</span>
          </div>
        ) : fetchError ? (
          <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center gap-4">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span className="text-rose-300 font-medium">{fetchError}</span>
            <button onClick={fetchNotes} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-bold text-xs hover:bg-white/10 transition-all">Retry</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.length === 0 ? (
              <div className="col-span-full">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-[#0f172a]/50 border border-white/5 rounded-[40px] p-16 text-center backdrop-blur-md">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">{notes.length === 0 ? '📭' : '🔍'}</span>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">{notes.length === 0 ? 'No notes yet' : 'No results found'}</h3>
                  <p className="text-slate-400 font-medium max-w-sm mx-auto mb-8">
                    {notes.length === 0
                      ? 'Create your first note and start sharing knowledge!'
                      : `No notes match "${search}". Try a different search.`}
                  </p>
                  {notes.length === 0 && (
                    <Link to="/create" className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-4 rounded-2xl font-black text-white hover:scale-105 transition-all shadow-[0_0_30px_-5px_rgba(99,102,241,0.4)]">
                      <Plus className="w-5 h-5" /> Create First Note
                    </Link>
                  )}
                </motion.div>
              </div>
            ) : (
              filtered.map((note) => (
                <DashNoteCard key={note.id} note={note} onEdit={setEditingNote} onDelete={setDeletingNote} />
              ))
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {editingNote && <EditModal note={editingNote} onClose={() => setEditingNote(null)} onSaved={handleSaved} />}
      {deletingNote && <DeleteModal note={deletingNote} onClose={() => setDeletingNote(null)} onDeleted={handleDeleted} />}
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
const colorMap = {
  indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400', glow: 'group-hover:shadow-indigo-500/10' },
  teal:   { bg: 'bg-teal-500/10',   border: 'border-teal-500/20',   text: 'text-teal-400',   glow: 'group-hover:shadow-teal-500/10' },
  rose:   { bg: 'bg-rose-500/10',   border: 'border-rose-500/20',   text: 'text-rose-400',   glow: 'group-hover:shadow-rose-500/10' },
  violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400', glow: 'group-hover:shadow-violet-500/10' },
}

function StatCard({ icon, label, value, color = 'indigo' }) {
  const c = colorMap[color]
  return (
    <motion.div 
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      className={`group bg-[#0f172a]/60 backdrop-blur-md p-6 rounded-[24px] border border-white/5 hover:border-white/10 hover:bg-white/[0.03] transition-all duration-300 shadow-lg ${c.glow}`}
    >
      <div className={`w-11 h-11 rounded-xl ${c.bg} ${c.border} border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <span className={c.text}>{icon}</span>
      </div>
      <p className="text-3xl font-black text-white mb-1">{value}</p>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
    </motion.div>
  )
}
