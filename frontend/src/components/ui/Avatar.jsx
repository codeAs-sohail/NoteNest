export default function Avatar({ name = '', className = '' }) {
  return (
    <span aria-label={name || 'Student'} className={`inline-flex shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.07] font-semibold text-slate-200 ${className}`}>
      {name.trim().charAt(0).toUpperCase() || 'S'}
    </span>
  );
}
