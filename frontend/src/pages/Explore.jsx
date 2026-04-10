import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, Loader2, BookOpen, GraduationCap, X, Network } from 'lucide-react';
import noteService from '../services/noteService';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal';
import EditNoteModal from '../components/EditNoteModal';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

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

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const data = await noteService.getExploreNotes(filters);
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
    setFilters({ title: '', university: '', subject: '' });
    fetchNotes();
  };

  const handleLike = async (id) => {
    try {
      const response = await noteService.likeNote(id);
      const likeData = response.data;

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
      <div className="flex flex-col gap-6 bg-[#0f172a]/50 p-6 lg:p-8 rounded-[40px] border border-white/5 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <Network className="w-8 h-8 text-indigo-400" />
               <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter leading-none">Global Archive</h2>
            </div>
            <p className="text-slate-400 font-medium text-lg ml-11">Search and discover notes from other students.</p>
          </div>
          
          <form onSubmit={handleSearch} className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search by title..." 
                className="w-full bg-[#060c1c] border border-slate-800 text-white placeholder-slate-600 rounded-2xl h-14 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                value={filters.title}
                onChange={(e) => setFilters({ ...filters, title: e.target.value })}
              />
            </div>
            <button 
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`h-14 w-14 flex items-center justify-center rounded-2xl transition-all border ${showFilters ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-[#060c1c] border-slate-800 text-slate-400 hover:text-white'}`}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
            <button type="submit" className="bg-white text-[#060c1c] h-14 px-8 rounded-2xl text-base font-black hover:bg-slate-200 transition-colors shadow-lg">
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
                      className="w-full bg-[#060c1c] border border-slate-800 text-white placeholder-slate-600 rounded-2xl py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium text-sm" 
                      value={filters.university} onChange={(e) => setFilters({ ...filters, university: e.target.value })}
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> Subject
                    </label>
                    <input 
                      type="text" placeholder="E.g. Physics..." 
                      className="w-full bg-[#060c1c] border border-slate-800 text-white placeholder-slate-600 rounded-2xl py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium text-sm" 
                      value={filters.subject} onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                    />
                 </div>
                 <div className="md:col-span-2 flex justify-end gap-4 mt-2">
                    <button type="button" onClick={clearFilters} className="text-slate-400 font-bold hover:text-white transition-colors px-4 text-sm">Clear Filters</button>
                    <button type="button" onClick={fetchNotes} className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-500 hover:text-white transition-all">Apply Filters</button>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center text-slate-500 gap-4">
           <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
           <p className="font-bold text-sm uppercase tracking-widest">Loading notes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
            <div className="col-span-full h-96 flex flex-col items-center justify-center text-center p-12 bg-[#0f172a]/30 rounded-[40px] border border-white/5 backdrop-blur-sm">
               <div className="bg-white/5 p-6 rounded-3xl mb-6 shadow-inner border border-white/5">
                  <X className="w-10 h-10 text-slate-500" />
               </div>
               <h3 className="text-2xl font-black text-white mb-2">No Records Found</h3>
               <p className="text-slate-400 font-medium max-w-sm">Try broadening your search to find more notes.</p>
               <button onClick={clearFilters} className="mt-8 bg-white/5 text-white border border-white/10 px-8 py-3 rounded-2xl font-bold hover:bg-white/10 transition-all text-sm">Clear Search</button>
            </div>
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
