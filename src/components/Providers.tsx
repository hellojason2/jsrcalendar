'use client';

import { SessionProvider } from 'next-auth/react';
import { TimezoneProvider } from '@/components/timezone/TimezoneProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TimezoneProvider>
        {children}
      </TimezoneProvider>
    </SessionProvider>
  );
}
