import { motion } from 'framer-motion';

export default function Tabs({ items, value, onChange, ariaLabel = 'Sections' }) {
  return (
    <div role="tablist" aria-label={ariaLabel} className="glass flex gap-1 overflow-x-auto rounded-xl p-1.5">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={value === item.value}
          onClick={() => onChange(item.value)}
          className={`relative shrink-0 rounded-lg px-3.5 py-2 text-sm font-medium transition ${value === item.value ? 'text-white' : 'text-slate-400 hover:text-white'}`}
        >
          {value === item.value && <motion.span layoutId="active-tab" className="absolute inset-0 rounded-lg border border-white/[0.08] bg-white/[0.06]" />}
          <span className="relative">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
