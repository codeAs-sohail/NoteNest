import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, BookOpen, GraduationCap, X, Network, Sparkles } from 'lucide-react';
import noteService from '../services/noteService';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal';
import EditNoteModal from '../components/EditNoteModal';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';
import Button from '../components/ui/Button';

const Explore = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ title: '', university: '', subject: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditNoteOpen, setIsEditNoteOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const { user } = useAuth();

  // ── Liked state persisted in localStorage ──
  const getLikedIds = () => {
    try { return new Set(JSON.parse(localStorage.getItem('notenest_liked') || '[]')); }
    catch { return new Set(); }
  };
  const saveLikedIds = (ids) => {
    localStorage.setItem('notenest_liked', JSON.stringify([...ids]));
  };

  const applyLikedState = (notesList) => {
    const liked = getLikedIds();
    return notesList.map(n => ({ ...n, is_liked: liked.has(n.id) }));
  };

  const fetchNotes = async (activeFilters = filters) => {
    setLoading(true);
    try {
      const data = await noteService.getExploreNotes(activeFilters);
      // Stamp each note with is_liked from localStorage
      setNotes(applyLikedState(data.results || []));
    } catch (error) {
      toast.error('Failed to load the archive');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchNotes();
  };

  const clearFilters = () => {
    const emptyFilters = { title: '', university: '', subject: '' };
    setFilters(emptyFilters);
    fetchNotes(emptyFilters);
  };

  const handleLike = async (id) => {
    try {
      await noteService.likeNote(id);

      // The backend toggles: if a like existed, it deletes it (unlike) and returns the old record.
      // If no like existed, it creates one and returns the new record.
      // We can tell which happened by checking if the record still exists in DB:
      // After the POST, the backend returns the like object in BOTH cases.
      // The definitive way: check localStorage for current state and flip it.
      const liked = getLikedIds();
      const wasLiked = liked.has(id);
      const nowLiked = !wasLiked;

      // Update localStorage
      if (nowLiked) { liked.add(id); } else { liked.delete(id); }
      saveLikedIds(liked);

      // Update notes array
      setNotes(prev => prev.map(n => n.id === id ? {
        ...n,
        is_liked: nowLiked,
        likes_count: nowLiked ? (n.likes_count || 0) + 1 : Math.max((n.likes_count || 1) - 1, 0)
      } : n));

      // Sync the modal's note if open
      setSelectedNote(prev => prev?.id === id ? {
        ...prev,
        is_liked: nowLiked,
        likes_count: nowLiked ? (prev.likes_count || 0) + 1 : Math.max((prev.likes_count || 1) - 1, 0)
      } : prev);
    } catch (error) {
      toast.error('Registration required to interact');
    }
  };


  const handleDeleteNote = async (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      await noteService.deleteNote(id);
      setNotes(prev => prev.filter(n => n.id !== id));
      toast.success('Note deleted from archive');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };


  return (
    <div className="space-y-8 lg:space-y-12 pb-12 w-full">
      
      {/* Header & Search Command Bar */}
      <div className="glass-strong sticky top-[76px] z-30 flex flex-col gap-6 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <Network className="h-6 w-6 text-blue-300" />
               <h1 className="text-3xl font-semibold leading-none tracking-[-0.035em] text-white sm:text-4xl">Explore notes</h1>
            </div>
            <p className="ml-9 text-sm text-slate-400 sm:text-base">Find useful material shared by students.</p>
          </div>
          
          <form onSubmit={handleSearch} className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search by title..." 
                aria-label="Search notes by title"
                className="input-premium h-11 w-full rounded-xl pl-10 pr-3.5 text-sm placeholder:text-slate-600 md:w-80"
                value={filters.title}
                onChange={(e) => setFilters({ ...filters, title: e.target.value })}
              />
            </div>
            <button 
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              aria-label={showFilters ? 'Hide filters' : 'Show filters'}
              aria-expanded={showFilters}
              className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${showFilters ? 'border-blue-400/30 bg-blue-500/10 text-blue-200' : 'border-white/10 bg-white/[0.03] text-slate-400 hover:text-white'}`}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
            <button type="submit" className="btn-primary h-11 rounded-xl px-5 text-sm font-medium">
               Search
            </button>
          </form>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-6 mt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" /> University
                    </label>
                    <input 
                      type="text" placeholder="E.g. Harvard..." 
                      className="input-premium w-full rounded-xl px-3.5 py-3 text-sm placeholder:text-slate-600"
                      value={filters.university} onChange={(e) => setFilters({ ...filters, university: e.target.value })}
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> Subject
                    </label>
                    <input 
                      type="text" placeholder="E.g. Physics..." 
                      className="input-premium w-full rounded-xl px-3.5 py-3 text-sm placeholder:text-slate-600"
                      value={filters.subject} onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                    />
                 </div>
                 <div className="md:col-span-2 flex justify-end gap-4 mt-2">
                    <button type="button" onClick={clearFilters} className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:text-white">Clear all</button>
                    <button type="button" onClick={() => fetchNotes()} className="btn-primary rounded-xl px-5 py-2.5 text-sm font-medium">Apply filters</button>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Grid */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-400">{loading ? 'Updating results…' : `${notes.length} ${notes.length === 1 ? 'note' : 'notes'} found`}</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).filter(([, value]) => value.trim()).map(([key, value]) => (
            <span key={key} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-slate-300">
              {value}<button type="button" onClick={() => { const next = { ...filters, [key]: '' }; setFilters(next); fetchNotes(next); }} aria-label={`Clear ${key} filter`}><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((item) => <Skeleton key={item} className="h-60 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {notes.length > 0 ? (
            notes.map(note => (
              <NoteCard 
                 key={note.id} 
                 note={note} 
                 onLike={handleLike} 
                 isOwnNote={user && user.user === note.user}
                 onEdit={(n) => { setEditingNote(n); setIsEditNoteOpen(true); }}
                 onDelete={handleDeleteNote}
                 onClick={(n) => { setSelectedNote(n); setIsModalOpen(true); }} 
              />
            ))

          ) : (
            <EmptyState className="col-span-full" icon={Sparkles} title="No notes match your search" description="Try a different title, university, or subject—or clear the filters to see everything." action={<Button onClick={clearFilters}>Clear filters</Button>} />
          )}
        </div>
      )}
      
      <NoteModal 
         isOpen={isModalOpen} 
         onClose={() => setIsModalOpen(false)} 
         note={selectedNote} 
         onLike={handleLike}
         onEdit={(n) => { setIsModalOpen(false); setEditingNote(n); setIsEditNoteOpen(true); }}
         onDelete={(id) => { setIsModalOpen(false); handleDeleteNote(id); }}
      />

      <EditNoteModal
         isOpen={isEditNoteOpen}
         note={editingNote}
         onClose={() => { setIsEditNoteOpen(false); setEditingNote(null); }}
         onUpdated={() => {
            setIsEditNoteOpen(false);
            setEditingNote(null);
            fetchNotes(); // Refresh Archive
         }}
      />

    </div>
  );
};

export default Explore;
