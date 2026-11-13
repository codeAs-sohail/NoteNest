import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function Dropdown({ label, trigger, children, align = 'right', className = '' }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const handleOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button type="button" aria-label={label} aria-expanded={open} onClick={() => setOpen((value) => !value)}>{trigger}</button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className={`glass-strong absolute top-full z-50 mt-2 rounded-2xl p-2 shadow-2xl ${align === 'left' ? 'left-0' : 'right-0'} ${className}`}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
