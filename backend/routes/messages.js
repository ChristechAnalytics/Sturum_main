const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const { protect } = require("../middleware/requireAuth");
const { areConnected } = require("../utils/connections");

const emitToUsers = (io, senderId, receiverId, event, payload) => {
  io.to(`user:${senderId}`).emit(event, payload);
  io.to(`user:${receiverId}`).emit(event, payload);
};

router.get("/:chatId", protect, async (req, res) => {
  try {
    const { chatId } = req.params;

    const connected = await areConnected(req.user._id, chatId);
    if (!connected) {
      return res.status(403).json({ message: "You can only message your connections" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: req.user._id, receiverId: chatId },
        { senderId: chatId, receiverId: req.user._id },
      ],
    })
      .populate("senderId", "name profileImage")
      .populate("receiverId", "name profileImage")
      .sort({ createdAt: 1 });

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const { receiverId, text } = req.body;

    if (!receiverId || !text || !text.trim()) {
      return res.status(400).json({ message: "Receiver ID and message text are required" });
    }

    const connected = await areConnected(req.user._id, receiverId);
    if (!connected) {
      return res.status(403).json({ message: "You can only message your connections" });
    }

    const senderId = req.user._id;

    const message = new Message({
      senderId,
      receiverId,
      sender: senderId,
      receiver: receiverId,
      text: text.trim(),
    });
    await message.save();

    await message.populate("senderId", "name profileImage");
    await message.populate("receiverId", "name profileImage");

    emitToUsers(req.io, senderId.toString(), receiverId.toString(), "new_message", message);
    req.io.to(`user:${receiverId}`).emit("notification", {
      type: "message",
      from: senderId,
    });

    res.status(201).json(message);
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
