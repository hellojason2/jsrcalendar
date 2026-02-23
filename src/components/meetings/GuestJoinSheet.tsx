'use client';

import { useState } from 'react';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { joinAsGuest } from '@/actions/guest';
import toast from 'react-hot-toast';

interface GuestJoinSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meetingId: string;
  onJoined: (guestToken: string, participantId: string) => void;
}

export function GuestJoinSheet({ open, onOpenChange, meetingId, onJoined }: GuestJoinSheetProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError('');

    try {
      const result = await joinAsGuest(meetingId, { name: name.trim(), email: email.trim() || undefined });
      if (result.error) {
        if (result.guestToken) {
          // Already joined, use existing token
          onJoined(result.guestToken!, '');
          onOpenChange(false);
          return;
        }
        setError(result.error);
        return;
      }
      // Store guest token in localStorage
      localStorage.setItem(`candidly_guest_${meetingId}`, result.guestToken!);
      onJoined(result.guestToken!, result.participantId!);
      toast.success('You\'ve joined the meeting!');
      onOpenChange(false);
    } catch {
      setError('Something went wrong. Please try again.');
      toast.error('Failed to join meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Join as Guest" description="No account needed — just your name">
      <form onSubmit={handleSubmit} className="space-y-4 pb-6">
        <div>
          <Label htmlFor="guest-name" className="text-text-secondary text-sm mb-1.5 block">Your Name *</Label>
          <Input
            id="guest-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="bg-surface border-border text-text-primary placeholder:text-text-muted"
            required
          />
        </div>
        <div>
          <Label htmlFor="guest-email" className="text-text-secondary text-sm mb-1.5 block">Email (optional)</Label>
          <Input
            id="guest-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Get notified when time is confirmed"
            className="bg-surface border-border text-text-primary placeholder:text-text-muted"
          />
          <p className="text-text-muted text-xs mt-1">Add your email to get notified when the meeting time is confirmed</p>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <Button
          type="submit"
          disabled={loading || !name.trim()}
          className="w-full gradient-bg text-white font-medium py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Joining...' : 'Join Meeting'}
        </Button>
      </form>
    </BottomSheet>
  );
}
