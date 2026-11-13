import { motion, useScroll, useSpring } from 'framer-motion';

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return <motion.div aria-hidden="true" className="fixed left-0 right-0 top-0 z-[70] h-[2px] origin-left bg-[#2f7cff]" style={{ scaleX: progress }} />;
}
