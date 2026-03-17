const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generate a new token
const generateToken = (user) => {
  return jwt.sign({ _id: user._id }, process.env.SECRET, { expiresIn: "1h" }); // 1 hour expiration
};

router.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.SECRET);

    // Find the user by the ID in the refresh token
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const newToken = generateToken(user);
    res.json({ token: newToken });
  } catch (error) {
    res.status(403).json({ error: "Invalid refresh token" });
  }
});

module.exports = router;
