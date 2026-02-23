'use client';

import { motion } from 'framer-motion';

interface AnimatedContainerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedContainer({ children, className, delay = 0.03 }: AnimatedContainerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: delay, delayChildren: 0.1 } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 10, scale: 0.98 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { type: 'spring', stiffness: 300, damping: 25 },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
