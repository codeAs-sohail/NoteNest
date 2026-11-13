export default function Badge({ children, tone = 'neutral', className = '' }) {
  const tones = {
    neutral: 'border-white/10 bg-white/[0.05] text-slate-300',
    accent: 'border-blue-400/20 bg-blue-500/10 text-blue-200',
    success: 'border-teal-400/20 bg-teal-500/10 text-teal-200',
    danger: 'border-rose-400/20 bg-rose-500/10 text-rose-200',
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${tones[tone] || tones.neutral} ${className}`}>{children}</span>;
}
