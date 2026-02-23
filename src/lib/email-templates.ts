const baseStyles = {
  bg: '#0B1120',
  card: '#151b2e',
  border: 'rgba(255,255,255,0.1)',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  primary: '#6366F1',
  violet: '#8B5CF6',
};

function emailLayout(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <body style="margin:0; padding:0; background-color:${baseStyles.bg}; font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <div style="max-width:560px; margin:0 auto; padding:40px 20px;">
        <!-- Logo -->
        <div style="text-align:center; margin-bottom:32px;">
          <span style="font-size:24px; font-weight:bold; background:linear-gradient(135deg,${baseStyles.primary},${baseStyles.violet}); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">
            Candidly
          </span>
        </div>
        <!-- Content Card -->
        <div style="background:${baseStyles.card}; border:1px solid ${baseStyles.border}; border-radius:16px; padding:32px; margin-bottom:24px;">
          ${content}
        </div>
        <!-- Footer -->
        <div style="text-align:center; color:${baseStyles.textSecondary}; font-size:12px;">
          <p>Candidly Calendar — Schedule across timezones, effortlessly</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function meetingInviteEmail(params: {
  meetingTitle: string;
  creatorName: string;
  duration: number;
  location?: string;
  description?: string;
  respondUrl: string;
  meetingUrl: string;
  proposedTimeUTC?: Date;
}): string {
  const timeSection = params.proposedTimeUTC
    ? `<p style="color:${baseStyles.text}; font-size:18px; font-weight:600; margin:16px 0;">
        ${params.proposedTimeUTC.toUTCString()}
       </p>
       <p style="color:${baseStyles.textSecondary}; font-size:13px;">
        Times shown in UTC — click below to view in your timezone
       </p>`
    : `<p style="color:${baseStyles.textSecondary}; margin:16px 0;">Multiple time options available — click below to mark your availability</p>`;

  return emailLayout(`
    <h2 style="color:${baseStyles.text}; margin:0 0 8px;">You're invited!</h2>
    <p style="color:${baseStyles.textSecondary}; margin:0 0 24px;">
      <strong style="color:${baseStyles.text};">${params.creatorName}</strong> invited you to:
    </p>
    <h1 style="color:${baseStyles.text}; font-size:24px; margin:0 0 16px;">${params.meetingTitle}</h1>
    <div style="display:flex; gap:8px; margin-bottom:16px;">
      <span style="background:rgba(99,102,241,0.2); color:#818CF8; padding:4px 12px; border-radius:20px; font-size:13px;">
        ${params.duration} min
      </span>
      ${params.location ? `<span style="background:rgba(99,102,241,0.2); color:#818CF8; padding:4px 12px; border-radius:20px; font-size:13px;">📍 ${params.location}</span>` : ''}
    </div>
    ${params.description ? `<p style="color:${baseStyles.textSecondary}; margin:0 0 24px;">${params.description}</p>` : ''}
    ${timeSection}
    <div style="margin-top:24px; text-align:center;">
      <a href="${params.respondUrl}" style="display:inline-block; background:linear-gradient(135deg,${baseStyles.primary},${baseStyles.violet}); color:white; padding:14px 32px; border-radius:12px; text-decoration:none; font-weight:600; font-size:16px;">
        Respond Now
      </a>
    </div>
    <div style="margin-top:16px; text-align:center;">
      <a href="${params.meetingUrl}" style="color:${baseStyles.primary}; text-decoration:none; font-size:13px;">
        View meeting details →
      </a>
    </div>
  `);
}

export function meetingConfirmedEmail(params: {
  meetingTitle: string;
  confirmedTimeUTC: Date;
  duration: number;
  location?: string;
  meetingUrl: string;
  icsUrl: string;
}): string {
  return emailLayout(`
    <div style="text-align:center; margin-bottom:16px;">
      <span style="font-size:48px;">✅</span>
    </div>
    <h2 style="color:${baseStyles.text}; text-align:center; margin:0 0 8px;">Meeting Confirmed!</h2>
    <h1 style="color:${baseStyles.text}; font-size:24px; text-align:center; margin:0 0 24px;">${params.meetingTitle}</h1>
    <div style="background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); border-radius:12px; padding:16px; margin-bottom:24px; text-align:center;">
      <p style="color:#10B981; font-size:18px; font-weight:600; margin:0;">
        ${params.confirmedTimeUTC.toUTCString()}
      </p>
      <p style="color:${baseStyles.textSecondary}; font-size:13px; margin:4px 0 0;">
        ${params.duration} minutes${params.location ? ` · 📍 ${params.location}` : ''}
      </p>
    </div>
    <div style="text-align:center;">
      <a href="${params.icsUrl}" style="display:inline-block; background:linear-gradient(135deg,${baseStyles.primary},${baseStyles.violet}); color:white; padding:12px 24px; border-radius:12px; text-decoration:none; font-weight:600; margin-right:8px;">
        📅 Add to Calendar
      </a>
      <a href="${params.meetingUrl}" style="display:inline-block; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:${baseStyles.text}; padding:12px 24px; border-radius:12px; text-decoration:none; font-weight:500;">
        View Details
      </a>
    </div>
  `);
}
