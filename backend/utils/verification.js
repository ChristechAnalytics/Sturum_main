const crypto = require("crypto");

const TOKEN_BYTES = 32;
const EXPIRY_MS = 24 * 60 * 60 * 1000;

const createVerificationToken = () => crypto.randomBytes(TOKEN_BYTES).toString("hex");

const hashVerificationToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const getVerificationExpiry = () => new Date(Date.now() + EXPIRY_MS);

module.exports = {
  createVerificationToken,
  hashVerificationToken,
  getVerificationExpiry,
  EXPIRY_MS,
};
