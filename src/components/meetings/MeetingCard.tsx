'use client';

import Link from 'next/link';
import { GlassCard } from '@/components/ui/glass-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { LocalTime } from '@/components/timezone/LocalTime';

interface Participant {
  id: string;
  status: string;
  userId?: string | null;
  guestEmail?: string | null;
  guestName?: string | null;
  user?: { name?: string | null; email: string } | null;
}

interface Creator {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Meeting {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  duration: number;
  type: 'FIXED' | 'POLL';
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  confirmedTime?: Date | string | null;
  proposedTime?: Date | string | null;
  createdAt: Date | string;
  creator: Creator;
  participants: Participant[];
}

interface MeetingCardProps {
  meeting: Meeting;
}

function getMeetingStatusVariant(status: string): 'confirmed' | 'pending' | 'unavailable' {
  if (status === 'CONFIRMED') return 'confirmed';
  if (status === 'CANCELLED') return 'unavailable';
  return 'pending';
}

function getMeetingStatusLabel(status: string): string {
  if (status === 'CONFIRMED') return 'Confirmed';
  if (status === 'CANCELLED') return 'Cancelled';
  return 'Pending';
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function MeetingCard({ meeting }: MeetingCardProps) {
  const displayTime = meeting.confirmedTime ?? meeting.proposedTime;
  const creatorName = `${meeting.creator.firstName} ${meeting.creator.lastName}`;

  return (
    <Link href={`/meetings/${meeting.id}`} className="block h-full">
      <GlassCard hover={true} className="h-full flex flex-col gap-3">
        {/* Title + Status */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg text-text-primary leading-snug line-clamp-2">
            {meeting.title}
          </h3>
          <StatusBadge variant={getMeetingStatusVariant(meeting.status)} className="shrink-0 mt-0.5">
            {getMeetingStatusLabel(meeting.status)}
          </StatusBadge>
        </div>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-2">
          <span className="glass-pill border-border bg-surface text-text-secondary">
            {formatDuration(meeting.duration)}
          </span>
          <span className="glass-pill border-border bg-surface text-text-secondary">
            {meeting.participants.length} participant{meeting.participants.length !== 1 ? 's' : ''}
          </span>
          {meeting.location && (
            <span className="glass-pill border-border bg-surface text-text-secondary truncate max-w-[140px]">
              {meeting.location}
            </span>
          )}
          <span className="glass-pill border-border bg-surface text-text-muted capitalize">
            {meeting.type === 'POLL' ? 'Poll' : 'Fixed'}
          </span>
        </div>

        {/* Time */}
        <div className="mt-auto pt-2 border-t border-white/5">
          {displayTime ? (
            <p className="text-sm text-text-secondary">
              <LocalTime utcTime={displayTime} showTimezone={true} />
            </p>
          ) : (
            <p className="text-sm text-text-muted italic">No time set yet</p>
          )}
          <p className="text-xs text-text-muted mt-1">by {creatorName}</p>
        </div>
      </GlassCard>
    </Link>
  );
}
