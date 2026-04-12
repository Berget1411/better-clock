import nodemailer from "nodemailer";
import { env } from "@open-learn/env/server";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.GMAIL_USER,
      pass: env.GMAIL_APP_PASSWORD,
    },
  });
}

export async function sendInvitationEmail({
  to,
  inviterName,
  orgName,
  inviteLink,
}: {
  to: string;
  inviterName: string;
  orgName: string;
  inviteLink: string;
}) {
  const transporter = createTransporter();
  const safeInviterName = escapeHtml(inviterName);
  const safeOrgName = escapeHtml(orgName);

  await transporter.sendMail({
    from: `"better clock" <${env.GMAIL_USER}>`,
    to,
    subject: `You've been invited to join ${orgName} on better clock`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
        <h2 style="font-size: 20px; margin-bottom: 8px;">You're invited to better clock</h2>
        <p style="margin-bottom: 16px; color: #555;">
          <strong>${safeInviterName}</strong> has invited you to join <strong>${safeOrgName}</strong>.
        </p>
        <a href="${escapeHtml(inviteLink)}"
           style="display: inline-block; padding: 10px 20px; background: #18a0a0; color: #fff;
                  text-decoration: none; font-weight: 600; border-radius: 4px;">
          Accept Invitation
        </a>
        <p style="margin-top: 20px; font-size: 12px; color: #999;">
          This invitation expires in 7 days. If you did not expect this invitation, you can ignore this email.
        </p>
      </div>
    `,
  });
}
