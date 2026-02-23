export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { MeetingsListClient } from '@/components/meetings/MeetingsListClient';
import { PageTransition } from '@/components/ui/page-transition';

export default async function MeetingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const userId = session.user.id;

  const [created, invited] = await Promise.all([
    prisma.meeting.findMany({
      where: { creatorId: userId },
      include: { creator: true, participants: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.meeting.findMany({
      where: {
        participants: { some: { userId } },
        creatorId: { not: userId },
      },
      include: { creator: true, participants: true },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return (
    <PageTransition>
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-8">Meetings</h1>
        <MeetingsListClient
          created={JSON.parse(JSON.stringify(created))}
          invited={JSON.parse(JSON.stringify(invited))}
        />
      </div>
    </PageTransition>
  );
}
