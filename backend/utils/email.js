const nodemailer = require("nodemailer");

const appName = () => process.env.APP_NAME || "Sturum";

const isGmailSmtp = () => {
  if (process.env.SMTP_SERVICE === "gmail") return true;
  const host = (process.env.SMTP_HOST || "").toLowerCase();
  return host === "smtp.gmail.com" || host.endsWith(".gmail.com");
};

const isEmailConfigured = () => {
  const hasAuth = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
  if (!hasAuth) return false;
  if (isGmailSmtp()) return true;
  return Boolean(process.env.SMTP_HOST);
};

const getTransporter = () => {
  const auth = {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  };

  // Nodemailer's Gmail preset handles TLS/ports correctly (App Password required).
  const timeouts = {
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  };

  if (isGmailSmtp()) {
    return nodemailer.createTransport({ service: "gmail", auth, ...timeouts });
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
  process.env.SMTP_FROM || `${appName()} <${process.env.SMTP_USER}>`;

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
    }
    return { sent: false, reason: "smtp_not_configured" };
  }

  const transporter = getTransporter();
  await transporter.sendMail({
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

  return { sent: true };
};

module.exports = {
  isEmailConfigured,
  sendSignupEmail,
};
