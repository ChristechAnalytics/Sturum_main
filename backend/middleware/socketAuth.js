const jwt = require("jsonwebtoken");
const User = require("../models/User");

const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication required"));
    }
    const { _id } = jwt.verify(token, process.env.SECRET);
    const user = await User.findById(_id).select("_id department");
    if (!user) {
      return next(new Error("User not found"));
    }
    socket.userId = user._id.toString();
    socket.department = user.department;
    next();
  } catch (error) {
    next(new Error("Invalid token"));
  }
};

module.exports = { socketAuth };
