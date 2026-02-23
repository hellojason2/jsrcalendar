'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTimezone } from '@/hooks/useTimezone';
import {
  getTimezoneCityName,
  getTimezoneOffset,
  getTimezoneAbbreviation,
} from '@/lib/timezone';

interface FlipDigitProps {
  digit: string;
  compact?: boolean;
}

function FlipDigit({ digit, compact }: FlipDigitProps) {
  return (
    <div className={`relative overflow-hidden ${compact ? 'w-[0.6em]' : 'w-[0.6em]'}`}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={digit}
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="block"
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

interface FlipColonProps {
  compact?: boolean;
}

function FlipColon({ compact }: FlipColonProps) {
  return (
    <motion.span
      className={`${compact ? 'mx-0.5' : 'mx-1'} select-none`}
      animate={{ opacity: [1, 0.3, 1] }}
      transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
    >
      :
    </motion.span>
  );
}

function getTimePartsInTimezone(timezone: string): {
  hours: string;
  minutes: string;
  seconds: string;
  ampm: string;
} {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  const parts = formatter.formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
  return {
    hours: get('hour'),
    minutes: get('minute'),
    seconds: get('second'),
    ampm: get('dayPeriod'),
  };
}

interface FlipClockProps {
  compact?: boolean;
}

export function FlipClock({ compact = false }: FlipClockProps) {
  const { timezone } = useTimezone();
  const [timeParts, setTimeParts] = useState(() => getTimePartsInTimezone(timezone));

  useEffect(() => {
    setTimeParts(getTimePartsInTimezone(timezone));
    const id = setInterval(() => {
      setTimeParts(getTimePartsInTimezone(timezone));
    }, 1000);
    return () => clearInterval(id);
  }, [timezone]);

  const cityName = getTimezoneCityName(timezone);
  const offset = getTimezoneOffset(timezone);
  const abbreviation = getTimezoneAbbreviation(timezone);

  const digitClass = compact
    ? 'text-3xl font-extralight tabular-nums tracking-tight text-text-primary'
    : 'text-6xl md:text-7xl font-extralight tabular-nums tracking-tight text-text-primary';

  const hourDigits = timeParts.hours.split('');
  const minuteDigits = timeParts.minutes.split('');
  const secondDigits = timeParts.seconds.split('');

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Glow background */}
      {!compact && (
        <div
          className="absolute pointer-events-none"
          style={{
            width: '400px',
            height: '200px',
            background:
              'radial-gradient(ellipse at center, rgba(99,102,241,0.08) 0%, transparent 70%)',
            transform: 'translateY(-20px)',
          }}
        />
      )}

      {/* Clock digits */}
      <div className={`relative flex items-center ${digitClass} font-sans`}>
        {/* Hours */}
        {hourDigits.map((d, i) => (
          <FlipDigit key={`h${i}`} digit={d} compact={compact} />
        ))}

        <FlipColon compact={compact} />

        {/* Minutes */}
        {minuteDigits.map((d, i) => (
          <FlipDigit key={`m${i}`} digit={d} compact={compact} />
        ))}

        {/* Seconds (hidden in compact mode) */}
        {!compact && (
          <>
            <FlipColon />
            {secondDigits.map((d, i) => (
              <FlipDigit key={`s${i}`} digit={d} />
            ))}
          </>
        )}

        {/* AM/PM badge */}
        <motion.span
          key={timeParts.ampm}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`
            ml-2 self-start mt-1 px-2 py-0.5 rounded-full
            text-xs font-medium uppercase tracking-wider
            gradient-bg text-white
            ${compact ? 'text-[10px]' : 'text-xs'}
          `}
        >
          {timeParts.ampm}
        </motion.span>
      </div>

      {/* Timezone info badge */}
      <div
        className="
          glass-pill
          flex items-center gap-1.5
          text-xs uppercase tracking-widest text-text-secondary
          border-border
          bg-surface
        "
      >
        <span>🌏</span>
        <span>{cityName}</span>
        <span className="text-text-muted">·</span>
        <span>{offset}</span>
        <span className="text-text-muted">·</span>
        <span>{abbreviation}</span>
      </div>
    </div>
  );
}
