'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTimezone } from '@/hooks/useTimezone';
import { utcToLocal, formatInTimezone } from '@/lib/timezone';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface HeatmapParticipant {
  id: string;
  name: string;
  availabilities: Array<{
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }>;
}

interface AvailabilityHeatmapProps {
  participants: HeatmapParticipant[];
  dateRange: { start: string; end: string };
  slotSize?: number;
  onSlotClick?: (utcStart: string) => void; // For creator to confirm a time
  isCreator?: boolean;
}

function getHeatmapColor(ratio: number): string {
  if (ratio === 0) return 'rgba(99, 102, 241, 0.05)';
  if (ratio <= 0.25) return 'rgba(99, 102, 241, 0.2)';
  if (ratio <= 0.5) return 'rgba(99, 102, 241, 0.4)';
  if (ratio <= 0.75) return 'rgba(99, 102, 241, 0.6)';
  return 'rgba(99, 102, 241, 0.9)';
}

export function AvailabilityHeatmap({
  participants,
  dateRange,
  slotSize = 30,
  onSlotClick,
  isCreator = false,
}: AvailabilityHeatmapProps) {
  const { timezone } = useTimezone();
  const totalParticipants = participants.length;

  // Build heatmap data
  const heatmapData = useMemo(() => {
    const slots: Array<{
      utcStart: Date;
      key: string;
      availableCount: number;
      availableNames: string[];
      unavailableNames: string[];
    }> = [];

    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    const current = new Date(start);

    while (current < end) {
      const slotEnd = new Date(current.getTime() + slotSize * 60000);
      const availableNames: string[] = [];
      const unavailableNames: string[] = [];

      participants.forEach((p) => {
        const isAvailable = p.availabilities.some(
          (a) =>
            a.isAvailable &&
            new Date(a.startTime) <= current &&
            new Date(a.endTime) >= slotEnd
        );
        (isAvailable ? availableNames : unavailableNames).push(p.name);
      });

      slots.push({
        utcStart: new Date(current),
        key: current.toISOString(),
        availableCount: availableNames.length,
        availableNames,
        unavailableNames,
      });

      current.setTime(current.getTime() + slotSize * 60000);
    }
    return slots;
  }, [participants, dateRange, slotSize]);

  // Group by day in viewer's timezone
  const dayGroups = useMemo(() => {
    const groups = new Map<string, typeof heatmapData>();
    heatmapData.forEach((slot) => {
      const localTime = utcToLocal(slot.utcStart, timezone);
      const dayKey = localTime.toDateString();
      if (!groups.has(dayKey)) groups.set(dayKey, []);
      groups.get(dayKey)!.push(slot);
    });
    return groups;
  }, [heatmapData, timezone]);

  const days = Array.from(dayGroups.entries());

  // Time labels
  const timeLabels = useMemo(() => {
    const labels: string[] = [];
    const firstDay = days[0]?.[1];
    if (!firstDay) return labels;
    firstDay.forEach((slot) => {
      const localTime = utcToLocal(slot.utcStart, timezone);
      if (localTime.getMinutes() === 0) {
        labels.push(formatInTimezone(slot.utcStart, timezone, 'h a'));
      } else {
        labels.push('');
      }
    });
    return labels;
  }, [days, timezone]);

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="glass-card p-4 overflow-x-auto">
          <div className="inline-grid" style={{ gridTemplateColumns: `60px repeat(${days.length}, 1fr)` }}>
            {/* Day headers */}
            <div />
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

            {/* Heatmap cells */}
            {days[0]?.[1].map((_, rowIdx) => (
              <>
                <div key={`label-${rowIdx}`} className="text-text-secondary text-xs pr-2 flex items-center justify-end h-8">
                  {timeLabels[rowIdx] || ''}
                </div>
                {days.map(([dayKey, slots]) => {
                  const slot = slots[rowIdx];
                  if (!slot) return <div key={`${dayKey}-${rowIdx}`} />;
                  const ratio = totalParticipants > 0 ? slot.availableCount / totalParticipants : 0;
                  const isFullyAvailable = slot.availableCount === totalParticipants && totalParticipants > 0;

                  return (
                    <Tooltip key={slot.key}>
                      <TooltipTrigger asChild>
                        <motion.div
                          className={`h-8 mx-0.5 my-0.5 rounded border transition-all ${
                            isCreator ? 'cursor-pointer hover:ring-2 hover:ring-primary/50' : ''
                          } ${isFullyAvailable ? 'animate-glow-pulse border-primary/40' : 'border-transparent'}`}
                          style={{ backgroundColor: getHeatmapColor(ratio) }}
                          onClick={() => isCreator && onSlotClick?.(slot.key)}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: rowIdx * 0.01 }}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="bg-[#1a1f36] border-white/10 max-w-xs">
                        <div className="text-text-primary font-medium mb-1">
                          {formatInTimezone(slot.utcStart, timezone, 'h:mm a')} — {slot.availableCount}/{totalParticipants} available
                        </div>
                        {slot.availableNames.length > 0 && (
                          <div className="text-emerald-400 text-xs">
                            {slot.availableNames.join(', ')}
                          </div>
                        )}
                        {slot.unavailableNames.length > 0 && (
                          <div className="text-text-muted text-xs">
                            {slot.unavailableNames.join(', ')}
                          </div>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-sm text-text-secondary">
          <span>Less</span>
          {[0.05, 0.2, 0.4, 0.6, 0.9].map((opacity, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded"
              style={{ backgroundColor: `rgba(99, 102, 241, ${opacity})` }}
            />
          ))}
          <span>More available</span>
          <div className="ml-auto flex items-center gap-1">
            <div className="w-4 h-4 rounded border border-primary/40 animate-glow-pulse" style={{ backgroundColor: 'rgba(99,102,241,0.9)' }} />
            <span>Everyone available</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
