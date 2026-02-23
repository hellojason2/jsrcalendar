export interface ICSEvent {
  title: string;
  description?: string;
  location?: string;
  startTimeUTC: Date;
  duration: number; // minutes
  organizer: { name: string; email: string };
}

function formatICSDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function escapeICS(text: string): string {
  return text.replace(/[\\;,\n]/g, (match) => {
    if (match === '\n') return '\\n';
    return '\\' + match;
  });
}

export function generateICS(event: ICSEvent): string {
  const endTime = new Date(event.startTimeUTC.getTime() + event.duration * 60000);
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@candidly.app`;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Candidly Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTART:${formatICSDate(event.startTimeUTC)}`,
    `DTEND:${formatICSDate(endTime)}`,
    `SUMMARY:${escapeICS(event.title)}`,
  ];

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeICS(event.description)}`);
  }
  if (event.location) {
    lines.push(`LOCATION:${escapeICS(event.location)}`);
  }

  lines.push(
    `ORGANIZER;CN=${escapeICS(event.organizer.name)}:mailto:${event.organizer.email}`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    'END:VEVENT',
    'END:VCALENDAR'
  );

  return lines.join('\r\n');
}
