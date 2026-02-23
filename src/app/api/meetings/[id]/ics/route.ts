export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateICS } from '@/lib/ics';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const meeting = await prisma.meeting.findUnique({
    where: { id: params.id },
    include: { creator: true },
  });

  if (!meeting || !meeting.confirmedTime) {
    return NextResponse.json({ error: 'Meeting not found or not confirmed' }, { status: 404 });
  }

  const ics = generateICS({
    title: meeting.title,
    description: meeting.description || undefined,
    location: meeting.location || undefined,
    startTimeUTC: meeting.confirmedTime,
    duration: meeting.duration,
    organizer: {
      name: `${meeting.creator.firstName} ${meeting.creator.lastName}`,
      email: meeting.creator.email,
    },
  });

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${meeting.title.replace(/[^a-zA-Z0-9]/g, '-')}.ics"`,
    },
  });
}
