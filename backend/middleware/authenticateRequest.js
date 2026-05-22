const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticateRequest = async (req, res, next) => {
  const headerToken = req.headers.authorization?.split(" ")[1];
  const queryToken = req.query.token;
  const token = headerToken || queryToken;

  if (!token) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  try {
    const { _id } = jwt.verify(token, process.env.SECRET);
    req.user = await User.findById(_id).select("_id department");
    if (!req.user) {
      return res.status(401).json({ error: "User not found" });
    }
    next();
  } catch (error) {
    res.status(401).json({ error: "Request is not authorized" });
  }
};

module.exports = { authenticateRequest };
