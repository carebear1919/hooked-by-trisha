import "server-only";

import { Resend } from "resend";
import { renderEmailLayout } from "./email-template";

const FROM = process.env.EMAIL_FROM ?? "Handmade Crochet Co. <onboarding@resend.dev>";

export async function sendMagicLinkEmail(to: string, url: string) {
  await sendEmail({
    to,
    subject: "Your Handmade Crochet Co. admin login link",
    html: renderEmailLayout({
      preheader: "Your secure login link, valid for 15 minutes.",
      heading: "Your admin login link",
      bodyHtml: `
        <p>Click below to log in to the Handmade Crochet Co. admin panel. This link expires in 15 minutes.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
      ctaLabel: "Log In to Admin",
      ctaHref: url,
    }),
  });
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn(`[mailer] RESEND_API_KEY not set — printing email instead of sending it:\nTo: ${to}\nSubject: ${subject}\n${html}`);
    return false;
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({ from: FROM, to, subject, html });
  if (error) {
    console.error("[mailer] Failed to send email:", error);
    return false;
  }
  return true;
}
