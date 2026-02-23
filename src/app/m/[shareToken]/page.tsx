export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { MeetingShareView } from '@/components/meetings/MeetingShareView';

export default async function SharePage({ params }: { params: { shareToken: string } }) {
  const meeting = await prisma.meeting.findUnique({
    where: { shareToken: params.shareToken },
    include: {
      creator: { select: { id: true, firstName: true, lastName: true, email: true } },
      participants: {
        include: {
          user: { select: { firstName: true, lastName: true } },
          availabilities: true,
        },
        orderBy: { createdAt: 'asc' },
      },
      timeSlots: { orderBy: { startTime: 'asc' } },
    },
  });

  if (!meeting) notFound();

  return <MeetingShareView meeting={JSON.parse(JSON.stringify(meeting))} />;
}
