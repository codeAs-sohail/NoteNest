export default function Select({ icon: Icon, className = '', children, ...props }) {
  return (
    <div className="relative">
      {Icon && <Icon aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />}
      <select className={`input-premium w-full appearance-none rounded-xl px-3.5 py-3 text-sm ${Icon ? 'pl-10' : ''} ${className}`} {...props}>
        {children}
      </select>
    </div>
  );
}
