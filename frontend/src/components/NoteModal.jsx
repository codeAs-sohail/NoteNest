import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, Heart, BookOpen, School, Calendar, Clock, Loader2, 
  X, Edit2, Trash2, MessageSquare, Send 
} from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { downloadPdf } from '../utils/downloadPdf';
import noteService from '../services/noteService';
import toast from 'react-hot-toast';

const NoteModal = ({ isOpen, onClose, note, onLike, onEdit, onDelete }) => {
  if (!isOpen || !note) return null;
  const { user } = useAuth();
  const [isLiking, setIsLiking] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isFetchingComments, setIsFetchingComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch comments when modal opens or note changes
  useEffect(() => {
    const fetchComments = async () => {
      setIsFetchingComments(true);
      try {
        const data = await noteService.getComments(note.id);
        setComments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load comments");
      } finally {
        setIsFetchingComments(false);
      }
    };
    if (isOpen) fetchComments();
  }, [note.id, isOpen]);

  // Parse exact date and time
  const dateObj = note.created_at ? new Date(note.created_at) : new Date();
  const formattedDate = format(dateObj, "MMMM do, yyyy");
  const formattedTime = format(dateObj, "h:mm a");



  const isOwnNote = user && user.user === note.user;
  const hasCommented = comments.some(c => c.sender === user?.username);

  const handleLikeClick = async () => {
    if (!onLike) return;
    setIsLiking(true);
    await onLike(note.id);
    setIsLiking(false);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || hasCommented) return;
    setIsSubmitting(true);
    try {
      const res = await noteService.addComment(note.id, newComment);
      const savedComment = res.data || { comment: newComment, sender: user.username, id: Date.now() };
      setComments(prev => [savedComment, ...prev]);
      setNewComment('');
      toast.success("Comment posted!");
    } catch (error) {
      if (error.response?.status === 400 || error.response?.status === 409) {
        toast.error("You have already commented on this note.");
      } else {
        toast.error("Failed to post comment");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl bg-[#0f172a] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl relative flex flex-col"
          style={{ maxHeight: '90vh' }}
        >
          {/* Top Abstract Graphic - Sticky part of header */}
          <div className="h-28 bg-gradient-to-br from-indigo-600/20 to-violet-600/20 relative overflow-hidden shrink-0">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
             <button 
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 bg-[#0f172a]/50 backdrop-blur-md border border-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/10 transition-colors z-20"
             >
                <X className="w-5 h-5" />
             </button>
             <div className="absolute bottom-4 left-6 flex items-center gap-2">
                <span className="bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                   {note.subject || 'General'}
                </span>
             </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="overflow-y-auto custom-scrollbar flex-1 p-8 pt-6">
             <div className="flex justify-between items-start mb-6">
                <div>
                   <h2 className="text-3xl font-black text-white leading-tight mb-2">{note.title}</h2>
                   <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-400">
                      <div className="flex items-center gap-1.5">
                         <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-xs font-bold text-white border border-white/5">
                            {note.user_username ? note.user_username.charAt(0).toUpperCase() : 'S'}
                         </div>
                         <span className="text-slate-300">@{note.user_username || 'Student'}</span>
                      </div>
                      <div className="w-1 h-1 rounded-full bg-slate-600"></div>
                      <div className="flex items-center gap-1.5 text-indigo-400">
                         <School className="w-4 h-4" /> {note.university || 'Global Learners'}
                      </div>
                   </div>
                </div>
             </div>

             {/* Document Abstract */}
             <div className="bg-[#060c1c]/50 border border-white/5 rounded-2xl p-5 mb-6">
                <p className="text-slate-300 leading-relaxed min-h-[60px]">
                   {note.description || "No abstract provided for this document."}
                </p>
             </div>

             {/* Telemetry Row */}
             <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-white/5 mb-8">
                  <div className="flex items-center gap-6">
                     <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><Calendar className="w-3 h-3"/> Upload Date</span>
                        <span className="text-sm font-bold text-slate-300">{formattedDate}</span>
                     </div>
                     <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><Clock className="w-3 h-3"/> Local Time</span>
                        <span className="text-sm font-bold text-slate-300">{formattedTime}</span>
                     </div>
                  </div>

                  <div className="flex items-center gap-4">
                     <button 
                        onClick={handleLikeClick}
                        disabled={isLiking}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                          note.is_liked 
                            ? 'bg-rose-500/15 border border-rose-500/25 text-rose-400' 
                            : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20'
                        }`}
                     >
                        {isLiking 
                          ? <Loader2 className="w-4 h-4 animate-spin" /> 
                          : <Heart className={`w-5 h-5 transition-transform ${note.is_liked ? 'fill-rose-500 text-rose-500 scale-110' : ''}`} />
                        }
                        <span className="text-sm font-bold">{note.likes_count || 0}</span>
                     </button>
                     <button 
                        onClick={() => downloadPdf(note.pdf_file, note.title, note.id)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-black text-sm rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] active:scale-95 ml-2"
                     >
                        <Download className="w-4 h-4" /> Download
                     </button>

                     {isOwnNote && (
                        <div className="flex gap-2">
                           {onEdit && (
                              <button
                                 onClick={(e) => { e.stopPropagation(); onEdit(note); }}
                                 className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-xl transition-all flex items-center justify-center"
                              >
                                 <Edit2 className="w-4 h-4" />
                              </button>
                           )}
                           {onDelete && (
                              <button
                                 onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                                 className="w-10 h-10 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all flex items-center justify-center"
                              >
                                 <Trash2 className="w-4 h-4" />
                              </button>
                           )}
                        </div>
                     )}
                  </div>
             </div>

             {/* Comments Section */}
             <div className="space-y-6">
                <h3 className="text-xl font-black text-white flex items-center gap-3">
                   <MessageSquare className="w-5 h-5 text-indigo-400" /> Comments
                   <span className="text-xs bg-white/10 px-2.5 py-1 rounded-full text-slate-400 font-bold">{comments.length}</span>
                </h3>

                <form onSubmit={handleCommentSubmit} className="relative group">
                  <input 
                    type="text" 
                    placeholder={hasCommented ? "You've already commented on this note" : "Add a comment..."}
                    className="w-full bg-[#060c1c] border border-white/5 text-white placeholder-slate-600 rounded-2xl py-4 pl-5 pr-14 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    value={hasCommented ? "" : newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={hasCommented || isSubmitting}
                  />
                  <button 
                    type="submit"
                    disabled={isSubmitting || !newComment.trim() || hasCommented}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-50 active:scale-95"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>

                <div className="space-y-4">
                  {isFetchingComments ? (
                    <div className="flex justify-center py-8 opacity-50">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                    </div>
                  ) : comments.length > 0 ? (
                    comments.map((c, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        key={c.id || i}
                        className="bg-white/5 border border-white/5 rounded-2xl p-4 flex gap-4"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-fuchsia-500 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                          {(c.sender || 'U')[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-slate-300 mb-1">@{c.sender || 'Student'}</p>
                          <p className="text-sm text-slate-400 font-medium leading-relaxed">{c.comment}</p>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-10 opacity-30">
                      <MessageSquare className="w-10 h-10 mx-auto mb-2" />
                      <p className="font-bold text-sm">No comments yet.</p>
                    </div>
                  )}
                </div>
             </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NoteModal;
