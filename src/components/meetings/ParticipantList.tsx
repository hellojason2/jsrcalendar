'use client';

import { motion } from 'framer-motion';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Participant {
  id: string;
  userId?: string | null;
  guestName?: string | null;
  isGuest: boolean;
  status: string;
  timezone: string;
  respondedAt?: string | null;
  user?: { firstName: string; lastName: string } | null;
}

interface ParticipantListProps {
  participants: Participant[];
  creatorId: string;
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getParticipantName(p: Participant) {
  if (p.user) return `${p.user.firstName} ${p.user.lastName}`;
  return p.guestName || 'Unknown';
}

export function ParticipantList({ participants, creatorId }: ParticipantListProps) {
  return (
    <TooltipProvider>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {participants.map((p, i) => {
          const name = getParticipantName(p);
          const variant = p.userId === creatorId
            ? 'creator'
            : p.isGuest
            ? 'guest'
            : p.status === 'RESPONDED' || p.status === 'AVAILABLE'
            ? 'responded'
            : p.status === 'UNAVAILABLE'
            ? 'unavailable'
            : 'pending';

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
            >
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center gap-2 glass-card px-3 py-2 rounded-full whitespace-nowrap">
                    {/* Avatar */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                      variant === 'creator' ? 'bg-primary/30 text-primary-light' :
                      variant === 'guest' ? 'bg-violet-500/30 text-violet-300' :
                      'bg-surface-active text-text-secondary'
                    }`}>
                      {variant === 'creator' ? '👑' : getInitials(name)}
                    </div>
                    <span className="text-sm text-text-primary">{name}</span>
                    <StatusBadge variant={variant as 'creator' | 'confirmed' | 'pending' | 'guest' | 'responded' | 'unavailable'} showDot={false}>
                      {variant === 'creator' ? 'Creator' : variant === 'guest' ? 'Guest' : p.status.toLowerCase()}
                    </StatusBadge>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-[#1a1f36] border-white/10 text-text-primary">
                  <p>{p.timezone}</p>
                  {p.respondedAt && <p className="text-text-secondary text-xs">Responded {new Date(p.respondedAt).toLocaleDateString()}</p>}
                </TooltipContent>
              </Tooltip>
            </motion.div>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
