import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createMeetingSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  location: z.string().max(500).optional(),
  duration: z.number().int().min(5).max(480),
  type: z.enum(['FIXED', 'POLL']).default('POLL'),
  proposedTime: z.string().datetime().optional(),
  dateRangeStart: z.string().datetime().optional(),
  dateRangeEnd: z.string().datetime().optional(),
  invitees: z.array(z.string().email()).default([]),
  openLink: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = createMeetingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const data = parsed.data;
  const creatorId = session.user.id;

  const meeting = await prisma.$transaction(async (tx) => {
    const created = await tx.meeting.create({
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        duration: data.duration,
        type: data.type,
        status: 'PENDING',
        proposedTime: data.proposedTime ? new Date(data.proposedTime) : undefined,
        dateRangeStart: data.dateRangeStart ? new Date(data.dateRangeStart) : undefined,
        dateRangeEnd: data.dateRangeEnd ? new Date(data.dateRangeEnd) : undefined,
        creatorId,
      },
    });

    // Create time slots for POLL type with date range
    if (data.type === 'POLL' && data.dateRangeStart && data.dateRangeEnd) {
      const start = new Date(data.dateRangeStart);
      const end = new Date(data.dateRangeEnd);
      // Create one slot per day in the range
      const slots: { meetingId: string; startTime: Date; endTime: Date }[] = [];
      const current = new Date(start);
      while (current <= end) {
        const slotEnd = new Date(current);
        slotEnd.setHours(slotEnd.getHours() + Math.ceil(data.duration / 60));
        slots.push({
          meetingId: created.id,
          startTime: new Date(current),
          endTime: slotEnd,
        });
        current.setDate(current.getDate() + 1);
      }
      if (slots.length > 0) {
        await tx.timeSlot.createMany({ data: slots });
      }
    }

    // Add creator as a participant
    await tx.participant.create({
      data: {
        meetingId: created.id,
        userId: creatorId,
        status: 'RESPONDED',
        isGuest: false,
      },
    });

    // Add invitees as participants
    for (const email of data.invitees) {
      // Try to find existing user by email
      const existingUser = await tx.user.findUnique({ where: { email } });
      if (existingUser) {
        await tx.participant.upsert({
          where: { meetingId_userId: { meetingId: created.id, userId: existingUser.id } },
          create: {
            meetingId: created.id,
            userId: existingUser.id,
            status: 'PENDING',
            isGuest: false,
          },
          update: {},
        });
      } else {
        // Guest participant
        await tx.participant.upsert({
          where: { meetingId_guestEmail: { meetingId: created.id, guestEmail: email } },
          create: {
            meetingId: created.id,
            guestEmail: email,
            status: 'PENDING',
            isGuest: true,
          },
          update: {},
        });
      }
    }

    return tx.meeting.findUnique({
      where: { id: created.id },
      include: { creator: true, participants: true, timeSlots: true },
    });
  });

  return NextResponse.json(meeting, { status: 201 });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  const meetings = await prisma.meeting.findMany({
    where: {
      OR: [{ creatorId: userId }, { participants: { some: { userId } } }],
    },
    include: { creator: true, participants: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(meetings);
}
