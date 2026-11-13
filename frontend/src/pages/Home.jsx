import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, BookOpen, GraduationCap, Heart, Upload, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import noteService from '../services/noteService';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal';
import EditNoteModal from '../components/EditNoteModal';
import EmptyState from '../components/ui/EmptyState';
import SectionHeading from '../components/ui/SectionHeading';
import Skeleton from '../components/ui/Skeleton';
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

  useEffect(() => { fetchMyContent(); }, []);

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await noteService.deleteNote(id);
      setMyNotes((previous) => previous.filter((note) => note.id !== id));
      toast.success('Note deleted successfully');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const totalLikes = myNotes.reduce((total, note) => total + (note.likes_count || 0), 0);

  return (
    <div className="space-y-12 pb-12">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="glass relative overflow-hidden rounded-3xl p-6 sm:p-9 lg:p-12"
      >
        <div className="pointer-events-none absolute -right-20 -top-32 h-72 w-72 rounded-full bg-blue-500/[0.08] blur-3xl" />
        <div className="relative flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/[0.07] px-3 py-1.5 text-xs font-medium text-blue-200">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" /> Your study space
            </p>
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
              Welcome back, <span className="text-blue-300">{user?.username?.split(' ')[0] || 'Scholar'}.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
              Keep your study materials close, and discover notes shared by students in your community.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/create" className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium"><Upload className="h-4 w-4" /> Upload notes</Link>
              <Link to="/explore" className="glass inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/[0.07]">Explore notes <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
          <div className="grid w-full max-w-sm grid-cols-2 gap-3 lg:w-72">
            <StatTile icon={BookOpen} label="Your notes" value={myNotes.length} />
            <StatTile icon={Heart} label="Likes received" value={totalLikes} tone="rose" />
            {user?.university && (
              <div className="col-span-2 flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.035] p-4">
                <GraduationCap className="h-4 w-4 shrink-0 text-blue-300" />
                <div className="min-w-0"><p className="text-[11px] text-slate-500">University</p><p className="truncate text-sm font-medium text-slate-200">{user.university}</p></div>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      <section>
        <SectionHeading
          title="Recent uploads"
          description="Your latest notes, ready when you need them."
          action={<Link to="/profile" className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white">View all <ArrowRight className="h-4 w-4" /></Link>}
        />
        <div className="mt-5">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2].map((item) => <Skeleton key={item} className="h-60 rounded-2xl" />)}
            </div>
          ) : myNotes.length ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {myNotes.slice(0, 3).map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  isOwnNote={Boolean(user && user.user === note.user)}
                  onEdit={(item) => { setEditingNote(item); setIsEditNoteOpen(true); }}
                  onDelete={handleDeleteNote}
                  onClick={(item) => { setSelectedNote(item); setIsModalOpen(true); }}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="Your library starts here"
              description="Upload your first course note and make it easier to find next time you study."
              action={<Link to="/create" className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium"><Upload className="h-4 w-4" /> Upload a note</Link>}
            />
          )}
        </div>
      </section>

      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        note={selectedNote}
        onEdit={(note) => { setIsModalOpen(false); setEditingNote(note); setIsEditNoteOpen(true); }}
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

const StatTile = ({ icon: Icon, label, value, tone = 'blue' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView || typeof value !== 'number') return;
    let frame;
    const start = performance.now();
    const duration = 650;
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setCount(Math.round(value * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  return (
    <div ref={ref} className="rounded-xl border border-white/[0.07] bg-white/[0.035] p-4">
      <span className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg ${tone === 'rose' ? 'bg-rose-500/10 text-rose-300' : 'bg-blue-500/10 text-blue-300'}`}><Icon className="h-4 w-4" /></span>
      <p className="text-2xl font-semibold tracking-tight text-white">{typeof value === 'number' ? count : value}</p>
      <p className="mt-1 text-[11px] text-slate-500">{label}</p>
    </div>
  );
};

export default Home;
