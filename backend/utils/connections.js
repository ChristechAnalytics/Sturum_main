const User = require("../models/User");

const areConnected = async (userId, otherUserId) => {
  const user = await User.findById(userId).select("connections");
  if (!user) return false;
  return user.connections.some((id) => id.toString() === otherUserId.toString());
};

module.exports = { areConnected };
