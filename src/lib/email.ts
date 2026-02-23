import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!resend) {
    console.log(`[Email] Would send to: ${to}`);
    console.log(`[Email] Subject: ${subject}`);
    console.log(`[Email] Preview: ${html.substring(0, 200)}...`);
    return { success: true, simulated: true };
  }

  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Candidly <noreply@candidly.app>',
      to,
      subject,
      html,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error('[Email] Failed to send:', error);
    return { success: false, error };
  }
}
