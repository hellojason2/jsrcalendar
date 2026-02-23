'use client';

import { SessionProvider } from 'next-auth/react';
import { TimezoneProvider } from '@/components/timezone/TimezoneProvider';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TimezoneProvider>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(15, 15, 20, 0.85)',
              backdropFilter: 'blur(12px)',
              color: '#e2e8f0',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              fontSize: '14px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#0f0f14',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#0f0f14',
              },
            },
          }}
        />
      </TimezoneProvider>
    </SessionProvider>
  );
}
