const User = require("../models/User");
const { hashVerificationToken } = require("./verification");

const verifyEmailToken = async (token) => {
  if (!token?.trim()) {
    throw new Error("Verification token is required");
  }

  const hashed = hashVerificationToken(token.trim());
  const user = await User.findOne({
    emailVerificationToken: hashed,
    emailVerificationExpires: { $gt: new Date() },
  }).select("+emailVerificationToken +emailVerificationExpires");

  if (!user) {
    throw new Error(
      "Invalid or expired verification link. Request a new email from Settings."
    );
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  return user;
};

module.exports = { verifyEmailToken };
