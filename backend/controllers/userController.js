const User = require("../models/User");
const { buildAuthPayload } = require("../utils/tokens");
const { sendSignupEmail } = require("../utils/email");
const {
  createVerificationToken,
  hashVerificationToken,
  getVerificationExpiry,
} = require("../utils/verification");

const normalizeUrl = (url) => (url ? url.replace(/\/+$/, "") : url);

const getFrontendUrl = () =>
  normalizeUrl(process.env.FRONTEND_URL) || "http://localhost:3000";

const attachVerificationAndSendEmail = async (user) => {
  const rawToken = createVerificationToken();
  user.emailVerificationToken = hashVerificationToken(rawToken);
  user.emailVerificationExpires = getVerificationExpiry();
  await user.save();

  const verifyUrl = `${getFrontendUrl()}/verify-email?token=${rawToken}`;
  return sendSignupEmail({
    to: user.email,
    name: user.name,
    verifyUrl,
  });
};

const signupUser = async (req, res) => {
  const { department, name, email, password, contact, academicLevel } = req.body;

  try {
    const user = await User.signup(
      department,
      name,
      email,
      password,
      contact,
      academicLevel
    );

    let emailResult = { sent: false };
    try {
      emailResult = await attachVerificationAndSendEmail(user);
    } catch (emailErr) {
      console.error("Signup email failed:", emailErr);
      emailResult = { sent: false, reason: "send_failed" };
    }

    const payload = buildAuthPayload(user);
    res.status(200).json({
      ...payload,
      emailSent: emailResult.sent,
      message: emailResult.sent
        ? "Account created. Check your email to verify your address."
        : "Account created. Email could not be sent — ask an admin to configure SMTP, or use resend from Settings later.",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    res.status(200).json(buildAuthPayload(user));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const verifyEmail = async (req, res) => {
  const token = req.query.token?.trim();

  if (!token) {
    return res.status(400).json({ error: "Verification token is required" });
  }

  try {
    const hashed = hashVerificationToken(token);
    const user = await User.findOne({
      emailVerificationToken: hashed,
      emailVerificationExpires: { $gt: new Date() },
    }).select("+emailVerificationToken +emailVerificationExpires");

    if (!user) {
      return res.status(400).json({
        error: "Invalid or expired verification link. Sign up again or request a new email.",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      message: "Email verified successfully. You can log in and use Sturum.",
      email: user.email,
    });
  } catch (error) {
    console.error("verifyEmail:", error);
    res.status(500).json({ error: "Could not verify email. Please try again." });
  }
};

const resendVerificationEmail = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "+emailVerificationToken +emailVerificationExpires"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: "Your email is already verified" });
    }

    const emailResult = await attachVerificationAndSendEmail(user);

    if (!emailResult.sent) {
      return res.status(503).json({
        error:
          "Email service is not configured. Set SMTP variables on the server.",
      });
    }

    res.status(200).json({ message: "Verification email sent. Check your inbox." });
  } catch (error) {
    console.error("resendVerificationEmail:", error);
    res.status(500).json({ error: "Could not send verification email" });
  }
};

module.exports = {
  signupUser,
  loginUser,
  verifyEmail,
  resendVerificationEmail,
};
