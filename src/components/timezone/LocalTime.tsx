'use client';
import { useTimezone } from '@/hooks/useTimezone';
import { formatInTimezone, getTimezoneAbbreviation } from '@/lib/timezone';

interface LocalTimeProps {
  utcTime: Date | string;
  format?: string;
  showTimezone?: boolean;
}

export function LocalTime({
  utcTime,
  format = 'MMM d, yyyy h:mm a',
  showTimezone = false,
}: LocalTimeProps) {
  const { timezone } = useTimezone();
  const date = typeof utcTime === 'string' ? new Date(utcTime) : utcTime;
  const formatted = formatInTimezone(date, timezone, format);
  const abbr = showTimezone ? getTimezoneAbbreviation(timezone) : '';
  return (
    <span className="tabular-nums">
      {formatted}
      {abbr && (
        <span className="text-text-secondary text-sm ml-1">({abbr})</span>
      )}
    </span>
  );
}
