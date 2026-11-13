import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, User, Lock, Mail, Loader2, BookOpen, ArrowRight, ShieldCheck, Eye, EyeOff, FileText, Search, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { parseBackendError } from '../../utils/errorHandler';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await login(formData.username, formData.email, formData.password);
      toast.success('Welcome back to NoteNest!');
      navigate('/');
    } catch (error) {
      toast.error(parseBackendError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-stretch overflow-hidden bg-[#0a0b0f]">
      <div className="ambient-background" />
      <section className="relative z-10 hidden w-[46%] flex-col justify-between border-r border-white/[0.07] bg-white/[0.015] p-12 xl:flex">
        <Link to="/" className="flex w-fit items-center gap-2.5 text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]"><BookOpen className="h-5 w-5" /></span>
          <span className="text-lg font-semibold tracking-tight">NoteNest</span>
        </Link>
        <div className="max-w-xl">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">A better way to study together</p>
          <h1 className="text-5xl font-semibold leading-[1.08] tracking-[-0.04em] text-white 2xl:text-6xl">
            Good notes make<br />great ideas <span className="text-blue-300">travel.</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-slate-400">Find useful course notes, share what you know, and keep your learning in one thoughtful space.</p>
          <div className="mt-10 grid gap-3">
            <Feature icon={ShieldCheck} title="Your study space, kept simple" text="Keep your profile and notes organized in one place." />
            <Feature icon={Search} title="Search across subjects" text="Find material by title, university, or subject." />
            <Feature icon={GraduationCap} title="Learn from other students" text="Discover notes shared by your academic community." />
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500"><FileText className="h-4 w-4" /> Study, shared.</div>
      </section>

      <section className="relative z-10 flex min-h-screen flex-1 items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-[440px]">
          <Link to="/" className="mb-10 inline-flex items-center gap-2.5 text-white xl:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]"><BookOpen className="h-4 w-4" /></span>
            <span className="font-semibold tracking-tight">NoteNest</span>
          </Link>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <div className="mb-8">
              <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-blue-300"><LogIn className="h-5 w-5" /></span>
              <h2 className="text-3xl font-semibold tracking-[-0.035em] text-white">Welcome back</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">Sign in to pick up where you left off.</p>
            </div>
            <form onSubmit={handleSubmit} className="glass-strong space-y-5 rounded-2xl p-5 sm:p-7">
              <Field label="Username">
                <Input icon={User} name="username" required autoComplete="username" placeholder="Your username" value={formData.username} onChange={(event) => setFormData({ ...formData, username: event.target.value })} />
              </Field>
              <Field label="Email">
                <Input icon={Mail} type="email" name="email" required autoComplete="email" placeholder="you@university.edu" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} />
              </Field>
              <Field label="Password">
                <div className="relative">
                  <Input icon={Lock} type={showPassword ? 'text' : 'password'} name="password" required autoComplete="current-password" placeholder="Your password" value={formData.password} onChange={(event) => setFormData({ ...formData, password: event.target.value })} className="pr-11" />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/[0.06] hover:text-white">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
              <Button variant="primary" type="submit" disabled={isLoading} className="w-full py-3.5">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
              </Button>
              <p className="text-center text-xs leading-relaxed text-slate-500"><ShieldCheck className="mr-1 inline h-3.5 w-3.5" /> Your account is protected by secure authentication.</p>
            </form>
            <p className="mt-6 text-center text-sm text-slate-400">New to NoteNest? <Link to="/register" className="font-semibold text-blue-300 transition hover:text-blue-200">Create an account</Link></p>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

const Feature = ({ icon: Icon, title, text }) => (
  <div className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3.5">
    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-300"><Icon className="h-4 w-4" /></span>
    <div><p className="text-sm font-medium text-slate-200">{title}</p><p className="mt-1 text-xs leading-relaxed text-slate-500">{text}</p></div>
  </div>
);

const Field = ({ label, children }) => (
  <label className="block space-y-2"><span className="text-xs font-medium text-slate-300">{label}</span>{children}</label>
);

export default Login;
