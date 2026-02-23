'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';

export interface TimezoneContextType {
  timezone: string;
  setTimezone: (tz: string) => void;
  isAutoDetected: boolean;
}

export const TimezoneContext = createContext<TimezoneContextType | null>(null);

export function TimezoneProvider({ children }: { children: ReactNode }) {
  const [timezone, setTimezoneState] = useState('UTC');
  const [isAutoDetected, setIsAutoDetected] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('candidly_timezone');
    if (saved) {
      setTimezoneState(saved);
      setIsAutoDetected(false);
      return;
    }

    // Detect timezone by IP address, fall back to browser Intl API
    async function detectTimezone() {
      // Try multiple IP geolocation APIs for reliability
      const ipApis = [
        { url: 'https://ipapi.co/json/', extract: (d: Record<string, string>) => d.timezone },
        { url: 'https://ipwho.is/', extract: (d: Record<string, Record<string, string>>) => d.timezone?.id },
      ];

      for (const api of ipApis) {
        try {
          const res = await fetch(api.url, { signal: AbortSignal.timeout(3000) });
          if (res.ok) {
            const data = await res.json();
            const tz = api.extract(data);
            if (tz) {
              setTimezoneState(tz);
              setIsAutoDetected(true);
              return;
            }
          }
        } catch {
          // This API failed, try next one
        }
      }

      // All IP APIs failed, fall back to browser detection
      try {
        const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setTimezoneState(detected);
      } catch {
        setTimezoneState('UTC');
      }
      setIsAutoDetected(true);
    }

    detectTimezone();
  }, []);

  const setTimezone = (tz: string) => {
    setTimezoneState(tz);
    setIsAutoDetected(false);
    localStorage.setItem('candidly_timezone', tz);
  };

  return (
    <TimezoneContext.Provider value={{ timezone, setTimezone, isAutoDetected }}>
      {children}
    </TimezoneContext.Provider>
  );
}
