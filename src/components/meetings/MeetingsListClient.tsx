'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatedContainer, AnimatedItem } from '@/components/ui/animated-container';
import { GlassCard } from '@/components/ui/glass-card';
import { MeetingCard } from './MeetingCard';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Participant {
  id: string;
  status: string;
  userId?: string | null;
  guestEmail?: string | null;
  guestName?: string | null;
  user?: { name?: string | null; email: string } | null;
}

interface MeetingData {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  duration: number;
  type: 'FIXED' | 'POLL';
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  confirmedTime?: string | null;
  proposedTime?: string | null;
  createdAt: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  participants: Participant[];
}

type TabFilter = 'all' | 'created' | 'invited';

interface MeetingsListClientProps {
  created: MeetingData[];
  invited: MeetingData[];
}

export function MeetingsListClient({ created, invited }: MeetingsListClientProps) {
  const [activeTab, setActiveTab] = useState<TabFilter>('all');

  const all = [...created, ...invited].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const meetings = activeTab === 'all' ? all : activeTab === 'created' ? created : invited;

  const tabs: { label: string; value: TabFilter; count: number }[] = [
    { label: 'All', value: 'all', count: all.length },
    { label: 'Created', value: 'created', count: created.length },
    { label: 'Invited', value: 'invited', count: invited.length },
  ];

  return (
    <div>
      {/* Tab row */}
      <div className="flex items-center gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'glass-pill border-border text-sm font-medium transition-all',
              activeTab === tab.value
                ? 'gradient-bg text-white border-transparent'
                : 'bg-surface text-text-secondary hover:bg-surface-hover hover:text-text-primary'
            )}
          >
            {tab.label}
            <span
              className={cn(
                'ml-1.5 text-xs',
                activeTab === tab.value ? 'text-white/70' : 'text-text-muted'
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Grid or empty state */}
      {meetings.length === 0 ? (
        <GlassCard className="text-center py-12">
          <p className="text-text-secondary text-base mb-2">No meetings found</p>
          <p className="text-text-muted text-sm mb-6">
            {activeTab === 'invited'
              ? "You haven't been invited to any meetings yet."
              : "You haven't created any meetings yet."}
          </p>
          <Link
            href="/meetings/new"
            className="inline-flex items-center gap-2 gradient-bg text-white font-medium text-sm px-5 py-2 rounded-lg"
          >
            <Plus className="w-4 h-4" />
            New Meeting
          </Link>
        </GlassCard>
      ) : (
        <AnimatedContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {meetings.map((meeting) => (
            <AnimatedItem key={meeting.id}>
              <MeetingCard meeting={meeting} />
            </AnimatedItem>
          ))}
        </AnimatedContainer>
      )}
    </div>
  );
}
