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
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimezoneState(detected);
      setIsAutoDetected(true);
    } catch {
      setTimezoneState('UTC');
    }
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
