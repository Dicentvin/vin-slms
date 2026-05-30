/**
 * sendEmail.js — Nodemailer wrapper
 *
 * Add these to your Render environment variables:
 *   EMAIL_HOST     smtp.gmail.com
 *   EMAIL_PORT     587
 *   EMAIL_USER     your@gmail.com
 *   EMAIL_PASS     your-gmail-app-password  (NOT your normal password)
 *   EMAIL_FROM     "Chukwudi Academy <your@gmail.com>"
 *
 * For Gmail: Google Account → Security → 2-Step Verification → App Passwords
 * Create an app password and paste it as EMAIL_PASS.
 */

import nodemailer from "nodemailer";

// ── Detect configuration ──────────────────────────────────────────────────────
const isConfigured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);

if (!isConfigured) {
  console.warn(
    "⚠️  EMAIL_USER / EMAIL_PASS not set. " +
    "Password reset and verification emails will be logged to console instead of sent. " +
    "Add EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM to your .env"
  );
}

// ── Transporter (only created if configured) ──────────────────────────────────
let transporter = null;
if (isConfigured) {
  transporter = nodemailer.createTransport({
    host:   process.env.EMAIL_HOST || "smtp.gmail.com",
    port:   Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false, // allow self-signed certs in dev
    },
  });
}

// ── Email templates ───────────────────────────────────────────────────────────
const baseStyle = `
  font-family: 'Segoe UI', Arial, sans-serif;
  background: #0f172a;
  color: #e2e8f0;
  padding: 0;
  margin: 0;
`;

function wrap(content) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="${baseStyle}">
  <div style="max-width:560px;margin:40px auto;background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">
    <div style="background:linear-gradient(135deg,#3ecf8e,#10b981);padding:28px 32px;text-align:center;">
      <h1 style="margin:0;color:#000;font-size:22px;font-weight:800;">Chukwudi Academy</h1>
      <p style="margin:6px 0 0;color:#065f46;font-size:13px;font-weight:600;">Learning Management System</p>
    </div>
    <div style="padding:32px;">${content}</div>
    <div style="padding:20px 32px;border-top:1px solid #334155;text-align:center;">
      <p style="margin:0;color:#64748b;font-size:12px;">
        © ${new Date().getFullYear()} Chukwudi Academy. If you did not request this, please ignore it.
      </p>
    </div>
  </div>
</body>
</html>`;
}

export const emailTemplates = {
  verifyEmail: ({ name, url }) => ({
    subject: "Verify your email — Chukwudi Academy",
    html: wrap(`
      <p style="margin:0 0 8px;color:#94a3b8;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Email Verification</p>
      <h2 style="margin:0 0 16px;color:#f1f5f9;font-size:20px;font-weight:700;">Welcome, ${name}! 👋</h2>
      <p style="color:#cbd5e1;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Click the button below to verify your email address and activate your account.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="${url}" style="display:inline-block;background:#3ecf8e;color:#000;text-decoration:none;font-weight:800;font-size:15px;padding:14px 36px;border-radius:10px;">
          Verify Email Address
        </a>
      </div>
      <p style="color:#64748b;font-size:13px;text-align:center;margin:0;">Link expires in <strong style="color:#94a3b8;">24 hours</strong>.</p>
      <div style="margin:20px 0 0;padding:14px;background:#0f172a;border-radius:8px;border:1px solid #334155;">
        <p style="margin:0;color:#64748b;font-size:12px;">Or copy this link:</p>
        <p style="margin:6px 0 0;color:#3ecf8e;font-size:12px;word-break:break-all;">${url}</p>
      </div>
    `),
  }),

  resetPassword: ({ name, url }) => ({
    subject: "Reset your password — Chukwudi Academy",
    html: wrap(`
      <p style="margin:0 0 8px;color:#94a3b8;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Password Reset</p>
      <h2 style="margin:0 0 16px;color:#f1f5f9;font-size:20px;font-weight:700;">Reset your password</h2>
      <p style="color:#cbd5e1;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Hi ${name}, click the button below to create a new password. This link expires in <strong>1 hour</strong>.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="${url}" style="display:inline-block;background:#3ecf8e;color:#000;text-decoration:none;font-weight:800;font-size:15px;padding:14px 36px;border-radius:10px;">
          Reset Password
        </a>
      </div>
      <div style="margin:20px 0 0;padding:14px;background:#0f172a;border-radius:8px;border:1px solid #334155;">
        <p style="margin:0;color:#64748b;font-size:12px;">Or copy this link:</p>
        <p style="margin:6px 0 0;color:#3ecf8e;font-size:12px;word-break:break-all;">${url}</p>
      </div>
      <div style="margin:16px 0 0;padding:14px;background:#450a0a30;border-radius:8px;border:1px solid #7f1d1d50;">
        <p style="margin:0;color:#fca5a5;font-size:13px;">⚠️ If you didn't request this, you can safely ignore this email.</p>
      </div>
    `),
  }),

  passwordChanged: ({ name }) => ({
    subject: "Your password was changed — Chukwudi Academy",
    html: wrap(`
      <h2 style="margin:0 0 16px;color:#f1f5f9;font-size:20px;font-weight:700;">Password changed ✅</h2>
      <p style="color:#cbd5e1;font-size:15px;line-height:1.6;margin:0 0 16px;">
        Hi ${name}, your password was successfully updated.
      </p>
      <div style="padding:14px;background:#450a0a30;border-radius:8px;border:1px solid #7f1d1d50;">
        <p style="margin:0;color:#fca5a5;font-size:13px;">
          ⚠️ If you did <strong>not</strong> make this change, contact your school administrator immediately.
        </p>
      </div>
    `),
  }),
};

// ── sendEmail — sends real email or logs to console in dev ────────────────────
export async function sendEmail({ to, subject, html }) {
  if (!isConfigured) {
    // Dev fallback: print email details to backend console
    console.log("\n" + "═".repeat(60));
    console.log("📧  DEV EMAIL (not sent — configure EMAIL_* env vars)");
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    // Extract the reset/verify URL from the html for easy copy-paste in dev
    const urlMatch = html.match(/href="(https?:\/\/[^"]+)"/);
    if (urlMatch) console.log(`Link:    ${urlMatch[1]}`);
    console.log("═".repeat(60) + "\n");
    return { messageId: "dev-console" };
  }

  const from = process.env.EMAIL_FROM || `"Chukwudi Academy" <${process.env.EMAIL_USER}>`;
  const info = await transporter.sendMail({ from, to, subject, html });
  console.log(`📧  Email sent to ${to} — ${info.messageId}`);
  return info;
}
