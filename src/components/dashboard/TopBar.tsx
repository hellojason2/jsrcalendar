'use client';

import Link from 'next/link';
import { FlipClock } from '@/components/timezone/FlipClock';
import { TimezoneSelector } from '@/components/timezone/TimezoneSelector';

export function TopBar() {
  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-[#0B1120]/60 backdrop-blur-glass">
      {/* Left: New Meeting button */}
      <Link
        href="/meetings/new"
        className="gradient-bg text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        New Meeting
      </Link>

      {/* Right: Compact clock + timezone selector */}
      <div className="flex items-center gap-4">
        <FlipClock compact={true} />
        <TimezoneSelector />
      </div>
    </header>
  );
}
