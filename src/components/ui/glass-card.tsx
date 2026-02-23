'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  active?: boolean;
  onClick?: () => void;
  as?: 'div' | 'article' | 'section';
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className, hover = false, active = false, onClick, as = 'div' }, ref) => {
    if (hover) {
      return (
        <motion.div
          ref={ref}
          className={cn(
            'glass-card p-6',
            active && 'glass-card-active',
            'cursor-pointer',
            className
          )}
          onClick={onClick}
          whileHover={{ y: -2, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'glass-card p-6',
          active && 'glass-card-active',
          onClick && 'cursor-pointer',
          className
        )}
        onClick={onClick}
      >
        {children}
      </div>
    );
  }
);
GlassCard.displayName = 'GlassCard';
