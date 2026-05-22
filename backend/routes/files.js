const express = require("express");
const path = require("path");
const fs = require("fs");
const { authenticateRequest } = require("../middleware/authenticateRequest");
const Material = require("../models/Material");
const Post = require("../models/Post");
const User = require("../models/User");
const { UPLOAD_DIR } = require("../utils/upload");

const router = express.Router();

router.get("/:filename", authenticateRequest, async (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const filePath = `/uploads/${filename}`;
    const absolutePath = path.join(UPLOAD_DIR, filename);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    const material = await Material.findOne({
      fileUrl: filePath,
      department: req.user.department,
    });
    if (material) {
      return res.sendFile(absolutePath);
    }

    const post = await Post.findOne({
      imageUrl: filePath,
      department: req.user.department,
    });
    if (post) {
      return res.sendFile(absolutePath);
    }

    const profileUser = await User.findOne({ profileImage: filePath }).select(
      "_id department"
    );
    if (
      profileUser &&
      (profileUser._id.toString() === req.user._id.toString() ||
        profileUser.department === req.user.department)
    ) {
      return res.sendFile(absolutePath);
    }

    return res.status(403).json({ error: "Not authorized to access this file" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
