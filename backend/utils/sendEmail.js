/**
 * sendEmail.js — works on Render's FREE tier
 *
 * Render's free web services BLOCK outbound SMTP (ports 25 / 465 / 587), so Gmail/SMTP
 * can never work there. This file sends over HTTPS (port 443) instead, which is allowed.
 *
 * Pick ONE provider (checked in this order):
 *
 *  1) BREVO (recommended — free 300 emails/day, can email ANY address, no domain needed)
 *       BREVO_API_KEY      xkeysib-...           (Brevo → SMTP & API → API Keys)
 *       EMAIL_FROM_EMAIL   you@gmail.com         (must be a verified Sender in Brevo)
 *       EMAIL_FROM_NAME    Chukwudi Academy      (optional)
 *
 *  2) RESEND (free 100/day, but without a verified domain it can only email YOUR OWN address)
 *       RESEND_API_KEY     re_...
 *       EMAIL_FROM         "Chukwudi Academy <onboarding@resend.dev>"
 *
 *  3) SMTP (local development only — will NOT work on Render free)
 *       EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM
 *
 *  If nothing is set, the email (with its link) is printed to the server log.
 */

import nodemailer from "nodemailer";

const FROM_NAME  = process.env.EMAIL_FROM_NAME || "Chukwudi Academy";
const HTTP_TIMEOUT_MS = 15000;

const provider =
  process.env.BREVO_API_KEY  ? "brevo"  :
  process.env.RESEND_API_KEY ? "resend" :
  (process.env.EMAIL_USER && process.env.EMAIL_PASS) ? "smtp" :
  "console";

console.log(`📧  Email provider: ${provider}`);
if (provider === "console") {
  console.warn(
    "⚠️  No email provider configured — emails will only be printed in the log. " +
    "Set BREVO_API_KEY + EMAIL_FROM_EMAIL on Render."
  );
}

// SMTP transporter only for local dev
let transporter = null;
if (provider === "smtp") {
  transporter = nodemailer.createTransport({
    host:   process.env.EMAIL_HOST || "smtp.gmail.com",
    port:   Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth:   { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    connectionTimeout: 10000,
    greetingTimeout:   10000,
    socketTimeout:     15000,
  });
}

async function postJson(url, headers, body) {
  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), HTTP_TIMEOUT_MS);
  try {
    const res  = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", ...headers },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    const text = await res.text();
    let data; try { data = JSON.parse(text); } catch { data = { raw: text }; }
    if (!res.ok) {
      throw new Error(`${res.status} ${data?.message || data?.error || data?.raw || res.statusText}`);
    }
    return data;
  } catch (err) {
    if (err.name === "AbortError") throw new Error("Email provider timed out");
    throw err;
  } finally {
    clearTimeout(timer);
  }
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

// ── sendEmail ─────────────────────────────────────────────────────────────────
export async function sendEmail({ to, subject, html }) {
  if (provider === "brevo") {
    const fromEmail = process.env.EMAIL_FROM_EMAIL || process.env.EMAIL_USER;
    if (!fromEmail) throw new Error("EMAIL_FROM_EMAIL is not set (must be a verified Brevo sender)");
    const data = await postJson(
      "https://api.brevo.com/v3/smtp/email",
      { "api-key": process.env.BREVO_API_KEY },
      {
        sender:      { name: FROM_NAME, email: fromEmail },
        to:          [{ email: to }],
        subject,
        htmlContent: html,
      }
    );
    console.log(`📧  Email sent via Brevo to ${to} — ${data.messageId}`);
    return data;
  }

  if (provider === "resend") {
    const from = process.env.EMAIL_FROM || `${FROM_NAME} <onboarding@resend.dev>`;
    const data = await postJson(
      "https://api.resend.com/emails",
      { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      { from, to: [to], subject, html }
    );
    console.log(`📧  Email sent via Resend to ${to} — ${data.id}`);
    return data;
  }

  if (provider === "smtp") {
    const from = process.env.EMAIL_FROM || `"${FROM_NAME}" <${process.env.EMAIL_USER}>`;
    const info = await transporter.sendMail({ from, to, subject, html });
    console.log(`📧  Email sent via SMTP to ${to} — ${info.messageId}`);
    return info;
  }

  // console fallback
  console.log("\n" + "═".repeat(60));
  console.log("📧  EMAIL (not sent — no provider configured)");
  console.log(`To:      ${to}`);
  console.log(`Subject: ${subject}`);
  const urlMatch = html.match(/href="(https?:\/\/[^"]+)"/);
  if (urlMatch) console.log(`Link:    ${urlMatch[1]}`);
  console.log("═".repeat(60) + "\n");
  return { messageId: "console" };
}
