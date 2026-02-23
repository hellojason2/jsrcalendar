'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { FlipClock } from '@/components/timezone/FlipClock';
import { LocalTime } from '@/components/timezone/LocalTime';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedContainer, AnimatedItem } from '@/components/ui/animated-container';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { ParticipantList } from '@/components/meetings/ParticipantList';
import { GuestJoinSheet } from '@/components/meetings/GuestJoinSheet';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

interface Participant {
  id: string;
  userId?: string | null;
  guestName?: string | null;
  guestEmail?: string | null;
  isGuest: boolean;
  status: string;
  timezone: string;
  respondedAt?: string | null;
  guestToken?: string | null;
  user?: { firstName: string; lastName: string } | null;
  availabilities: unknown[];
}

interface Meeting {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  duration: number;
  type: 'FIXED' | 'POLL';
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  proposedTime?: string | null;
  confirmedTime?: string | null;
  shareToken: string;
  creatorId: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  participants: Participant[];
  timeSlots: TimeSlot[];
}

interface MeetingShareViewProps {
  meeting: Meeting;
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function MeetingShareView({ meeting }: MeetingShareViewProps) {
  const { data: session } = useSession();
  const [guestJoinOpen, setGuestJoinOpen] = useState(false);
  const [guestToken, setGuestToken] = useState<string | null>(null);
  const [guestParticipant, setGuestParticipant] = useState<Participant | null>(null);
  const [copied, setCopied] = useState(false);

  // On mount, check localStorage for existing guest token
  useEffect(() => {
    const stored = localStorage.getItem(`candidly_guest_${meeting.id}`);
    if (stored) {
      setGuestToken(stored);
      const found = meeting.participants.find(p => p.guestToken === stored);
      if (found) setGuestParticipant(found);
    }
  }, [meeting.id, meeting.participants]);

  // Determine if current user is already a participant
  const isLoggedInParticipant = session?.user?.id
    ? meeting.participants.some(p => p.userId === session.user.id)
    : false;

  const isAlreadyParticipant = isLoggedInParticipant || !!guestToken;
  const isCreator = session?.user?.id === meeting.creatorId;

  const handleJoined = (token: string, participantId: string) => {
    setGuestToken(token);
    const found = meeting.participants.find(p => p.id === participantId || p.guestToken === token);
    if (found) setGuestParticipant(found);
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/m/${meeting.shareToken}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayTime = meeting.confirmedTime || meeting.proposedTime;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        <AnimatedContainer>
          {/* Header row: meeting info + FlipClock */}
          <AnimatedItem>
            <GlassCard className="!p-0 overflow-hidden">
              <div className="flex flex-col md:flex-row gap-6 p-6">
                {/* Left: Meeting info */}
                <div className="flex-1 space-y-4">
                  {/* Status badge */}
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      variant={
                        meeting.status === 'CONFIRMED' ? 'confirmed'
                        : meeting.status === 'CANCELLED' ? 'unavailable'
                        : 'pending'
                      }
                    >
                      {meeting.status.toLowerCase()}
                    </StatusBadge>
                    <StatusBadge variant="pending">
                      {meeting.type === 'FIXED' ? 'fixed time' : 'poll'}
                    </StatusBadge>
                  </div>

                  {/* Title */}
                  <h1 className="text-3xl font-bold text-text-primary leading-tight">
                    {meeting.title}
                  </h1>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-3 text-sm text-text-secondary">
                    <span>
                      Hosted by{' '}
                      <span className="text-text-primary font-medium">
                        {meeting.creator.firstName} {meeting.creator.lastName}
                      </span>
                    </span>
                  </div>

                  {/* Badges row */}
                  <div className="flex flex-wrap gap-2">
                    <span className="glass-pill text-xs text-text-secondary border border-border">
                      {formatDuration(meeting.duration)}
                    </span>
                    {meeting.location && (
                      <span className="glass-pill text-xs text-text-secondary border border-border">
                        {meeting.location}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {meeting.description && (
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {meeting.description}
                    </p>
                  )}
                </div>

                {/* Right: FlipClock */}
                <div className="flex items-center justify-center md:justify-end">
                  <FlipClock compact />
                </div>
              </div>
            </GlassCard>
          </AnimatedItem>

          {/* Participants */}
          <AnimatedItem>
            <GlassCard>
              <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-4">
                Participants ({meeting.participants.length})
              </h2>
              {meeting.participants.length > 0 ? (
                <ParticipantList
                  participants={meeting.participants.map(p => ({
                    ...p,
                    respondedAt: p.respondedAt ?? null,
                  }))}
                  creatorId={meeting.creatorId}
                />
              ) : (
                <p className="text-text-muted text-sm">No participants yet. Be the first to join!</p>
              )}
            </GlassCard>
          </AnimatedItem>

          {/* Guest welcome back or join prompt */}
          {!isCreator && (
            <AnimatedItem>
              <GlassCard>
                {guestParticipant ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-primary font-medium">
                        Welcome back, {guestParticipant.guestName}!
                      </p>
                      <p className="text-text-secondary text-sm mt-0.5">
                        You&apos;re already part of this meeting.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="border-border text-text-primary hover:bg-surface-hover"
                    >
                      Edit Response
                    </Button>
                  </div>
                ) : !isAlreadyParticipant ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-primary font-medium">Want to join this meeting?</p>
                      <p className="text-text-secondary text-sm mt-0.5">
                        No account needed — just enter your name.
                      </p>
                    </div>
                    <Button
                      onClick={() => setGuestJoinOpen(true)}
                      className="gradient-bg text-white font-medium hover:opacity-90 transition-opacity"
                    >
                      Join as Guest
                    </Button>
                  </div>
                ) : (
                  <p className="text-text-secondary text-sm">You&apos;re a participant in this meeting.</p>
                )}
              </GlassCard>
            </AnimatedItem>
          )}

          {/* Availability / Time section */}
          <AnimatedItem>
            <GlassCard>
              <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-4">
                {meeting.type === 'FIXED' ? 'Proposed Time' : 'Availability'}
              </h2>

              {meeting.type === 'FIXED' ? (
                <div className="space-y-4">
                  {displayTime ? (
                    <>
                      <div className="text-text-primary text-lg font-medium">
                        <LocalTime utcTime={displayTime} showTimezone />
                      </div>
                      {isAlreadyParticipant && meeting.status !== 'CONFIRMED' && (
                        <div className="flex gap-3">
                          <Button className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors">
                            Available
                          </Button>
                          <Button
                            variant="outline"
                            className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                          >
                            Unavailable
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-text-muted text-sm">No time proposed yet.</p>
                  )}
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-text-muted text-sm border border-dashed border-border rounded-lg">
                  Availability grid coming soon
                </div>
              )}
            </GlassCard>
          </AnimatedItem>

          {/* Share link */}
          <AnimatedItem>
            <div className="flex justify-end">
              <motion.button
                onClick={handleCopyLink}
                className="flex items-center gap-2 glass-pill text-sm text-text-secondary border border-border hover:border-border-hover hover:text-text-primary transition-colors px-4 py-2"
                whileTap={{ scale: 0.97 }}
              >
                {copied ? (
                  <>
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <span>Share Link</span>
                  </>
                )}
              </motion.button>
            </div>
          </AnimatedItem>
        </AnimatedContainer>
      </div>

      <GuestJoinSheet
        open={guestJoinOpen}
        onOpenChange={setGuestJoinOpen}
        meetingId={meeting.id}
        onJoined={handleJoined}
      />
    </div>
  );
}
