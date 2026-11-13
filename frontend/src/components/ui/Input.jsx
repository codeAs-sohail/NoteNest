export default function Input({ icon: Icon, className = '', wrapperClassName = '', ...props }) {
  return (
    <div className={`group relative ${wrapperClassName}`}>
      {Icon && <Icon aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-blue-300" />}
      <input className={`input-premium w-full rounded-xl px-3.5 py-3 text-sm placeholder:text-slate-600 ${Icon ? 'pl-10' : ''} ${className}`} {...props} />
    </div>
  );
}
