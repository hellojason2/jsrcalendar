'use server';

import { prisma } from '@/lib/prisma';
import { guestJoinSchema } from '@/lib/validators';
import { revalidatePath } from 'next/cache';

export async function joinAsGuest(meetingId: string, formData: { name: string; email?: string }) {
  const data = guestJoinSchema.parse(formData);

  if (data.email) {
    const existing = await prisma.participant.findFirst({
      where: { meetingId, guestEmail: data.email },
    });
    if (existing) {
      return { error: 'This email has already joined this meeting', guestToken: existing.guestToken };
    }
  }

  const participant = await prisma.participant.create({
    data: {
      meetingId,
      guestName: data.name,
      guestEmail: data.email || null,
      isGuest: true,
      timezone: 'UTC',
    },
  });

  revalidatePath('/m/');
  return { guestToken: participant.guestToken, participantId: participant.id };
}
