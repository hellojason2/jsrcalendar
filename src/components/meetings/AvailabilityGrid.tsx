'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTimezone } from '@/hooks/useTimezone';
import { utcToLocal, formatInTimezone } from '@/lib/timezone';
import { Button } from '@/components/ui/button';

interface AvailabilityGridProps {
  dateRange: { start: string; end: string }; // UTC ISO strings
  slotSize?: number; // minutes, default 30
  existingAvailability?: Array<{ startTime: string; endTime: string; isAvailable: boolean }>;
  onSubmit: (slots: Array<{ startTime: string; endTime: string; isAvailable: boolean }>) => void;
  readOnly?: boolean;
  loading?: boolean;
}

interface TimeSlot {
  utcStart: Date;
  utcEnd: Date;
  key: string;
}

export function AvailabilityGrid({
  dateRange,
  slotSize = 30,
  existingAvailability = [],
  onSubmit,
  readOnly = false,
  loading = false,
}: AvailabilityGridProps) {
  const { timezone } = useTimezone();
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    existingAvailability.forEach((a) => {
      if (a.isAvailable) initial.add(new Date(a.startTime).toISOString());
    });
    return initial;
  });
  const isDragging = useRef(false);
  const dragMode = useRef<'select' | 'deselect'>('select');
  const gridRef = useRef<HTMLDivElement>(null);

  // Generate all time slots in UTC
  const allSlots = useMemo(() => {
    const slots: TimeSlot[] = [];
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    const current = new Date(start);

    while (current < end) {
      const slotEnd = new Date(current.getTime() + slotSize * 60000);
      slots.push({
        utcStart: new Date(current),
        utcEnd: slotEnd,
        key: current.toISOString(),
      });
      current.setTime(current.getTime() + slotSize * 60000);
    }
    return slots;
  }, [dateRange, slotSize]);

  // Group slots by day in user's local timezone
  const dayGroups = useMemo(() => {
    const groups = new Map<string, TimeSlot[]>();
    allSlots.forEach((slot) => {
      const localTime = utcToLocal(slot.utcStart, timezone);
      const dayKey = localTime.toDateString();
      if (!groups.has(dayKey)) groups.set(dayKey, []);
      groups.get(dayKey)!.push(slot);
    });
    return groups;
  }, [allSlots, timezone]);

  // Time labels (hours in user's timezone)
  const timeLabels = useMemo(() => {
    const labels: string[] = [];
    const firstDay = Array.from(dayGroups.values())[0];
    if (!firstDay) return labels;
    firstDay.forEach((slot) => {
      const localTime = utcToLocal(slot.utcStart, timezone);
      const minutes = localTime.getMinutes();
      if (minutes === 0) {
        labels.push(formatInTimezone(slot.utcStart, timezone, 'h a'));
      } else {
        labels.push('');
      }
    });
    return labels;
  }, [dayGroups, timezone]);

  const toggleSlot = useCallback((key: string) => {
    setSelectedSlots((prev) => {
      const next = new Set(prev);
      if (dragMode.current === 'select') {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });
  }, []);

  const handlePointerDown = useCallback((key: string) => {
    if (readOnly) return;
    isDragging.current = true;
    dragMode.current = selectedSlots.has(key) ? 'deselect' : 'select';
    toggleSlot(key);
  }, [readOnly, selectedSlots, toggleSlot]);

  const handlePointerEnter = useCallback((key: string) => {
    if (!isDragging.current || readOnly) return;
    toggleSlot(key);
  }, [readOnly, toggleSlot]);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleSubmit = useCallback(() => {
    const availabilities = Array.from(selectedSlots).map((key) => {
      const start = new Date(key);
      const end = new Date(start.getTime() + slotSize * 60000);
      return {
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        isAvailable: true,
      };
    });
    onSubmit(availabilities);
  }, [selectedSlots, slotSize, onSubmit]);

  const days = Array.from(dayGroups.entries());

  return (
    <div className="space-y-4">
      {/* Grid */}
      <div
        ref={gridRef}
        className="glass-card p-4 overflow-x-auto select-none"
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div className="inline-grid" style={{ gridTemplateColumns: `60px repeat(${days.length}, 1fr)` }}>
          {/* Header row: day names */}
          <div /> {/* Empty corner cell */}
          {days.map(([dayKey]) => {
            const date = new Date(dayKey);
            return (
              <div key={dayKey} className="text-center pb-3 px-1">
                <div className="text-text-secondary text-xs uppercase tracking-wider">
                  {date.toLocaleDateString('en', { weekday: 'short' })}
                </div>
                <div className="text-text-primary text-sm font-medium">
                  {date.toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            );
          })}

          {/* Time slots grid */}
          {days[0]?.[1].map((_, rowIdx) => (
            <>
              {/* Time label */}
              <div key={`label-${rowIdx}`} className="text-text-secondary text-xs pr-2 flex items-center justify-end h-8">
                {timeLabels[rowIdx] || ''}
              </div>
              {/* Cells for each day */}
              {days.map(([dayKey, slots]) => {
                const slot = slots[rowIdx];
                if (!slot) return <div key={`${dayKey}-${rowIdx}`} />;
                const isSelected = selectedSlots.has(slot.key);

                return (
                  <motion.div
                    key={slot.key}
                    className={`h-8 mx-0.5 my-0.5 rounded cursor-pointer transition-colors duration-100 border ${
                      isSelected
                        ? 'bg-gradient-to-r from-primary to-violet border-primary/50'
                        : 'bg-surface border-white/5 hover:bg-surface-hover hover:border-white/10'
                    }`}
                    onPointerDown={() => handlePointerDown(slot.key)}
                    onPointerEnter={() => handlePointerEnter(slot.key)}
                    whileTap={!readOnly ? { scale: 0.95 } : undefined}
                    animate={isSelected ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                    transition={{ duration: 0.15 }}
                    style={{ touchAction: 'none' }}
                  />
                );
              })}
            </>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm text-text-secondary">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-r from-primary to-violet" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-surface border border-white/10" />
          <span>Not selected</span>
        </div>
        {!readOnly && (
          <span className="text-text-muted ml-auto">Click and drag to select</span>
        )}
      </div>

      {/* Submit button */}
      {!readOnly && (
        <Button
          onClick={handleSubmit}
          disabled={selectedSlots.size === 0 || loading}
          className="w-full gradient-bg text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Submitting...' : `Submit Availability (${selectedSlots.size} slots selected)`}
        </Button>
      )}
    </div>
  );
}
