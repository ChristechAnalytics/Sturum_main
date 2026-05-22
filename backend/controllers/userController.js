const User = require("../models/User");
const { buildAuthPayload } = require("../utils/tokens");
const { sendSignupEmail } = require("../utils/email");
const {
  createVerificationToken,
  hashVerificationToken,
  getVerificationExpiry,
} = require("../utils/verification");
const { buildEmailVerificationUrl, buildFrontendVerifyResultUrl } = require("../utils/urls");
const { verifyEmailToken } = require("../utils/verifyEmailToken");

const attachVerificationAndSendEmail = async (user) => {
  const rawToken = createVerificationToken();
  user.emailVerificationToken = hashVerificationToken(rawToken);
  user.emailVerificationExpires = getVerificationExpiry();
  await user.save();

  const verifyUrl = buildEmailVerificationUrl(rawToken);
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

  try {
    const user = await verifyEmailToken(token);
    res.status(200).json({
      message: "Email verified successfully. You can log in and use Sturum.",
      email: user.email,
    });
  } catch (error) {
    if (
      error.message.includes("required") ||
      error.message.includes("Invalid or expired")
    ) {
      return res.status(400).json({ error: error.message });
    }
    console.error("verifyEmail:", error);
    res.status(500).json({ error: "Could not verify email. Please try again." });
  }
};

/** Browser link from email: verify on API, then redirect to the React app */
const verifyEmailRedirect = async (req, res) => {
  const token = req.query.token?.trim();

  try {
    await verifyEmailToken(token);
    return res.redirect(
      302,
      buildFrontendVerifyResultUrl(
        "success",
        "Email verified successfully. You can log in and use Sturum."
      )
    );
  } catch (error) {
    console.error("verifyEmailRedirect:", error.message);
    return res.redirect(
      302,
      buildFrontendVerifyResultUrl("error", error.message)
    );
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

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    await User.changePassword(req.user._id, currentPassword, newPassword);
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  signupUser,
  loginUser,
  verifyEmail,
  verifyEmailRedirect,
  resendVerificationEmail,
  changePassword,
};
