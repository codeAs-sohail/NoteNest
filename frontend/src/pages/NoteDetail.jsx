import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Heart, MessageSquare, Download, Calendar, 
  School, Send, Loader2, BookOpen, User, Clock, FileText,
  Edit2, Trash2
} from 'lucide-react';
import noteService from '../services/noteService';
import { useAuth } from '../context/AuthContext';
import EditNoteModal from '../components/EditNoteModal';
import toast from 'react-hot-toast';
import { formatDistanceToNow, format } from 'date-fns';
import { parseBackendError } from '../utils/errorHandler';
import { downloadPdf } from '../utils/downloadPdf';

const NoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [note, setNote] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      const [noteData, commentData] = await Promise.all([
        noteService.getNoteById(id),
        noteService.getComments(id)
      ]);
      setNote(noteData);
      setComments(Array.isArray(commentData) ? commentData : []);
    } catch (error) {
      toast.error('Failed to load note.');
      navigate('/explore');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, navigate]);

  const handleLike = async () => {
    try {
      await noteService.likeNote(id);
      setNote(prev => ({
        ...prev,
        is_liked: !prev.is_liked,
        likes_count: prev.is_liked ? prev.likes_count - 1 : prev.likes_count + 1
      }));
    } catch (error) {
      toast.error(parseBackendError(error));
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const resp = await noteService.addComment(id, newComment);
      const commentObj = resp?.data || { comment: newComment, sender: 'You', id: Date.now() };
      setComments(prev => [commentObj, ...prev]);
      setNewComment('');
      toast.success('Comment added!');
    } catch (error) {
      toast.error(parseBackendError(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
      <span className="text-slate-500 font-semibold text-sm">Loading note...</span>
    </div>
  );

  if (!note) return null;

  const isOwnNote = user && user.user === note.user;
  const pdfUrl = note.pdf_file
    ? (note.pdf_file.startsWith('http') ? note.pdf_file : `http://localhost:8000${note.pdf_file}`)
    : null;

  const dateObj = note.created_at ? new Date(note.created_at) : new Date();

  return (
    <div className="w-full flex justify-center pb-20">
      <div className="w-full max-w-[1400px]">
        
        {/* Modals */}
        <EditNoteModal
           isOpen={isEditModalOpen}
           note={note}
           onClose={() => setIsEditModalOpen(false)}
           onUpdated={fetchData}
        />

        {/* Back Navigation */}
        <div className="mb-8 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 font-semibold hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl border border-white/5"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>

        <div className="flex flex-col xl:flex-row gap-8">
          
          {/* Main Content */}
          <div className="flex-1 space-y-8">
            
            {/* Note Header Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-[#0f172a]/80 backdrop-blur-md rounded-[40px] p-8 lg:p-12 border border-white/5 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/3 translate-x-1/3"></div>

              <div className="relative z-10 space-y-6">
                {/* Subject Badge + Actions */}
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-indigo-500/30">
                    {note.subject || 'General'}
                  </span>
                  <div className="flex gap-3">
                    <button
                      onClick={handleLike}
                      className={`p-3 rounded-2xl border transition-all flex items-center gap-2 ${note.is_liked ? 'bg-rose-500/20 border-rose-500/30 text-rose-400' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                    >
                      <Heart className={`w-5 h-5 ${note.is_liked ? 'fill-rose-500' : ''}`} />
                      <span className="font-bold">{note.likes_count || 0}</span>
                    </button>

                    {isOwnNote && (
                      <>
                        <button
                          onClick={() => setIsEditModalOpen(true)}
                          className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-2xl transition-all shadow-lg hover:shadow-indigo-500/20"
                          title="Edit note"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm("Are you sure you want to delete this note?")) {
                                try {
                                    await noteService.deleteNote(id);
                                    toast.success("Note deleted successfully");
                                    navigate('/explore');
                                } catch (err) {
                                    toast.error(parseBackendError(err));
                                }
                            }
                          }}
                          className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white rounded-2xl transition-all shadow-lg hover:shadow-rose-500/20"
                          title="Delete note"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </>
                    )}

                    {pdfUrl && (
                      <button
                        onClick={() => downloadPdf(pdfUrl, note.title, note.id)}
                        className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
                      >
                        <Download className="w-5 h-5" />
                        <span className="font-bold text-sm hidden sm:block">Download</span>
                      </button>
                    )}
                  </div>
                </div>

                <h1
                  className="text-3xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {note.title}
                </h1>
                
                <p className="text-lg text-slate-400 font-medium max-w-2xl leading-relaxed">
                  {note.description || "No description provided."}
                </p>

                {/* Meta Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/5">
                  <MetaItem
                    icon={<School className="w-4 h-4 text-indigo-400" />}
                    label="University"
                    value={note.university || 'Unknown'}
                  />
                  <MetaItem
                    icon={<User className="w-4 h-4 text-violet-400" />}
                    label="Uploaded by"
                    value={`@${note.user_username || 'Student'}`}
                  />
                  <MetaItem
                    icon={<Calendar className="w-4 h-4 text-fuchsia-400" />}
                    label="Date"
                    value={format(dateObj, 'MMM d, yyyy')}
                  />
                  <MetaItem
                    icon={<Clock className="w-4 h-4 text-teal-400" />}
                    label="Time"
                    value={format(dateObj, 'h:mm a')}
                  />
                </div>
              </div>
            </motion.div>

          </div>

          {/* Comments Side Panel */}
          <div className="w-full xl:w-[380px] shrink-0">
            <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/5 rounded-[40px] p-6 flex flex-col xl:sticky xl:top-[120px]" style={{ maxHeight: 'calc(100vh - 140px)' }}>
              
              <h3 className="text-lg font-black text-white flex items-center gap-3 mb-6 pb-5 border-b border-white/5 shrink-0">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                Comments
                <span className="ml-auto bg-white/10 text-white text-xs px-2.5 py-1 rounded-full font-bold">{comments.length}</span>
              </h3>

              {/* Comment Form */}
              <form onSubmit={handleAddComment} className="mb-5 relative shrink-0">
                <input 
                  type="text" 
                  placeholder="Write a comment..." 
                  className="w-full bg-[#060c1c] border border-slate-800 text-white placeholder-slate-600 rounded-2xl py-3.5 pl-4 pr-14 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm font-medium"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button 
                  type="submit" 
                  disabled={submitting || !newComment.trim()} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-40"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>

              {/* Comment List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
                {comments.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center text-center opacity-50 gap-3">
                    <MessageSquare className="w-8 h-8 text-slate-500" />
                    <p className="text-sm font-semibold text-slate-400">No comments yet. Be the first!</p>
                  </div>
                ) : (
                  comments.map((comment, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                      key={comment.id || idx} 
                      className="bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/8 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-fuchsia-500 flex items-center justify-center text-[10px] font-black text-white shadow-lg shrink-0">
                          {(comment.sender || comment.sender_name || 'U')[0]?.toUpperCase()}
                        </div>
                        <span className="font-bold text-sm text-slate-200 truncate">{comment.sender || comment.sender_name || 'Student'}</span>
                      </div>
                      <p className="text-slate-400 text-sm font-medium leading-relaxed ml-9">{comment.comment}</p>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const MetaItem = ({ icon, label, value }) => (
  <div className="space-y-1">
    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{label}</p>
    <p className="text-sm font-bold text-slate-300 flex items-center gap-2">
      {icon} <span className="truncate">{value}</span>
    </p>
  </div>
);

export default NoteDetail;
