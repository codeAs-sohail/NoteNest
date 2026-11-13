export default function SectionHeading({ title, description, action, className = '' }) {
  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between ${className}`}>
      <div>
        <h2 className="text-2xl font-semibold tracking-[-0.025em] text-white sm:text-3xl">{title}</h2>
        {description && <p className="mt-1.5 text-sm text-slate-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}
