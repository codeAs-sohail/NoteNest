import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Download, School, Calendar, Trash2, Edit2, Loader2, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { downloadPdf } from '../utils/downloadPdf';
import Avatar from './ui/Avatar';

const NoteCard = ({ note, onLike, onDelete, onEdit, isOwnNote, onClick }) => {
  const [downloadState, setDownloadState] = useState('idle');
  const formattedDate = note.created_at
    ? formatDistanceToNow(new Date(note.created_at), { addSuffix: true })
    : 'Recently';

  const handleDownload = async (event) => {
    event.stopPropagation();
    if (!note.pdf_file || downloadState === 'loading') return;
    setDownloadState('loading');
    try {
      await downloadPdf(note.pdf_file, note.title || 'note', note.id);
      setDownloadState('done');
      window.setTimeout(() => setDownloadState('idle'), 1800);
    } catch (error) {
      setDownloadState('idle');
    }
  };

  const handleKeyDown = (event) => {
    if (!onClick || event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick(note);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card cursor-spotlight group relative flex min-h-[248px] flex-col overflow-hidden p-5"
      onMouseMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty('--x', `${event.clientX - bounds.left}px`);
        event.currentTarget.style.setProperty('--y', `${event.clientY - bounds.top}px`);
      }}
      onClick={() => onClick?.(note)}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `Open note: ${note.title}` : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="max-w-[65%] truncate rounded-full border border-blue-400/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-200">
          {note.subject || 'General'}
        </span>
        {isOwnNote ? (
          <div className="flex gap-1 opacity-70 transition group-hover:opacity-100">
            {onEdit && (
              <button
                type="button"
                onClick={(event) => { event.stopPropagation(); onEdit(note); }}
                aria-label={`Edit ${note.title}`}
                title="Edit note"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-blue-200"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); onDelete?.(note.id); }}
              aria-label={`Delete ${note.title}`}
              title="Delete note"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-rose-400/30 hover:bg-rose-500/10 hover:text-rose-200"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex min-w-0 items-center gap-2">
            <Avatar name={note.user_username || 'Student'} className="h-7 w-7 text-[10px]" />
            <span className="max-w-24 truncate text-xs font-medium text-slate-400">{note.user_username || 'Student'}</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex-1">
        <h3 className="line-clamp-2 text-[17px] font-semibold leading-snug tracking-[-0.02em] text-white">
          {note.title}
        </h3>
        <div className="mt-4 space-y-2">
          <div className="flex min-w-0 items-center gap-2 text-xs text-slate-400">
            <School className="h-3.5 w-3.5 shrink-0 text-blue-300" />
            <span className="truncate">{note.university || 'University not specified'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/[0.07] pt-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={(event) => { event.stopPropagation(); onLike?.(note.id); }}
          aria-label={`${note.is_liked ? 'Unlike' : 'Like'} ${note.title}`}
          aria-pressed={Boolean(note.is_liked)}
          className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition ${
            note.is_liked ? 'bg-rose-500/10 text-rose-300' : 'text-slate-500 hover:bg-white/[0.05] hover:text-rose-300'
          }`}
        >
          <motion.span animate={note.is_liked ? { scale: [1, 1.28, 1] } : { scale: 1 }} transition={{ duration: 0.25 }}>
            <Heart className={`h-4 w-4 ${note.is_liked ? 'fill-rose-500 text-rose-400' : ''}`} />
          </motion.span>
          <span className="font-medium">{note.likes_count || 0}</span>
        </motion.button>
        {note.pdf_file && (
          <button
            type="button"
            onClick={handleDownload}
            aria-label={`Download PDF: ${note.title}`}
            title={downloadState === 'done' ? 'Download ready' : 'Download PDF'}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-blue-200 active:scale-95"
          >
            {downloadState === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : downloadState === 'done' ? <Check className="h-4 w-4 text-teal-300" /> : <Download className="h-4 w-4" />}
          </button>
        )}
      </div>
    </motion.article>
  );
};

export default NoteCard;
