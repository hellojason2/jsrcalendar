'use server';

import { prisma } from '@/lib/prisma';
import { submitAvailabilitySchema } from '@/lib/validators';
import { revalidatePath } from 'next/cache';

export async function submitAvailability(
  participantId: string,
  guestToken: string | null,
  data: { timezone: string; availabilities: Array<{ startTime: string; endTime: string; isAvailable: boolean }> }
) {
  const validated = submitAvailabilitySchema.parse(data);

  // Find participant by ID or guest token
  const participant = await prisma.participant.findFirst({
    where: participantId
      ? { id: participantId }
      : guestToken
      ? { guestToken }
      : undefined,
  });

  if (!participant) throw new Error('Participant not found');

  // Transaction: clear old, insert new, update status
  await prisma.$transaction([
    prisma.availability.deleteMany({ where: { participantId: participant.id } }),
    ...validated.availabilities.map((slot) =>
      prisma.availability.create({
        data: {
          participantId: participant.id,
          userId: participant.userId,
          startTime: new Date(slot.startTime),
          endTime: new Date(slot.endTime),
          isAvailable: slot.isAvailable,
        },
      })
    ),
    prisma.participant.update({
      where: { id: participant.id },
      data: {
        status: 'RESPONDED',
        timezone: validated.timezone,
        respondedAt: new Date(),
      },
    }),
  ]);

  revalidatePath('/m/');
  return { success: true };
}
