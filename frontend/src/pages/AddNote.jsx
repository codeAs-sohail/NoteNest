import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, FileText, CheckCircle, Loader2, BookOpen, School, File
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
        className="w-full max-w-[1000px] bg-[#0f172a]/80 backdrop-blur-xl border border-white/5 rounded-[40px] shadow-2xl overflow-hidden flex flex-col lg:flex-row relative"
      >
        {/* Abstract BG */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        {/* Left Side: Upload Zone */}
        <div className="w-full lg:w-5/12 p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-white/5 bg-[#060c1c]/40 flex flex-col justify-center">
           <div className="mb-8">
              <h2 className="text-3xl font-black text-white mb-2">Upload Note</h2>
              <p className="text-slate-400 font-medium text-sm leading-relaxed">Share your notes with the community. Please ensure documents do not contain personal info.</p>
           </div>

           <div 
             className={`relative h-64 border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center p-6 text-center transition-all duration-300 overflow-hidden ${
               isDragging ? 'border-indigo-400 bg-indigo-500/10' : file ? 'border-teal-500/50 bg-teal-500/5' : 'border-slate-800 bg-[#0f172a] hover:border-indigo-500/50 hover:bg-[#0f172a]/80'
             }`}
             onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
             onDragLeave={() => setIsDragging(false)}
             onDrop={handleDrop}
           >
             <input 
               type="file" 
               accept="application/pdf" 
               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
               onChange={(e) => handleFile(e.target.files[0])}
               disabled={isUploading}
             />
             
             <AnimatePresence mode="wait">
               {file ? (
                 <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="flex flex-col items-center z-0">
                    <div className="w-16 h-16 bg-teal-500/20 text-teal-400 rounded-2xl flex items-center justify-center mb-4 border border-teal-500/30">
                       <CheckCircle className="w-8 h-8" />
                    </div>
                    <p className="font-black text-white text-lg truncate w-full px-4">{file.name}</p>
                    <p className="text-xs font-bold text-teal-400 uppercase tracking-widest mt-1">Ready for Upload</p>
                 </motion.div>
               ) : (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center z-0">
                    <div className="w-16 h-16 bg-white/5 text-slate-400 rounded-2xl flex items-center justify-center mb-4 border border-slate-800">
                       <UploadCloud className="w-8 h-8" />
                    </div>
                    <p className="font-bold text-slate-300">Drag & Drop PDF Document</p>
                    <p className="text-sm font-medium text-slate-500 mt-1 mb-4">or click to browse filesystem</p>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-slate-800 text-slate-400 px-3 py-1 rounded-full border border-slate-700">Max 50MB</span>
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full lg:w-7/12 p-8 lg:p-12 relative z-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Note Title</label>
              <div className="relative group">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                <input 
                  type="text" name="title" required placeholder="Machine Learning Lecture 01"
                  className="w-full bg-[#060c1c] border border-slate-800 text-white placeholder-slate-600 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all font-medium text-sm"
                  value={formData.title} onChange={handleInputChange} disabled={isUploading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Description</label>
              <div className="relative group">
                <File className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                <textarea 
                  name="description" placeholder="Notes covering the foundations of neural networks..."
                  className="w-full bg-[#060c1c] border border-slate-800 text-white placeholder-slate-600 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all font-medium text-sm min-h-[100px] resize-none"
                  value={formData.description} onChange={handleInputChange} disabled={isUploading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Subject</label>
                <div className="relative group">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                  <input 
                    type="text" name="subject" required placeholder="Computer Science"
                    className="w-full bg-[#060c1c] border border-slate-800 text-white placeholder-slate-600 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all font-medium text-sm"
                    value={formData.subject} onChange={handleInputChange} disabled={isUploading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">University</label>
                <div className="relative group">
                  <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                  <input 
                    type="text" name="university" placeholder="MIT"
                    className="w-full bg-[#060c1c] border border-slate-800 text-white placeholder-slate-600 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all font-medium text-sm"
                    value={formData.university} onChange={handleInputChange} disabled={isUploading}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
               {isUploading ? (
                 <div className="w-full bg-[#060c1c] rounded-2xl p-4 border border-indigo-500/30 overflow-hidden relative">
                    {/* Indeterminate shimmer — loops honestly while Supabase uploads */}
                    <div className="absolute top-0 left-0 h-full w-full overflow-hidden z-0">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-600"
                        style={{
                          width: '60%',
                          animation: 'shimmer 1.6s ease-in-out infinite',
                          backgroundSize: '200% 100%',
                        }}
                      />
                    </div>
                    <div className="relative z-10 flex items-center gap-2 text-white font-bold text-sm">
                       <Loader2 className="w-4 h-4 animate-spin" />
                       <span>Uploading to Supabase… this may take a moment</span>
                    </div>
                 </div>
               ) : (
                <button 
                  type="submit" 
                  disabled={!file}
                  className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white py-4 rounded-2xl font-black text-lg transition-all shadow-[0_0_30px_-5px_rgba(99,102,241,0.5)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
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
