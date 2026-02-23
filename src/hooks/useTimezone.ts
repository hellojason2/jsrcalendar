'use client';
import { useContext } from 'react';
import { TimezoneContext } from '@/components/timezone/TimezoneProvider';

export function useTimezone() {
  const ctx = useContext(TimezoneContext);
  if (!ctx) throw new Error('useTimezone must be used within TimezoneProvider');
  return ctx;
}
