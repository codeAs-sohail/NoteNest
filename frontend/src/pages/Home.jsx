import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, BookOpen, GraduationCap, Users, Loader2, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import noteService from '../services/noteService';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal';
import EditNoteModal from '../components/EditNoteModal';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Home = () => {
  const { user } = useAuth();
  const [myNotes, setMyNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditNoteOpen, setIsEditNoteOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const fetchMyContent = async () => {
    setLoading(true);
    try {
      const data = await noteService.getAllNotes();
      setMyNotes(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Could not sync your dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyContent();
  }, []);

  const handleDeleteNote = async (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      await noteService.deleteNote(id);
      setMyNotes(prev => prev.filter(n => n.id !== id));
      toast.success('Note deleted successfully');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };


  const totalLikes = myNotes.reduce((acc, curr) => acc + (curr.likes_count || 0), 0);

  // Quick animations
  const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
  const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };

  return (
    <div className="space-y-12 pb-12 w-full">
      
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-[#0f172a] to-[#0a1128] border border-white/5 p-8 lg:p-14 text-white shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-600/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 mb-6">
              <div className="bg-white/5 backdrop-blur-xl p-2 rounded-xl border border-white/10">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="font-black text-xs uppercase tracking-[0.2em] text-indigo-300">Live Dashboard</span>
            </motion.div>
            
            <h2 className="text-5xl lg:text-7xl font-black tracking-tighter mb-6 leading-[1.1]">
              Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">{user?.username?.split(' ')[0] || 'Scholar'}.</span>
            </h2>
            
            <p className="text-xl text-slate-400 font-medium leading-relaxed mb-10 max-w-2xl">
              Your research on <span className="text-white font-bold">{user?.university || 'Academic Excellence'}</span> is gaining traction. Stay ahead by collaborating with the top minds globally.
            </p>
            
            <div className="flex flex-wrap gap-4">
               <Link to="/explore" className="bg-white text-indigo-900 px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:scale-[1.02] transition-all shadow-xl shadow-white/10 active:scale-95">
                  Explore Network <ArrowRight className="w-5 h-5" />
               </Link>
            </div>
          </div>

          {/* Quick Glace Abstract card */}
          <div className="hidden lg:flex flex-col gap-4 w-72 shrink-0">
             <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center mb-4 shadow-lg shadow-rose-500/20">
                   <Zap className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-black text-white">{totalLikes}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Community Impacts</p>
             </div>
          </div>
        </div>
      </motion.section>

      {/* Stats Cards */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <StatCard icon={<BookOpen className="text-indigo-400" />} label="Your Notes" value={`${myNotes.length} Notes`} />
         <StatCard icon={<GraduationCap className="text-violet-400" />} label="University" value={user?.university?.substring(0, 15) || 'Global'} />
         <StatCard icon={<Users className="text-fuchsia-400" />} label="Year" value={user?.year || '2025'} />
      </motion.div>

      {/* Mini Profile Feed */}
      <div className="pt-8">
         <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-black text-white tracking-tight flex items-center gap-4">
               <span className="w-2h-8 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-full"></span>
               Recent Uploads
            </h3>
            <Link to="/profile" className="text-indigo-400 font-bold text-sm hover:text-indigo-300 transition-colors uppercase tracking-widest flex items-center gap-2">
               Manage All <ArrowRight className="w-4 h-4" />
            </Link>
         </div>

         {loading ? (
            <div className="flex justify-center py-20">
               <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
            </div>
         ) : myNotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {myNotes.slice(0, 3).map(note => (
                  <NoteCard 
                     key={note.id} 
                     note={note} 
                     isOwnNote={user && user.user === note.user} 
                     onEdit={(n) => { setEditingNote(n); setIsEditNoteOpen(true); }}
                     onDelete={handleDeleteNote}
                     onClick={(n) => { setSelectedNote(n); setIsModalOpen(true); }} 
                  />
                ))}
            </div>
         ) : (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-[#0f172a]/50 border border-white/5 rounded-[40px] p-20 text-center backdrop-blur-md shadow-2xl"
            >
               <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                 <BookOpen className="w-10 h-10 text-slate-500" />
               </div>
               <h3 className="text-2xl font-black text-white mb-2">No notes yet</h3>
               <p className="text-slate-400 font-medium max-w-sm mx-auto mb-8">You haven't uploaded any notes yet. Share your knowledge with other students.</p>
               <Link to="/create" className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-4 rounded-2xl font-black text-white hover:scale-105 transition-all shadow-[0_0_30px_-5px_rgba(99,102,241,0.4)]">
                 <Sparkles className="w-5 h-5" /> Upload Your First Note
               </Link>
            </motion.div>
         )}
      </div>

      <NoteModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        note={selectedNote} 
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
            fetchMyContent();
         }}
      />

    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="bg-[#0f172a] p-6 rounded-[32px] border border-white/5 flex items-center gap-5 hover:bg-white/5 transition-colors">
     <div className="p-4 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
        {icon}
     </div>
     <div>
       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
       <p className="text-2xl font-black text-white">{value}</p>
     </div>
  </motion.div>
);

export default Home;
