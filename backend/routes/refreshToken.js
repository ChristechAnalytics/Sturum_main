const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { createAccessToken } = require("../utils/tokens");

router.post("/", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token required" });
  }

  try {
    const secret = process.env.REFRESH_SECRET || process.env.SECRET;
    const decoded = jwt.verify(refreshToken, secret);

    if (decoded.type !== "refresh") {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    res.json({
      token: createAccessToken(user._id),
      refreshToken,
      _id: user._id,
      userId: user._id,
      email: user.email,
      name: user.name,
      department: user.department,
    });
  } catch (error) {
    res.status(403).json({ error: "Invalid refresh token" });
  }
});

module.exports = router;
