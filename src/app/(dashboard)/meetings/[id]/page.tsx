import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { MeetingDetail } from '@/components/meetings/MeetingDetail';
import { PageTransition } from '@/components/ui/page-transition';

export default async function MeetingDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const meeting = await prisma.meeting.findUnique({
    where: { id: params.id },
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

  const isCreator = meeting.creatorId === session.user.id;

  return (
    <PageTransition>
      <MeetingDetail meeting={JSON.parse(JSON.stringify(meeting))} isCreator={isCreator} />
    </PageTransition>
  );
}
