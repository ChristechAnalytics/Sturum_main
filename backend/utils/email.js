const nodemailer = require("nodemailer");

const appName = () => process.env.APP_NAME || "Sturum";
const EMAIL_SEND_TIMEOUT_MS = 15_000;

const getSmtpUser = () => process.env.SMTP_USER?.trim();
const getSmtpPass = () => (process.env.SMTP_PASS || "").replace(/\s/g, "");
const getResendApiKey = () => process.env.RESEND_API_KEY?.trim();

const isGmailSmtp = () => {
  if (process.env.SMTP_SERVICE === "gmail") return true;
  const host = (process.env.SMTP_HOST || "").toLowerCase();
  return host === "smtp.gmail.com" || host.endsWith(".gmail.com");
};

const isSmtpConfigured = () => {
  const hasAuth = Boolean(getSmtpUser() && getSmtpPass());
  if (!hasAuth) return false;
  if (isGmailSmtp()) return true;
  return Boolean(process.env.SMTP_HOST);
};

const isResendConfigured = () => Boolean(getResendApiKey());

/** Resend HTTP API is recommended for Render/Vercel; Gmail SMTP is fine for local dev. */
const isEmailConfigured = () => isResendConfigured() || isSmtpConfigured();

const getEmailProvider = () => {
  if (isResendConfigured()) return "resend";
  if (isSmtpConfigured()) return "smtp";
  return "none";
};

const getTransporter = () => {
  const auth = { user: getSmtpUser(), pass: getSmtpPass() };
  const timeouts = {
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  };

  if (isGmailSmtp()) {
    return nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      family: 4, // Render cannot reach Gmail over IPv6 (ENETUNREACH)
      auth,
      ...timeouts,
    });
  }

  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === "true";

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth,
    ...timeouts,
    ...(port === 587 && !secure ? { requireTLS: true } : {}),
  });
};

const getFromAddress = () => {
  if (isResendConfigured()) {
    return process.env.RESEND_FROM || `${appName()} <onboarding@resend.dev>`;
  }
  return process.env.SMTP_FROM || `${appName()} <${getSmtpUser()}>`;
};

const buildSignupEmailHtml = ({ name, verifyUrl }) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 560px; margin: 0 auto; padding: 24px;">
  <h1 style="color: #424242; margin-bottom: 8px;">Welcome to ${appName()}, ${name}!</h1>
  <p>Your account has been created. Please confirm your email address to get the most out of ${appName()}.</p>
  <p style="margin: 28px 0;">
    <a href="${verifyUrl}" style="background: #2563eb; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify my email</a>
  </p>
  <p style="font-size: 14px; color: #666;">This link expires in 24 hours. If the button does not work, copy and paste this URL into your browser:</p>
  <p style="font-size: 13px; word-break: break-all; color: #555;">${verifyUrl}</p>
  <p style="font-size: 14px; color: #888; margin-top: 32px;">If you did not create this account, you can ignore this email.</p>
</body>
</html>
`;

const buildEmailContent = ({ name, verifyUrl }) => {
  const subject = `Welcome to ${appName()} — verify your email`;
  const text = [
    `Welcome to ${appName()}, ${name}!`,
    "",
    "Your account has been created. Verify your email by opening this link (expires in 24 hours):",
    verifyUrl,
    "",
    "If you did not create this account, ignore this email.",
  ].join("\n");
  const html = buildSignupEmailHtml({ name, verifyUrl });
  return { subject, text, html };
};

const sendViaResend = async ({ to, name, verifyUrl }) => {
  const { subject, text, html } = buildEmailContent({ name, verifyUrl });
  const from = getFromAddress();

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getResendApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html, text }),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const msg = body.message || body.error || response.statusText;
    throw new Error(msg);
  }

  console.log(`[email] Resend: sent to ${to} (id: ${body.id})`);
  return { sent: true, messageId: body.id, provider: "resend" };
};

const sendViaSmtp = async ({ to, name, verifyUrl }) => {
  const { subject, text, html } = buildEmailContent({ name, verifyUrl });
  const transporter = getTransporter();
  const info = await transporter.sendMail({
    from: getFromAddress(),
    to,
    subject,
    text,
    html,
  });

  console.log(`[email] SMTP: sent to ${to} (id: ${info.messageId})`);
  return { sent: true, messageId: info.messageId, provider: "smtp" };
};

const isProduction = () => process.env.NODE_ENV === "production";

const sendSignupEmail = async ({ to, name, verifyUrl }) => {
  if (!isEmailConfigured()) {
    if (!isProduction()) {
      console.log(`[email] Not configured. Verification link for ${to}:`);
      console.log(verifyUrl);
    }
    return { sent: false, reason: "not_configured" };
  }

  if (isProduction() && !isResendConfigured()) {
    console.error(
      "[email] Production (Render) requires RESEND_API_KEY. Gmail SMTP is blocked (ENETUNREACH / timeout)."
    );
    return { sent: false, reason: "resend_required" };
  }

  try {
    if (isResendConfigured()) {
      return await sendViaResend({ to, name, verifyUrl });
    }
    return await sendViaSmtp({ to, name, verifyUrl });
  } catch (error) {
    console.error(`[email] Send failed (${getEmailProvider()}):`, error.message);
    return { sent: false, reason: "send_failed", error: error.message };
  }
};

const sendSignupEmailWithTimeout = async (params) =>
  Promise.race([
    sendSignupEmail(params),
    new Promise((resolve) =>
      setTimeout(
        () => resolve({ sent: false, reason: "timeout" }),
        EMAIL_SEND_TIMEOUT_MS
      )
    ),
  ]);

const verifySmtpConnection = async () => {
  const provider = getEmailProvider();
  console.log(`[email] Provider: ${provider}`);

  if (provider === "none") {
    console.log(
      "[email] Not configured. Set RESEND_API_KEY on Render (recommended) or SMTP_* for local Gmail."
    );
    return false;
  }

  if (provider === "resend") {
    console.log(`[email] Resend ready (from: ${getFromAddress()})`);
    return true;
  }

  if (isProduction()) {
    console.error(
      "[email] CRITICAL: Set RESEND_API_KEY on Render. Gmail SMTP does not work on this host."
    );
    return false;
  }

  try {
    await getTransporter().verify();
    console.log("[email] SMTP connection OK (local dev)");
    return true;
  } catch (error) {
    console.error("[email] SMTP connection failed:", error.message);
    return false;
  }
};

module.exports = {
  isEmailConfigured,
  isResendConfigured,
  isSmtpConfigured,
  getEmailProvider,
  sendSignupEmail,
  sendSignupEmailWithTimeout,
  verifySmtpConnection,
};
