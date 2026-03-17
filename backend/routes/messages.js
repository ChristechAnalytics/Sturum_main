// routes/messages.js
const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const { protect } = require("../middleware/requireAuth"); // Middleware to verify JWT

// Get messages for a chat
router.get("/:chatId", protect, async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({
      $or: [
        { senderId: req.user._id, receiverId: chatId },
        { senderId: chatId, receiverId: req.user._id },
        { sender: req.user._id, receiver: chatId },
        { sender: chatId, receiver: req.user._id },
      ],
    })
      .populate("sender", "name profileImage")
      .populate("receiver", "name profileImage")
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

    // Use authenticated user's ID as sender (more secure)
    const senderId = req.user._id;
    
    const message = new Message({ 
      senderId, 
      receiverId, 
      sender: senderId,
      receiver: receiverId,
      text: text.trim()
    });
    await message.save();

    // Populate before emitting
    await message.populate("senderId", "name profileImage");
    await message.populate("receiverId", "name profileImage");
    await message.populate("sender", "name profileImage");
    await message.populate("receiver", "name profileImage");

    // Emit message to socket (broadcast to all connected clients)
    // Clients will filter messages based on their user ID and current chat
    req.io.emit("new_message", message);

    res.status(201).json(message);
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
