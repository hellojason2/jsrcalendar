'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-violet/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        className="relative z-10 text-center max-w-lg mx-auto"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.12 } },
        }}
      >
        {/* 404 number */}
        <motion.h1
          variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
          className="text-[10rem] md:text-[12rem] font-extrabold leading-none tracking-tighter gradient-text select-none"
        >
          404
        </motion.h1>

        {/* Message */}
        <motion.p
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="text-text-secondary text-lg md:text-xl mb-2 -mt-4"
        >
          Page not found
        </motion.p>

        <motion.p
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="text-text-muted text-sm mb-10"
        >
          The page you are looking for does not exist or has been moved.
        </motion.p>

        {/* Go Home button */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
        >
          <Link
            href="/"
            className="gradient-bg text-white px-8 py-3.5 rounded-full font-medium text-lg hover:opacity-90 transition-opacity shadow-glow inline-block"
          >
            Go Home
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}
