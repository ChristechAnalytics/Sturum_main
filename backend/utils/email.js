const nodemailer = require("nodemailer");

const appName = () => process.env.APP_NAME || "Sturum";
const EMAIL_SEND_TIMEOUT_MS = 12_000;

const getSmtpUser = () => process.env.SMTP_USER?.trim();
/** Gmail app passwords are often copied with spaces — strip them. */
const getSmtpPass = () => (process.env.SMTP_PASS || "").replace(/\s/g, "");

const isGmailSmtp = () => {
  if (process.env.SMTP_SERVICE === "gmail") return true;
  const host = (process.env.SMTP_HOST || "").toLowerCase();
  return host === "smtp.gmail.com" || host.endsWith(".gmail.com");
};

const isEmailConfigured = () => {
  const hasAuth = Boolean(getSmtpUser() && getSmtpPass());
  if (!hasAuth) return false;
  if (isGmailSmtp()) return true;
  return Boolean(process.env.SMTP_HOST);
};

const getTransporter = () => {
  const auth = {
    user: getSmtpUser(),
    pass: getSmtpPass(),
  };

  const timeouts = {
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  };

  // Explicit host/port works more reliably on cloud hosts (Render) than service: "gmail"
  if (isGmailSmtp()) {
    return nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
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

const getFromAddress = () =>
  process.env.SMTP_FROM || `${appName()} <${getSmtpUser()}>`;

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

const sendSignupEmail = async ({ to, name, verifyUrl }) => {
  const subject = `Welcome to ${appName()} — verify your email`;

  if (!isEmailConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[email] SMTP not configured. Verification link for ${to}:`);
      console.log(verifyUrl);
      console.log("[email] Local dev: run frontend (npm start) and backend (npm run dev) before opening the link.");
    }
    return { sent: false, reason: "smtp_not_configured" };
  }

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: getFromAddress(),
      to,
      subject,
      text: [
        `Welcome to ${appName()}, ${name}!`,
        "",
        "Your account has been created. Verify your email by opening this link (expires in 24 hours):",
        verifyUrl,
        "",
        "If you did not create this account, ignore this email.",
      ].join("\n"),
      html: buildSignupEmailHtml({ name, verifyUrl }),
    });

    console.log(`[email] Sent verification to ${to} (id: ${info.messageId})`);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[email] Failed to send to ${to}:`, error.message);
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
  if (!isEmailConfigured()) {
    console.log("[email] SMTP not configured — verification emails will not send");
    return false;
  }

  try {
    await getTransporter().verify();
    console.log("[email] SMTP connection OK");
    return true;
  } catch (error) {
    console.error("[email] SMTP connection failed:", error.message);
    console.error(
      "[email] On Render: set SMTP_USER, SMTP_PASS (Gmail App Password, no spaces), SMTP_FROM. Check spam folder."
    );
    return false;
  }
};

module.exports = {
  isEmailConfigured,
  sendSignupEmail,
  sendSignupEmailWithTimeout,
  verifySmtpConnection,
};
