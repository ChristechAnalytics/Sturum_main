const jwt = require("jsonwebtoken");

const createAccessToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
};

const createRefreshToken = (_id) => {
  const secret = process.env.REFRESH_SECRET || process.env.SECRET;
  return jwt.sign({ _id, type: "refresh" }, secret, { expiresIn: "7d" });
};

const buildAuthPayload = (user) => ({
  _id: user._id,
  userId: user._id,
  email: user.email,
  name: user.name,
  department: user.department,
  isEmailVerified: user.isEmailVerified ?? true,
  token: createAccessToken(user._id),
  refreshToken: createRefreshToken(user._id),
});

module.exports = { createAccessToken, createRefreshToken, buildAuthPayload };
