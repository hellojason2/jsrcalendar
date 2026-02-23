'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function confirmMeeting(meetingId: string, confirmedTime: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
  if (!meeting || meeting.creatorId !== session.user.id) throw new Error('Not authorized');

  await prisma.meeting.update({
    where: { id: meetingId },
    data: {
      status: 'CONFIRMED',
      confirmedTime: new Date(confirmedTime),
    },
  });

  // TODO: send confirmation emails to all participants

  revalidatePath(`/meetings/${meetingId}`);
  revalidatePath('/m/');
  return { success: true };
}

export async function cancelMeeting(meetingId: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
  if (!meeting || meeting.creatorId !== session.user.id) throw new Error('Not authorized');

  await prisma.meeting.update({
    where: { id: meetingId },
    data: { status: 'CANCELLED' },
  });

  revalidatePath(`/meetings/${meetingId}`);
  return { success: true };
}

export async function sendReminder(meetingId: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  // Find pending participants and log reminder (email sending will be wired later)
  const pendingParticipants = await prisma.participant.findMany({
    where: { meetingId, status: 'PENDING' },
  });

  console.log(`[Reminder] Would send reminders to ${pendingParticipants.length} pending participants for meeting ${meetingId}`);

  return { success: true, count: pendingParticipants.length };
}
