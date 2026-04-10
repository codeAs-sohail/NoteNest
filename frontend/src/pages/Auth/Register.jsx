import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  UserPlus, User, Lock, Mail, School, Calendar, FileText, 
  Loader2, BookOpen, Sparkles, Network 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { parseBackendError } from '../../utils/errorHandler';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', university: '', year: '2025', bio: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register(formData);
      toast.success('Account created successfully! Please log in.');
      navigate('/login');
    } catch (error) {
      toast.error(parseBackendError(error));
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#0f172a] overflow-y-auto sm:p-4 lg:p-8 custom-scrollbar">
      
      {/* Main Container */}
      <div className="w-full max-w-[1400px] mx-auto bg-slate-900/50 sm:rounded-[40px] border border-white/5 flex flex-col lg:flex-row overflow-hidden shadow-2xl shadow-indigo-500/10 backdrop-blur-2xl relative my-auto">
        
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 w-[800px] h-[800px] bg-violet-500/20 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        {/* Left Side: Branding */}
        <div className="w-full lg:w-5/12 p-10 lg:p-16 flex flex-col justify-between relative z-10 hidden lg:flex border-r border-white/5 bg-slate-900/40">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <Link to="/" className="flex items-center gap-3 group w-fit">
              <div className="bg-gradient-to-tr from-indigo-600 to-violet-500 p-3 rounded-2xl shadow-lg shadow-indigo-500/30 group-hover:rotate-12 transition-all duration-300">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <span className="text-3xl font-black tracking-tighter text-white">NoteNest</span>
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <h1 className="text-5xl xl:text-6xl font-black text-white leading-[1.1] tracking-tight">
               Build your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Academic Hub.</span>
            </h1>
            <p className="text-lg text-slate-400 font-medium max-w-sm leading-relaxed">
              Join a network of top-tier universities. Access, share, and collaborate on premium lecture notes.
            </p>

            <div className="flex flex-wrap gap-3 pt-6">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm font-semibold backdrop-blur-md">
                <Network className="w-4 h-4 text-violet-400" /> Global Network
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm font-semibold backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-fuchsia-400" /> Smart Curation
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full lg:w-7/12 p-8 sm:p-12 lg:p-16 flex items-center justify-center relative z-10">
          
          <div className="absolute top-8 left-8 lg:hidden">
             <Link to="/" className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-indigo-600 to-violet-500 p-2 rounded-xl shadow-lg shadow-indigo-500/30">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white">NoteNest</span>
            </Link>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="w-full max-w-xl w-full"
          >
            <motion.div variants={fadeUp} className="mb-10 text-center lg:text-left mt-16 lg:mt-0">
              <h2 className="text-3xl font-black text-white mb-3">Create Account</h2>
              <p className="text-slate-400 font-medium">Join the platform to start sharing notes immediately.</p>
            </motion.div>

            <motion.form variants={staggerContainer} onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <motion.div variants={fadeUp} className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Username</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                    <input
                      type="text" name="username" required placeholder="johndoe"
                      className="w-full bg-slate-950/50 border border-slate-800 text-white placeholder-slate-600 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all font-medium text-sm"
                      value={formData.username} onChange={handleInputChange}
                    />
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                    <input
                      type="email" name="email" required placeholder="school@uni.edu"
                      className="w-full bg-slate-950/50 border border-slate-800 text-white placeholder-slate-600 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all font-medium text-sm"
                      value={formData.email} onChange={handleInputChange}
                    />
                  </div>
                </motion.div>
              </div>

              <motion.div variants={fadeUp} className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">University</label>
                <div className="relative group">
                  <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                  <input
                    type="text" name="university" required placeholder="Stanford University"
                    className="w-full bg-slate-950/50 border border-slate-800 text-white placeholder-slate-600 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all font-medium text-sm"
                    value={formData.university} onChange={handleInputChange}
                  />
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <motion.div variants={fadeUp} className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Class Year</label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                    <select
                      name="year"
                      className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all font-medium text-sm appearance-none cursor-pointer"
                      value={formData.year} onChange={handleInputChange}
                    >
                      {['2024', '2025', '2026', '2027', '2028'].map(y => <option key={y} value={y} className="bg-slate-900">{y}</option>)}
                    </select>
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                    <input
                      type="password" name="password" required placeholder="••••••••"
                      className="w-full bg-slate-950/50 border border-slate-800 text-white placeholder-slate-600 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all font-medium text-sm"
                      value={formData.password} onChange={handleInputChange}
                    />
                  </div>
                </motion.div>
              </div>

              <motion.div variants={fadeUp} className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Short Bio</label>
                <div className="relative group">
                  <FileText className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                  <textarea
                    name="bio" placeholder="Computer Science major interested in AI..."
                    className="w-full bg-slate-950/50 border border-slate-800 text-white placeholder-slate-600 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all font-medium text-sm min-h-[100px] resize-none fade-in"
                    value={formData.bio} onChange={handleInputChange}
                  />
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:from-violet-400 hover:to-fuchsia-500 text-white rounded-2xl py-4 font-black text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_0_40px_-10px_rgba(167,139,250,0.5)] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <UserPlus className="w-5 h-5" />
                    </>
                  )}
                </button>
              </motion.div>
            </motion.form>

            <motion.p variants={fadeUp} className="mt-8 text-center text-sm font-medium text-slate-500">
              Already a member?{' '}
              <Link to="/login" className="text-violet-400 hover:text-violet-300 font-bold transition-colors">
                Login here
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
