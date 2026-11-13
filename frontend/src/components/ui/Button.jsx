const variants = {
  primary: 'btn-primary border-transparent text-white',
  secondary: 'glass text-slate-200 hover:border-white/20 hover:bg-white/[0.07]',
  ghost: 'text-slate-400 hover:bg-white/[0.06] hover:text-white',
  danger: 'border border-rose-500/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20',
};

export default function Button({ variant = 'secondary', className = '', type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition duration-200 disabled:opacity-50 ${variants[variant] || variants.secondary} ${className}`}
      {...props}
    />
  );
}
