export default function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div className={`glass rounded-2xl px-6 py-12 text-center ${className}`}>
      {Icon && <span className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-slate-400"><Icon className="h-5 w-5" /></span>}
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {description && <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
