import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, FileText, CheckCircle, Loader2, BookOpen, School, File, X
} from 'lucide-react';
import noteService from '../services/noteService';
import toast from 'react-hot-toast';

const AddNote = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '', description: '', subject: '', university: ''
  });
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFile = (selectedFile) => {
    if (selectedFile?.type !== 'application/pdf') {
      toast.error('System accepts PDF format only.');
      return;
    }
    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please attach a PDF file before uploading.');

    const uploadData = new FormData();
    Object.keys(formData).forEach(key => uploadData.append(key, formData[key]));
    uploadData.append('pdf_file', file);
    uploadData.append('download_count', 0); // Initialize

    setIsUploading(true);

    try {
      await noteService.createNote(uploadData);
      toast.success('Note uploaded successfully!');
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (error) {
      setIsUploading(false);

      // Surface the real backend error so we can debug it instead of swallowing it
      const backendMsg =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        (typeof error.response?.data === 'string' ? error.response.data : null) ||
        'Upload failed. Please try again.';

      console.error('Note upload failed:', error.response?.data);
      toast.error(backendMsg);
    }
  };

  return (
    <div className="w-full flex items-center justify-center min-h-[calc(100vh-200px)]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="glass-strong w-full max-w-5xl overflow-hidden rounded-3xl shadow-2xl lg:flex"
      >
        {/* Left Side: Upload Zone */}
        <div className="flex w-full flex-col justify-center border-b border-white/[0.07] bg-white/[0.015] p-6 sm:p-8 lg:w-5/12 lg:border-b-0 lg:border-r lg:p-10">
           <div className="mb-8">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-blue-300">Contribute to the library</p>
              <h1 className="text-2xl font-semibold tracking-tight text-white">Upload a note</h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">Share a course document with the community. Check that the PDF does not contain personal information.</p>
           </div>

           <div 
             className={`relative min-h-60 rounded-2xl border border-dashed p-6 transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-400/50 ${
               isDragging ? 'border-blue-300 bg-blue-500/[0.08]' : file ? 'border-teal-400/40 bg-teal-500/[0.04]' : 'border-white/15 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]'
             }`}
             onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
             onDragLeave={() => setIsDragging(false)}
             onDrop={handleDrop}
           >
             <input 
               type="file" 
               accept="application/pdf" 
               aria-label="Choose a PDF file"
               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
               onChange={(e) => handleFile(e.target.files[0])}
               disabled={isUploading}
             />
             
             <AnimatePresence mode="wait">
               {file ? (
                 <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} className="flex w-full flex-col items-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-teal-400/20 bg-teal-500/10 text-teal-300">
                       <CheckCircle className="h-6 w-6" />
                    </div>
                    <p className="w-full truncate px-4 text-sm font-medium text-white">{file.name}</p>
                    <p className="mt-1 text-xs text-teal-300">PDF · {(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    <button type="button" onClick={(event) => { event.stopPropagation(); setFile(null); }} className="relative z-20 mt-3 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white">
                      <X className="h-3.5 w-3.5" /> Remove file
                    </button>
                 </motion.div>
               ) : (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none flex flex-col items-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300">
                       <UploadCloud className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-200">Drop a PDF here, or browse</p>
                    <p className="mb-1 mt-2 text-xs text-slate-500">PDF files only</p>
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
        </div>

        {/* Right Side: Form */}
        <div className="relative z-10 w-full p-6 sm:p-8 lg:w-7/12 lg:p-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Note title</label>
              <div className="relative group">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input 
                  type="text" name="title" required placeholder="Machine Learning Lecture 01"
                  className="input-premium w-full rounded-xl py-3 pl-10 pr-3.5 text-sm placeholder:text-slate-600"
                  value={formData.title} onChange={handleInputChange} disabled={isUploading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Description</label>
              <div className="relative group">
                <File className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <textarea 
                  name="description" placeholder="Notes covering the foundations of neural networks..."
                  className="input-premium min-h-28 w-full resize-y rounded-xl py-3 pl-10 pr-3.5 text-sm placeholder:text-slate-600"
                  value={formData.description} onChange={handleInputChange} disabled={isUploading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Subject</label>
                <div className="relative group">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <input 
                    type="text" name="subject" required placeholder="Computer Science"
                    className="w-full bg-[#0a0b0f] border border-slate-800 text-white placeholder-slate-600 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium text-sm"
                    value={formData.subject} onChange={handleInputChange} disabled={isUploading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">University</label>
                <div className="relative group">
                  <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <input 
                    type="text" name="university" placeholder="MIT"
                    className="w-full bg-[#0a0b0f] border border-slate-800 text-white placeholder-slate-600 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium text-sm"
                    value={formData.university} onChange={handleInputChange} disabled={isUploading}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
               {isUploading ? (
                 <div className="relative w-full overflow-hidden rounded-xl border border-blue-400/20 bg-white/[0.03] p-4">
                    {/* Indeterminate shimmer — loops honestly while Supabase uploads */}
                    <div className="absolute top-0 left-0 h-full w-full overflow-hidden z-0">
                      <div
                        className="h-full bg-blue-500/40"
                        style={{
                          width: '60%',
                          animation: 'shimmer 1.6s ease-in-out infinite',
                          backgroundSize: '200% 100%',
                        }}
                      />
                    </div>
                    <div className="relative z-10 flex items-center gap-2 text-white font-bold text-sm">
                       <Loader2 className="w-4 h-4 animate-spin" />
                       <span>Uploading your PDF… this may take a moment</span>
                    </div>
                 </div>
               ) : (
                <button 
                  type="submit" 
                  disabled={!file}
                  className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-medium disabled:opacity-50"
                >
                  <UploadCloud className="w-5 h-5" /> Upload Note
                </button>
               )}
            </div>

          </form>
        </div>

      </motion.div>
    </div>
  );
};

export default AddNote;
