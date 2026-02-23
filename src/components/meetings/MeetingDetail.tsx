'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { GlassCard } from '@/components/ui/glass-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { LocalTime } from '@/components/timezone/LocalTime';
import { FlipClock } from '@/components/timezone/FlipClock';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { confirmMeeting, cancelMeeting, sendReminder } from '@/actions/meeting';
import { AnimatedContainer, AnimatedItem } from '@/components/ui/animated-container';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Meeting = any;

interface MeetingDetailProps {
  meeting: Meeting;
  isCreator: boolean;
}

export function MeetingDetail({ meeting, isCreator }: MeetingDetailProps) {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/m/${meeting.shareToken}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Share link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = async () => {
    if (!selectedTime) return;
    setLoading(true);
    try {
      await confirmMeeting(meeting.id, selectedTime);
      toast.success('Meeting time confirmed!');
      setConfirmDialogOpen(false);
    } catch (e) {
      console.error(e);
      toast.error('Failed to confirm meeting');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      await cancelMeeting(meeting.id);
      toast.success('Meeting cancelled');
      setCancelDialogOpen(false);
    } catch (e) {
      console.error(e);
      toast.error('Failed to cancel meeting');
    } finally {
      setLoading(false);
    }
  };

  const handleReminder = async () => {
    try {
      const result = await sendReminder(meeting.id);
      toast.success(`Reminder sent to ${result.count} pending participants`);
    } catch {
      toast.error('Failed to send reminder');
    }
  };

  const respondedCount = meeting.participants.filter((p: Meeting) => p.status === 'RESPONDED' || p.status === 'AVAILABLE').length;
  const pendingCount = meeting.participants.filter((p: Meeting) => p.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Header with clock */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-text-primary">{meeting.title}</h1>
            <StatusBadge variant={meeting.status === 'CONFIRMED' ? 'confirmed' : meeting.status === 'CANCELLED' ? 'unavailable' : 'pending'}>
              {meeting.status}
            </StatusBadge>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="glass-pill border-white/10 text-text-secondary">
              {meeting.duration} min
            </span>
            <span className="glass-pill border-white/10 text-text-secondary">
              {meeting.type === 'POLL' ? 'Poll' : 'Fixed'}
            </span>
            {meeting.location && (
              <span className="glass-pill border-white/10 text-text-secondary">
                {meeting.location}
              </span>
            )}
            <span className="glass-pill border-white/10 text-text-secondary">
              {meeting.participants.length} invited
            </span>
          </div>
          {meeting.description && (
            <p className="text-text-secondary">{meeting.description}</p>
          )}
          {meeting.confirmedTime && (
            <div className="mt-4 glass-card p-4 border-emerald-500/30 bg-emerald-500/5">
              <p className="text-emerald-400 font-medium mb-1">Confirmed Time</p>
              <p className="text-text-primary text-xl font-semibold">
                <LocalTime utcTime={meeting.confirmedTime} showTimezone />
              </p>
            </div>
          )}
        </div>
        <div className="hidden md:block">
          <FlipClock compact />
        </div>
      </div>

      {/* Participants */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Participants</h2>
          <div className="flex gap-2 text-sm">
            <span className="text-emerald-400">{respondedCount} responded</span>
            <span className="text-text-muted">·</span>
            <span className="text-amber-400">{pendingCount} pending</span>
          </div>
        </div>

        {/* Participant table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-text-secondary text-sm font-medium pb-3 pr-4">Name</th>
                <th className="text-left text-text-secondary text-sm font-medium pb-3 pr-4">Status</th>
                <th className="text-left text-text-secondary text-sm font-medium pb-3 pr-4">Timezone</th>
                <th className="text-left text-text-secondary text-sm font-medium pb-3">Responded</th>
              </tr>
            </thead>
            <tbody>
              {meeting.participants.map((p: Meeting) => {
                const name = p.user ? `${p.user.firstName} ${p.user.lastName}` : p.guestName || 'Unknown';
                const isCreatorParticipant = p.userId === meeting.creatorId;
                const variant = isCreatorParticipant ? 'creator' : p.isGuest ? 'guest' : p.status === 'RESPONDED' || p.status === 'AVAILABLE' ? 'responded' : p.status === 'UNAVAILABLE' ? 'unavailable' : 'pending';

                return (
                  <tr key={p.id} className="border-b border-white/5">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                          isCreatorParticipant ? 'bg-primary/20 text-primary-light' : p.isGuest ? 'bg-violet-500/20 text-violet-300' : 'bg-surface-active text-text-secondary'
                        }`}>
                          {isCreatorParticipant ? '👑' : name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-text-primary font-medium">{name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge variant={variant as 'creator' | 'confirmed' | 'pending' | 'guest' | 'responded' | 'unavailable'}>
                        {isCreatorParticipant ? 'Creator' : p.isGuest ? 'Guest' : p.status.toLowerCase().replace('_', ' ')}
                      </StatusBadge>
                    </td>
                    <td className="py-3 pr-4 text-text-secondary text-sm">{p.timezone}</td>
                    <td className="py-3 text-text-secondary text-sm">
                      {p.respondedAt ? new Date(p.respondedAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Heatmap placeholder */}
      {meeting.type === 'POLL' && (
        <GlassCard>
          <h2 className="text-lg font-semibold text-text-primary mb-4">Availability Overview</h2>
          <div className="text-center py-12 text-text-muted">
            {respondedCount > 0
              ? 'Availability heatmap will display here when integrated'
              : 'Waiting for participants to respond...'}
          </div>
        </GlassCard>
      )}

      {/* Action buttons */}
      {isCreator && meeting.status === 'PENDING' && (
        <AnimatedContainer className="flex flex-wrap gap-3">
          <AnimatedItem>
            <Button
              onClick={() => setConfirmDialogOpen(true)}
              className="gradient-bg text-white hover:opacity-90"
            >
              Confirm Time
            </Button>
          </AnimatedItem>
          <AnimatedItem>
            <Button
              variant="outline"
              onClick={handleReminder}
              className="border-white/10 text-text-primary hover:bg-surface-hover"
            >
              Send Reminder
            </Button>
          </AnimatedItem>
          <AnimatedItem>
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="border-white/10 text-text-primary hover:bg-surface-hover"
            >
              {copied ? 'Copied!' : 'Copy Share Link'}
            </Button>
          </AnimatedItem>
          {meeting.status === 'CONFIRMED' && (
            <AnimatedItem>
              <a
                href={`/api/meetings/${meeting.id}/ics`}
                className="inline-flex items-center px-4 py-2 rounded-lg border border-white/10 text-text-primary hover:bg-surface-hover transition-colors"
              >
                Download .ics
              </a>
            </AnimatedItem>
          )}
          <AnimatedItem>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(true)}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              Cancel Meeting
            </Button>
          </AnimatedItem>
        </AnimatedContainer>
      )}

      {/* Confirm Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="bg-[#0B1120] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-text-primary">Confirm Meeting Time</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-text-secondary text-sm mb-2 block">Select date and time</label>
            <input
              type="datetime-local"
              className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2.5 text-text-primary"
              onChange={(e) => setSelectedTime(new Date(e.target.value).toISOString())}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)} className="border-white/10 text-text-primary">
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={!selectedTime || loading} className="gradient-bg text-white">
              {loading ? 'Confirming...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="bg-[#0B1120] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-text-primary">Cancel Meeting</DialogTitle>
          </DialogHeader>
          <p className="text-text-secondary py-4">Are you sure you want to cancel this meeting? All participants will be notified.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)} className="border-white/10 text-text-primary">
              Keep Meeting
            </Button>
            <Button onClick={handleCancel} disabled={loading} className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30">
              {loading ? 'Cancelling...' : 'Cancel Meeting'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
