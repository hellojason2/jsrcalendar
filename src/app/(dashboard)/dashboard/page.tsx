export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { MeetingCard } from '@/components/meetings/MeetingCard';
import { AnimatedContainer, AnimatedItem } from '@/components/ui/animated-container';
import { PageTransition } from '@/components/ui/page-transition';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const userId = session.user.id;

  const [upcoming, pending, created] = await Promise.all([
    prisma.meeting.findMany({
      where: {
        status: 'CONFIRMED',
        participants: { some: { userId } },
        confirmedTime: { gte: new Date() },
      },
      include: { creator: true, participants: true },
      orderBy: { confirmedTime: 'asc' },
      take: 5,
    }),
    prisma.meeting.findMany({
      where: {
        participants: { some: { userId, status: 'PENDING' } },
        status: 'PENDING',
      },
      include: { creator: true, participants: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.meeting.findMany({
      where: { creatorId: userId },
      include: { creator: true, participants: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  return (
    <PageTransition>
      <div className="space-y-10">
        {/* Section: Upcoming */}
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-4">Upcoming Meetings</h2>
          {upcoming.length > 0 ? (
            <AnimatedContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((m) => (
                <AnimatedItem key={m.id}>
                  <MeetingCard meeting={m} />
                </AnimatedItem>
              ))}
            </AnimatedContainer>
          ) : (
            <div className="glass-card p-8 text-center text-text-secondary">
              No upcoming meetings. Create one to get started!
            </div>
          )}
        </section>

        {/* Section: Pending */}
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-4">Pending Responses</h2>
          {pending.length > 0 ? (
            <AnimatedContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pending.map((m) => (
                <AnimatedItem key={m.id}>
                  <MeetingCard meeting={m} />
                </AnimatedItem>
              ))}
            </AnimatedContainer>
          ) : (
            <div className="glass-card p-8 text-center text-text-secondary">
              No pending invitations
            </div>
          )}
        </section>

        {/* Section: Your Meetings */}
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-4">Your Meetings</h2>
          {created.length > 0 ? (
            <AnimatedContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {created.map((m) => (
                <AnimatedItem key={m.id}>
                  <MeetingCard meeting={m} />
                </AnimatedItem>
              ))}
            </AnimatedContainer>
          ) : (
            <div className="glass-card p-8 text-center">
              <p className="text-text-secondary mb-4">You haven&apos;t created any meetings yet</p>
              <Link
                href="/meetings/new"
                className="gradient-bg text-white px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Create Your First Meeting
              </Link>
            </div>
          )}
        </section>
      </div>
    </PageTransition>
  );
}
