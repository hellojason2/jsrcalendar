import { prisma } from './prisma';
import { sendEmail } from './email';
import { meetingInviteEmail } from './email-templates';

export async function sendInviteEmails(meetingId: string) {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    include: {
      creator: true,
      participants: {
        where: { status: 'PENDING' },
      },
    },
  });

  if (!meeting) return;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  for (const participant of meeting.participants) {
    const email =
      participant.guestEmail ||
      (participant.userId
        ? (await prisma.user.findUnique({ where: { id: participant.userId } }))?.email
        : null);
    if (!email) continue;

    const respondUrl = `${appUrl}/respond/${participant.accessToken}`;
    const meetingUrl = `${appUrl}/m/${meeting.shareToken}`;

    await sendEmail({
      to: email,
      subject: `${meeting.creator.firstName} invited you to: ${meeting.title}`,
      html: meetingInviteEmail({
        meetingTitle: meeting.title,
        creatorName: `${meeting.creator.firstName} ${meeting.creator.lastName}`,
        duration: meeting.duration,
        location: meeting.location || undefined,
        description: meeting.description || undefined,
        respondUrl,
        meetingUrl,
        proposedTimeUTC: meeting.proposedTime || undefined,
      }),
    });
  }
}
