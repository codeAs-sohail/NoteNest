import { motion } from 'framer-motion';
import { Heart, Download, School, Calendar, Trash2, Edit2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { downloadPdf } from '../utils/downloadPdf';

const NoteCard = ({ note, onLike, onDelete, onEdit, isOwnNote, onClick }) => {
  const formattedDate = note.created_at 
    ? formatDistanceToNow(new Date(note.created_at), { addSuffix: true })
    : 'Recently';

  const pdfUrl = note.pdf_file
    ? note.pdf_file.startsWith('http')
      ? note.pdf_file
      : `http://localhost:8000${note.pdf_file}`
    : null;

  const handleDownload = (e) => {
    e.stopPropagation();
    if (!pdfUrl) return;
    downloadPdf(pdfUrl, note.title || 'note', note.id);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group bg-[#0f172a]/80 backdrop-blur-md rounded-[28px] p-6 border border-white/5 hover:border-indigo-500/30 transition-all duration-300 relative flex flex-col h-[280px] shadow-lg hover:shadow-indigo-500/10 cursor-pointer"
      onClick={() => onClick && onClick(note)}
    >
      {/* Top Meta */}
      <div className="flex justify-between items-start mb-3">
        <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-indigo-500/20">
          {note.subject || 'General'}
        </span>
        
        {isOwnNote ? (
          <div className="flex gap-1.5 opacity-60 group-hover:opacity-100 transition-all duration-300">
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(note); }}
                className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20"
                title="Edit note"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onDelete && onDelete(note.id); }}
              className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-lg hover:shadow-rose-500/20"
              title="Delete note"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Owner name - small subtle badge */
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-white/10 border border-white/5 flex items-center justify-center text-[9px] font-black text-slate-400">
              {(note.user_username || 'S')[0].toUpperCase()}
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              {note.user_username || 'Student'}
            </span>
          </div>
        )}
      </div>

      {/* Title - with display font */}
      <div className="flex-1">
        <h3
          className="text-lg font-black text-white leading-snug mb-2 line-clamp-2"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {note.title}
        </h3>
        
        <div className="space-y-1.5 mt-3">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <School className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">{note.university || 'Unknown University'}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 mt-auto border-t border-white/5 flex items-center justify-between">
        <button 
          onClick={(e) => { e.stopPropagation(); onLike && onLike(note.id); }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all duration-200 ${
            note.is_liked 
              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20' 
              : 'text-slate-500 hover:bg-white/5 hover:text-rose-400 border border-transparent'
          }`}
        >
          <Heart className={`w-4 h-4 transition-all ${note.is_liked ? 'fill-rose-500 text-rose-500 scale-110' : ''}`} />
          <span className={`text-sm font-bold ${note.is_liked ? 'text-rose-400' : ''}`}>{note.likes_count || 0}</span>
        </button>

        {pdfUrl && (
          <button
            onClick={handleDownload}
            className="w-9 h-9 bg-white/5 border border-white/10 text-slate-400 rounded-xl flex items-center justify-center hover:bg-indigo-500 hover:text-white hover:border-indigo-400 active:scale-95 transition-all"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default NoteCard;
