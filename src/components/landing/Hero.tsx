'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FlipClock } from '@/components/timezone/FlipClock';

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-violet/5 rounded-full blur-[100px]" />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 text-center max-w-4xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.15 } },
        }}
      >
        {/* Badge */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="mb-6"
        >
          <span className="glass-pill border-primary/20 text-primary-light text-sm px-4 py-1.5">
            ✨ Scheduling made effortless
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
        >
          <span className="text-text-primary">Schedule across</span>
          <br />
          <span className="gradient-text">timezones, effortlessly</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Share one link. Everyone picks their time. No accounts needed for guests.
          See availability overlap instantly across any timezone.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <Link
            href="/signup"
            className="gradient-bg text-white px-8 py-3.5 rounded-full font-medium text-lg hover:opacity-90 transition-opacity shadow-glow"
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="glass-card px-8 py-3.5 rounded-full font-medium text-lg text-text-primary hover:bg-surface-hover transition-colors border border-white/10"
          >
            Log In
          </Link>
        </motion.div>

        {/* Flip Clock */}
        <motion.div
          variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <FlipClock />
        </motion.div>
      </motion.div>
    </section>
  );
}
