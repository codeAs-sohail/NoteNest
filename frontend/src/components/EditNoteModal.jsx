import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, BookOpen, School, Loader2, UploadCloud, CheckCircle } from 'lucide-react';
import noteService from '../services/noteService';
import toast from 'react-hot-toast';
import { parseBackendError } from '../utils/errorHandler';

const EditNoteModal = ({ isOpen, note, onClose, onUpdated }) => {
  const [form, setForm] = useState({ title: '', description: '', subject: '', university: '' });
  const [file, setFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Populate form when note changes
  useEffect(() => {
    if (note) {
      setForm({
        title: note.title || '',
        description: note.description || '',
        subject: note.subject || '',
        university: note.university || '',
      });
      setFile(null);
    }
  }, [note]);

  if (!isOpen || !note) return null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (f) => {
    if (f?.type !== 'application/pdf') { toast.error('Only PDF files allowed.'); return; }
    setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // We always use FormData for updates to ensure the backend's MultiPartParser 
      // processes all fields consistently, whether or not a file is being replaced.
      const payload = new FormData();
      
      // Explicitly mapping strings to ensure no field is misinterpreted by the backend
      payload.append('title', String(form.title).trim());
      payload.append('subject', String(form.subject).trim());
      payload.append('university', String(form.university).trim());
      payload.append('description', String(form.description).trim());
      
      if (file) {
        payload.append('pdf_file', file);
      }

      await noteService.updateNote(note.id, payload);
      toast.success('Note updated successfully!');
      onUpdated && onUpdated();
      onClose();
    } catch (error) {
      toast.error(parseBackendError(error));
    } finally {
      setIsSaving(false);
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
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-xl bg-[#0f172a] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 pt-8 pb-5 border-b border-white/5">
            <div>
              <h2 className="text-xl font-black text-white">Edit Note</h2>
              <p className="text-slate-500 text-sm mt-0.5">Update your note details</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Note Title</label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  name="title" value={form.title} onChange={handleChange} required
                  placeholder="E.g. Data Structures Chapter 3"
                  className="w-full bg-[#060c1c] border border-slate-800 text-white placeholder-slate-600 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Subject</label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  name="subject" value={form.subject} onChange={handleChange} required
                  placeholder="E.g. Computer Science"
                  className="w-full bg-[#060c1c] border border-slate-800 text-white placeholder-slate-600 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">University</label>
              <div className="relative">
                <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  name="university" value={form.university} onChange={handleChange}
                  placeholder="E.g. MIT"
                  className="w-full bg-[#060c1c] border border-slate-800 text-white placeholder-slate-600 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Description</label>
              <textarea
                name="description" value={form.description} onChange={handleChange}
                placeholder="Short description of the note..."
                className="w-full bg-[#060c1c] border border-slate-800 text-white placeholder-slate-600 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm font-medium min-h-[90px] resize-none"
              />
            </div>

            {/* Optional PDF Re-upload */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Replace PDF (optional)</label>
              <label
                className={`block border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${file ? 'border-teal-500/40 bg-teal-500/5' : 'border-slate-800 hover:border-indigo-500/50 hover:bg-white/2'}`}
              >
                <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
                {file ? (
                  <div className="flex items-center justify-center gap-2 text-teal-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-bold truncate">{file.name}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-slate-500">
                    <UploadCloud className="w-4 h-4" />
                    <span className="text-sm font-medium">Click to upload a new PDF</span>
                  </div>
                )}
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 font-bold text-sm hover:bg-white/5 transition-all">
                Cancel
              </button>
              <button
                type="submit" disabled={isSaving}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-black text-sm transition-all shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditNoteModal;
