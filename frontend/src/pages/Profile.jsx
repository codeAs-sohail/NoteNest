import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, School, Calendar, FileText, 
  Loader2, ShieldCheck, BookOpen, Heart, X, Edit3, Save, AlertTriangle, Clock, Download, Bell, MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import noteService from '../services/noteService';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal';
import EditNoteModal from '../components/EditNoteModal';
import toast from 'react-hot-toast';
import { parseBackendError } from '../utils/errorHandler';

const Profile = () => {
  const { user, updateProfile, deleteProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [myNotes, setMyNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '', email: '', university: '', year: '2025', bio: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [isEditNoteOpen, setIsEditNoteOpen] = useState(false);
  const [downloads, setDownloads] = useState([]);
  const [loadingDownloads, setLoadingDownloads] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  useEffect(() => {
    const fetchMyNotes = async () => {
      try {
        const data = await noteService.getAllNotes();
        setMyNotes(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error('Failed to load your notes.');
      } finally {
        setLoadingNotes(false);
      }
    };
    const fetchDownloads = async () => {
      try {
        const data = await noteService.getDownloads();
        setDownloads(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load downloads');
      } finally {
        setLoadingDownloads(false);
      }
    };

    const fetchNotifications = async () => {
      try {
        const data = await noteService.getNotifications();
        setNotifications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load notifications');
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchMyNotes();
    fetchDownloads();
    fetchNotifications();
  }, []);

  // Initialize edit form when user data loads or changes
  useEffect(() => {
    if (user) {
      setEditForm({
        username: user.username || '',
        email: user.email || '',
        university: user.university || '',
        year: user.year || '2025',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const totalLikes = myNotes.reduce((acc, curr) => acc + (curr.likes_count || 0), 0);

  const handleDeleteNote = async (id) => {
    try {
      await noteService.deleteNote(id);
      // Optimistic update: remove from UI immediately
      setMyNotes(prev => prev.filter(n => n.id !== id));
      toast.success('Note removed from your collection.');
    } catch (error) {
      toast.error(parseBackendError(error));
    }
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile(editForm);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error(parseBackendError(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteProfile();
      toast.success('Account deleted forever. Goodbye.');
      // Force redirect to login
      window.location.href = '/login';
    } catch (error) {
      toast.error(parseBackendError(error));
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  return (
    <div className="space-y-10 lg:space-y-16 pb-20 w-full">
      
      <motion.section 
        id="overview"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass relative overflow-hidden rounded-3xl p-5 sm:p-8 lg:p-10"
      >
        
        <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start relative z-10 w-full">
          
          {/* Hologram Avatar */}
          <div className="relative shrink-0">
            <div className="w-40 h-40 rounded-3xl bg-gradient-to-br from-[#0a0b0f] to-[#101218] border border-white/10 flex items-center justify-center text-white shadow-2xl relative z-10 overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 z-0 group-hover:scale-110 transition-transform duration-500"></div>
               <span className="text-6xl font-semibold relative z-10 text-blue-200">{user?.username?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-emerald-400 to-teal-500 text-white p-3 rounded-2xl border-4 border-[#101218] z-20 shadow-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="flex-1 w-full text-center lg:text-left space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-4">
              <div>
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-3">
                  <h2 className="text-5xl font-semibold text-white tracking-[-0.03em]">{user?.username}</h2>
                  <span className="bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest border border-blue-500/30 w-fit self-center lg:self-auto shadow-inner">Authenticated</span>
                </div>
                {!isEditing && (
                  <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-2xl">
                    {user?.bio || "Add a short bio to tell other students about your studies."}
                  </p>
                )}
              </div>

              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold transition-all text-sm shrink-0"
                >
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </button>
              ) : (
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={() => { setIsEditing(false); setEditForm(user); }}
                    className="flex items-center justify-center w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-xl font-bold transition-all text-sm shadow-[0_0_20px_-5px_rgba(47,124,255,0.5)]"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                  </button>
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {!isEditing ? (
                <motion.div 
                  key="view-mode"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2"
                >
                  <div className="flex items-center gap-3 text-slate-300 font-medium bg-[#0a0b0f]/50 p-3.5 rounded-2xl border border-white/5">
                    <Mail className="w-5 h-5 text-blue-400" />
                    <span className="text-sm">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300 font-medium bg-[#0a0b0f]/50 p-3.5 rounded-2xl border border-white/5">
                    <School className="w-5 h-5 text-blue-400" />
                    <span className="text-sm">{user?.university || 'Unknown Node'}</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="edit-mode"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4"
                >
                  <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Username</label>
                     <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input name="username" value={editForm.username} onChange={handleEditChange} className="w-full bg-[#0a0b0f]/80 border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" />
                     </div>
                  </div>
                  <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Email</label>
                     <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input name="email" value={editForm.email} onChange={handleEditChange} className="w-full bg-[#0a0b0f]/80 border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" />
                     </div>
                  </div>
                  <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">University</label>
                     <div className="relative">
                        <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input name="university" value={editForm.university} onChange={handleEditChange} className="w-full bg-[#0a0b0f]/80 border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" />
                     </div>
                  </div>
                  <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Class Year</label>
                     <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <select name="year" value={editForm.year} onChange={handleEditChange} className="w-full bg-[#0a0b0f]/80 border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium appearance-none">
                           {['2020', '2021', '2022', '2023', '2024', '2025'].map(y => <option key={y} value={y} className="bg-slate-900">{y}</option>)}
                        </select>
                     </div>
                  </div>
                  <div className="md:col-span-2 space-y-1">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Bio</label>
                     <div className="relative">
                        <FileText className="absolute left-3 top-4 w-4 h-4 text-slate-500" />
                        <textarea name="bio" value={editForm.bio} onChange={handleEditChange} className="w-full bg-[#0a0b0f]/80 border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium min-h-[100px] resize-none" />
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.section>

      <nav aria-label="Profile sections" className="glass sticky top-[76px] z-20 flex gap-1 overflow-x-auto rounded-xl p-1.5">
        {[
          ['overview', 'Overview'],
          ['notes', 'My notes'],
          ['downloads', 'Downloads'],
          ['notifications', 'Notifications'],
          ['settings', 'Settings'],
        ].map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            onClick={() => setActiveTab(id)}
            className={`relative shrink-0 rounded-lg px-3.5 py-2 text-xs font-medium transition sm:text-sm ${activeTab === id ? 'text-white' : 'text-slate-400 hover:text-white'}`}
          >
            {activeTab === id && <motion.span layoutId="profile-tab-active" className="absolute inset-0 rounded-lg border border-white/[0.08] bg-white/[0.06]" />}
            <span className="relative">{label}</span>
          </a>
        ))}
      </nav>

      {/* Telemetry Row */}
      <motion.div variants={{ show: { transition: { staggerChildren: 0.1 } } }} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
         <ProfileStat variants={fadeUp} icon={<BookOpen className="text-blue-400" />} label="Archive" value={myNotes.length} />
         <ProfileStat variants={fadeUp} icon={<Heart className="text-rose-400" />} label="Impact" value={totalLikes} />
         <ProfileStat variants={fadeUp} icon={<Calendar className="text-teal-400" />} label="Class year" value={user?.year || '—'} />
      </motion.div>

      {/* Database View */}
      <div id="notes" className="scroll-mt-28 pt-8">
        <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6">
           <h3 className="text-3xl font-semibold text-white tracking-tight flex items-center gap-4">
              <div className="p-2 bg-blue-500/20 rounded-xl">
                 <FileText className="w-6 h-6 text-blue-400" />
              </div>
              Personal Repository
           </h3>
        </div>

        {loadingNotes ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4">
             <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
             <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Syncing...</span>
          </div>
        ) : myNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {myNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                isOwnNote={true}
                onDelete={handleDeleteNote}
                onEdit={(n) => { setEditingNote(n); setIsEditNoteOpen(true); }}
                onClick={(n) => { setSelectedNote(n); setIsModalOpen(true); }}
              />
            ))}
          </div>
        ) : (
          <div className="bg-[#101218]/40 border border-white/5 rounded-3xl p-16 md:p-24 text-center">
             <div className="w-20 h-20 bg-white/5 flex items-center justify-center rounded-full mx-auto mb-6">
               <FileText className="h-7 w-7 text-slate-400" />
             </div>
             <p className="text-slate-400 font-bold text-xl mb-2">Database Empty</p>
             <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto">You have not initialized any records in the network. Start archiving your knowledge.</p>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div id="settings" className="scroll-mt-28 mt-16 pt-8 border-t border-rose-500/10">
        <h4 className="text-rose-500 font-semibold text-xl mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> Danger Zone</h4>
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-white font-bold mb-1">Delete Account</p>
            <p className="text-slate-400 text-sm font-medium">Permanently remove your account, profile, and all associated data from the network. This action cannot be undone.</p>
          </div>
          
          {showDeleteConfirm ? (
            <div className="flex gap-3 items-center shrink-0 w-full md:w-auto">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-bold text-sm transition-all flex-1 md:flex-none"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_-5px_rgba(244,63,94,0.4)] flex-1 md:flex-none"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, Delete It"}
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="px-6 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/40 rounded-xl font-bold text-sm transition-all shrink-0 w-full md:w-auto"
            >
              Delete Account
            </button>
          )}
        </div>
      </div>
      
      <NoteModal 
         isOpen={isModalOpen} 
         onClose={() => setIsModalOpen(false)} 
         note={selectedNote} 
         onEdit={(n) => { 
           setIsModalOpen(false); 
           setEditingNote(n); 
           setIsEditNoteOpen(true); 
         }}
         onDelete={(id) => {
           setIsModalOpen(false);
           handleDeleteNote(id);
         }}
      />

      <EditNoteModal
         isOpen={isEditNoteOpen}
         note={editingNote}
         onClose={() => { setIsEditNoteOpen(false); setEditingNote(null); }}
         onUpdated={async () => {
           try {
             const data = await noteService.getAllNotes();
             setMyNotes(Array.isArray(data) ? data : []);
           } catch { /* silent */ }
         }}
      />

      {/* Download History Section */}
      <div id="downloads" className="scroll-mt-28 mt-10 border-t border-white/5 pt-20">
        <div className="flex items-center justify-between mb-10">
           <h3 className="text-3xl font-semibold text-white tracking-tight flex items-center gap-4">
              <div className="p-2 bg-teal-500/20 rounded-xl">
                 <Clock className="w-6 h-6 text-teal-400" /> 
              </div>
              Download History
           </h3>
        </div>

        {loadingDownloads ? (
          <div className="h-40 flex items-center justify-center">
             <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
          </div>
        ) : downloads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {downloads.map(dl => (
              <motion.div 
                key={dl.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#101218]/60 backdrop-blur-md p-5 rounded-3xl border border-white/5 flex items-center gap-5 hover:bg-white/5 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                   <Download className="w-5 h-5 text-teal-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-bold truncate">{dl.note_title}</h4>
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{dl.note_subject || 'General'}</span>
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">@{dl.note_uploader || 'Student'}</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(dl.downloaded_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-[#101218]/40 border border-dashed border-white/10 rounded-2xl p-12 text-center">
             <Clock className="w-12 h-12 text-slate-700 mx-auto mb-4" />
             <h4 className="text-xl font-bold text-slate-500">No downloads yet</h4>
             <p className="text-slate-600 mt-1">Start building your collection today.</p>
          </div>
        )}
      </div>

      {/* Notification Center Section */}
      <div id="notifications" className="scroll-mt-28 mt-10 border-t border-white/5 pb-20 pt-20">
        <div className="flex items-center justify-between mb-10">
           <h3 className="text-3xl font-semibold text-white tracking-tight flex items-center gap-4">
              <div className="p-2 bg-rose-500/20 rounded-xl">
                 <Bell className="w-6 h-6 text-rose-400" /> 
              </div>
              Notification Center
           </h3>
        </div>

        {loadingNotifications ? (
           <div className="h-40 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
           </div>
        ) : notifications.length > 0 ? (
           <div className="space-y-4">
              {notifications.map(notif => {
                 const isComment = notif.note_title?.toLowerCase().includes('comment') || notif.sender?.toLowerCase().includes('comment'); // Heuristic
                 return (
                    <motion.div 
                       key={notif.id}
                       initial={{ opacity: 0, scale: 0.98 }}
                       animate={{ opacity: 1, scale: 1 }}
                       className="bg-[#101218]/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 flex items-center gap-6 hover:bg-white/5 transition-all group"
                    >
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform ${isComment ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-rose-500/10 border border-rose-500/20'}`}>
                          {isComment ? (
                            <MessageSquare className="w-5 h-5 text-blue-400 fill-blue-400" />
                          ) : (
                            <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
                          )}
                       </div>
                       <div className="flex-1">
                          <p className="text-slate-200 font-medium">
                             <span className="text-white font-semibold">@{notif.sender}</span> interacted with your note
                             <span className="text-blue-400 font-bold ml-1">"{notif.note_title}"</span>
                          </p>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 block">
                             {new Date(notif.created_at).toLocaleString()}
                          </span>
                       </div>
                    </motion.div>
                 );
              })}
           </div>
        ) : (
           <div className="bg-[#101218]/40 border border-dashed border-white/10 rounded-2xl p-12 text-center">
              <Bell className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-slate-500">No activity yet</h4>
              <p className="text-slate-600 mt-1">When users interact with your notes, you'll see it here.</p>
           </div>
        )}
      </div>
    </div>
  );
};

const ProfileStat = ({ icon, label, value, variants }) => (
  <motion.div variants={variants} className="bg-[#101218]/60 backdrop-blur-md p-6 lg:p-8 rounded-2xl border border-white/5 shadow-xl flex flex-col items-center text-center gap-3 hover:bg-white/5 transition-colors group">
     <div className="p-4 bg-[#0a0b0f] rounded-2xl border border-white/5 shadow-inner group-hover:scale-110 transition-transform">
        {icon}
     </div>
     <div className="space-y-1">
       <p className="text-3xl font-semibold text-white">{value}</p>
       <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
     </div>
  </motion.div>
);

export default Profile;
