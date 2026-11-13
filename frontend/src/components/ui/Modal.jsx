import { AnimatePresence, motion } from 'framer-motion';
import useModalA11y from './useModalA11y';

export default function Modal({ isOpen, onClose, title, children, className = '' }) {
  const dialogRef = useModalA11y(isOpen, onClose);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="presentation"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
        >
          <motion.section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            onClick={(event) => event.stopPropagation()}
            className={`glass-strong w-full overflow-y-auto rounded-2xl shadow-2xl ${className}`}
          >
            {children}
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
