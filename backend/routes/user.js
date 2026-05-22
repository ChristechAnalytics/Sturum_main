const express = require("express");
const { signupUser, loginUser } = require("../controllers/userController");
const { protect } = require("../middleware/requireAuth");
const { upload, handleUploadError } = require("../utils/upload");
const User = require("../models/User");

const router = express.Router();

// Signup route
router.post("/signup", signupUser);

// Login route
router.post("/login", loginUser);

// Get current user's profile
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error fetching user info:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Update notification preferences - MUST be before /:id route
router.put("/me/notifications", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { friendRequests, messages, comments, likes, newPosts } = req.body;

    // Initialize notificationPreferences if it doesn't exist
    if (!user.notificationPreferences) {
      user.notificationPreferences = {
        friendRequests: true,
        messages: true,
        comments: true,
        likes: true,
        newPosts: true,
      };
    }

    // Update only provided preferences
    if (typeof friendRequests === "boolean") {
      user.notificationPreferences.friendRequests = friendRequests;
    }
    if (typeof messages === "boolean") {
      user.notificationPreferences.messages = messages;
    }
    if (typeof comments === "boolean") {
      user.notificationPreferences.comments = comments;
    }
    if (typeof likes === "boolean") {
      user.notificationPreferences.likes = likes;
    }
    if (typeof newPosts === "boolean") {
      user.notificationPreferences.newPosts = newPosts;
    }

    await user.save();
    res.json({ message: "Notification preferences updated", notificationPreferences: user.notificationPreferences });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get user connections - MUST be before /:id route
router.get("/connections", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "connections",
      select: "name email department academicLevel profileImage",
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ connections: user.connections || [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get discoverable users - MUST be before /:id route
router.get("/discover", protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      console.error("Discover: Current user not found", req.user._id);
      return res.status(404).json({ message: "User not found" });
    }

    // Get IDs of users to exclude (self, friends, connections, and users who sent us requests)
    const excludeIds = [
      currentUser._id.toString(),
      ...(currentUser.friends || []).map(id => id.toString()),
      ...(currentUser.connections || []).map(id => id.toString()),
      ...(currentUser.friendRequests || []).map(id => id.toString()),
    ];

    // Find users in the same department, excluding the current user and their connections
    const allUsers = await User.find({
      department: currentUser.department,
      _id: { $nin: excludeIds },
    })
      .select("name email department academicLevel profileImage friendRequests createdAt")
      .limit(100)
      .sort({ createdAt: -1 }); // Sort by newest first

    // Filter out users who have already received a friend request from current user
    // (users whose friendRequests array contains currentUser._id)
    const currentUserIdStr = currentUser._id.toString();
    const discoverableUsers = allUsers
      .filter(user => {
        // Check if user has friendRequests array and if it contains current user's ID
        if (!user.friendRequests || !Array.isArray(user.friendRequests)) {
          return true; // Include if no friendRequests array
        }
        const hasSentRequest = user.friendRequests.some(
          reqId => {
            const reqIdStr = reqId ? reqId.toString() : null;
            return reqIdStr === currentUserIdStr;
          }
        );
        return !hasSentRequest;
      })
      .slice(0, 50) // Limit to 50 results
      .map(user => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        academicLevel: user.academicLevel,
        profileImage: user.profileImage,
      }));

    console.log(`Discover: Found ${discoverableUsers.length} discoverable users for ${currentUser.name}`);
    res.json({ users: discoverableUsers });
  } catch (error) {
    console.error("Error fetching discoverable users:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

// Get a user's profile by ID - MUST be last to avoid matching other routes
router.get("/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isSelf = user._id.toString() === req.user._id.toString();
    const sameDepartment = user.department === req.user.department;

    if (!isSelf && !sameDepartment) {
      return res.status(403).json({ message: "Profile not available" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error fetching user info:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Update current user's profile
router.put("/me", protect, upload.single("profileImage"), handleUploadError, async (req, res) => {
  const { contact, academicLevel } = req.body;
  const profileImage = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    // Use req.user._id to update the current logged-in user's profile
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Update user fields with proper type conversion
    if (contact) {
      user.contact = Number(contact);
      if (isNaN(user.contact)) {
        return res.status(400).json({ msg: "Contact must be a valid number" });
      }
    }
    
    if (academicLevel) {
      // Handle "graduate" string by converting to 600
      let academicLevelNum;
      if (academicLevel === "graduate" || academicLevel === "Graduate") {
        academicLevelNum = 600;
      } else {
        academicLevelNum = Number(academicLevel);
      }
      
      if (isNaN(academicLevelNum)) {
        return res.status(400).json({ msg: "Academic level must be a valid number" });
      }
      user.academicLevel = academicLevelNum;
    }
    
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Send friend request
router.post("/friend-request/:id", protect, async (req, res) => {
  try {
    const recipientId = req.params.id;
    const senderId = req.user._id;

    // Prevent sending friend request to yourself
    if (senderId.toString() === recipientId.toString()) {
      return res.status(400).json({ msg: "Cannot send friend request to yourself" });
    }

    const recipient = await User.findById(recipientId);
    const sender = await User.findById(senderId);

    if (!recipient || !sender) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (recipient.department !== sender.department) {
      return res.status(400).json({ msg: "You can only connect with students in your department" });
    }

    // Check if already friends
    if (recipient.friends.includes(senderId) || sender.friends.includes(recipientId)) {
      return res.status(400).json({ msg: "You are already friends with this user" });
    }

    // Check if already in connections
    if (recipient.connections.includes(senderId) || sender.connections.includes(recipientId)) {
      return res.status(400).json({ msg: "You are already connected with this user" });
    }

    // Check if friend request already sent
    if (recipient.friendRequests.includes(senderId)) {
      return res.status(400).json({ msg: "Friend request already sent" });
    }

    // Check if you have a pending request from this user (mutual request scenario)
    if (sender.friendRequests.includes(recipientId)) {
      // Auto-accept if both users sent requests to each other
      // Add each other to friends and connections
      if (!recipient.friends.includes(senderId)) {
        recipient.friends.push(senderId);
      }
      if (!recipient.connections.includes(senderId)) {
        recipient.connections.push(senderId);
      }
      if (!sender.friends.includes(recipientId)) {
        sender.friends.push(recipientId);
      }
      if (!sender.connections.includes(recipientId)) {
        sender.connections.push(recipientId);
      }

      // Remove from friend requests
      sender.friendRequests = sender.friendRequests.filter(
        (id) => id.toString() !== recipientId.toString()
      );
      recipient.friendRequests = recipient.friendRequests.filter(
        (id) => id.toString() !== senderId.toString()
      );

      await sender.save();
      await recipient.save();

      return res.json({ msg: "Friend request accepted automatically", autoAccepted: true });
    }

    recipient.friendRequests.push(senderId);
    await recipient.save();

    if (req.io) {
      req.io.to(`user:${recipientId}`).emit("notification", {
        type: "friend_request",
        count: recipient.friendRequests.length,
      });
    }

    res.json({ msg: "Friend request sent successfully" });
  } catch (err) {
    console.error("Error sending friend request:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Accept friend request
router.post("/accept-friend-request/:id", protect, async (req, res) => {
  try {
    const requester = await User.findById(req.params.id);
    const recipient = await User.findById(req.user._id);

    if (!requester || !recipient) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Add each other to their friends and connections arrays
    if (!recipient.friends.includes(requester._id)) {
      recipient.friends.push(requester._id);
    }
    if (!recipient.connections.includes(requester._id)) {
      recipient.connections.push(requester._id);
    }
    if (!requester.friends.includes(recipient._id)) {
      requester.friends.push(recipient._id);
    }
    if (!requester.connections.includes(recipient._id)) {
      requester.connections.push(recipient._id);
    }

    // Remove the requester from the recipient's friendRequests array
    recipient.friendRequests = recipient.friendRequests.filter(
      (id) => id.toString() !== requester._id.toString()
    );

    await requester.save();
    await recipient.save();

    res.json({ msg: "Friend request accepted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Decline friend request
router.post("/decline-friend-request/:id", protect, async (req, res) => {
  try {
    const requester = await User.findById(req.params.id);
    const recipient = await User.findById(req.user._id);

    if (!requester || !recipient) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Remove the requester from the recipient's friendRequests array
    recipient.friendRequests = recipient.friendRequests.filter(
      (id) => id.toString() !== requester._id.toString()
    );

    await recipient.save();

    res.json({ msg: "Friend request declined" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
