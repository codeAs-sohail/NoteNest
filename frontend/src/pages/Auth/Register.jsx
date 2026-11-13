import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { UserPlus, User, Lock, Mail, School, Calendar, FileText, Loader2, BookOpen, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { parseBackendError } from '../../utils/errorHandler';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', university: '', year: '2025', bio: '' });
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (event) => setFormData({ ...formData, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }
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

  return (
    <main className="relative flex min-h-screen items-stretch overflow-hidden bg-[#0a0b0f]">
      <div className="ambient-background" />
      <section className="relative z-10 hidden w-[46%] flex-col justify-between border-r border-white/[0.07] bg-white/[0.015] p-12 xl:flex">
        <Link to="/" className="flex w-fit items-center gap-2.5 text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]"><BookOpen className="h-5 w-5" /></span>
          <span className="text-lg font-semibold tracking-tight">NoteNest</span>
        </Link>
        <div className="max-w-xl">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">Built around your learning</p>
          <h1 className="text-5xl font-semibold leading-[1.08] tracking-[-0.04em] text-white 2xl:text-6xl">Make room for<br />better <span className="text-blue-300">thinking.</span></h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-slate-400">Create your study profile to discover course notes and share useful material with other students.</p>
          <div className="mt-10 grid gap-3">
            <Feature icon={School} title="Connect learning to your campus" text="Add your university and class year to your profile." />
            <Feature icon={FileText} title="Keep your notes together" text="Upload course material and return to it anytime." />
            <Feature icon={UserPlus} title="Start with the essentials" text="You can update your profile details later." />
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500"><FileText className="h-4 w-4" /> Study, shared.</div>
      </section>

      <section className="relative z-10 flex min-h-screen flex-1 items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[500px]">
          <Link to="/" className="mb-8 inline-flex items-center gap-2.5 text-white xl:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]"><BookOpen className="h-4 w-4" /></span>
            <span className="font-semibold tracking-tight">NoteNest</span>
          </Link>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <div className="mb-6">
              <p className="text-xs font-medium text-blue-300">GET STARTED · STEP {step} OF 2</p>
              <div className="mt-3 flex gap-2" aria-label={`Step ${step} of 2`}>
                <span className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-blue-400' : 'bg-white/10'}`} />
                <span className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-blue-400' : 'bg-white/10'}`} />
              </div>
            </div>
            <h2 className="text-3xl font-semibold tracking-[-0.035em] text-white">{step === 1 ? 'Create your account' : 'Tell us about your studies'}</h2>
            <p className="mt-2 text-sm text-slate-400">{step === 1 ? 'Start with your sign-in details.' : 'Add a little context to your student profile.'}</p>

            <form onSubmit={handleSubmit} className="glass-strong mt-6 space-y-4 rounded-2xl p-5 sm:p-7">
              <AnimatePresence mode="wait" initial={false}>
                {step === 1 ? (
                  <motion.div key="identity" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                    <Field label="Username"><Input icon={User} name="username" required autoComplete="username" placeholder="johndoe" value={formData.username} onChange={handleInputChange} /></Field>
                    <Field label="Email"><Input icon={Mail} type="email" name="email" required autoComplete="email" placeholder="you@university.edu" value={formData.email} onChange={handleInputChange} /></Field>
                    <Field label="Password">
                      <div className="relative">
                        <Input icon={Lock} type={showPassword ? 'text' : 'password'} name="password" required autoComplete="new-password" placeholder="Choose a password" value={formData.password} onChange={handleInputChange} className="pr-11" />
                        <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/[0.06] hover:text-white">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </Field>
                  </motion.div>
                ) : (
                  <motion.div key="profile" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                    <Field label="University"><Input icon={School} name="university" required placeholder="University name" value={formData.university} onChange={handleInputChange} /></Field>
                    <Field label="Class year">
                      <div className="relative">
                        <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <select name="year" value={formData.year} onChange={handleInputChange} className="input-premium w-full appearance-none rounded-xl py-3 pl-10 pr-3.5 text-sm">
                          {['2024', '2025', '2026', '2027', '2028'].map((year) => <option key={year} value={year}>{year}</option>)}
                        </select>
                      </div>
                    </Field>
                    <Field label="Short bio (optional)">
                      <div className="relative">
                        <FileText className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                        <textarea name="bio" rows={3} placeholder="What are you studying?" value={formData.bio} onChange={handleInputChange} className="input-premium w-full resize-y rounded-xl py-3 pl-10 pr-3.5 text-sm placeholder:text-slate-600" />
                      </div>
                    </Field>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex gap-3 pt-2">
                {step === 2 && <Button onClick={() => setStep(1)} className="flex-1"><ArrowLeft className="h-4 w-4" /> Back</Button>}
                <Button variant="primary" type="submit" disabled={isLoading} className="flex-1 py-3">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : step === 1 ? <>Continue <ArrowRight className="h-4 w-4" /></> : <>Create account <UserPlus className="h-4 w-4" /></>}
                </Button>
              </div>
            </form>
            <p className="mt-6 text-center text-sm text-slate-400">Already have an account? <Link to="/login" className="font-semibold text-blue-300 transition hover:text-blue-200">Sign in</Link></p>
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

export default Register;
