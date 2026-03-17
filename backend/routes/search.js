const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/requireAuth");
const Post = require("../models/Post");
const Material = require("../models/Material");
const User = require("../models/User");

// Search endpoint
router.get("/", protect, async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.json([]);
    }

    const searchQuery = query.trim();

    // Search in posts (only from user's department)
    const posts = await Post.find({
      department: req.user.department,
      $or: [
        { text: { $regex: searchQuery, $options: "i" } },
      ],
    })
      .populate("authorId", "name profileImage department academicLevel")
      .limit(10);

    // Search in materials
    const materials = await Material.find({
      $or: [
        { title: { $regex: searchQuery, $options: "i" } },
      ],
    })
      .populate("authorId", "name")
      .limit(10);

    // Search in users (same department)
    const users = await User.find({
      department: req.user.department,
      $or: [
        { name: { $regex: searchQuery, $options: "i" } },
        { email: { $regex: searchQuery, $options: "i" } },
      ],
    })
      .select("-password")
      .limit(10);

    // Format results
    const results = [
      ...posts.map((post) => ({
        _id: post._id,
        type: "post",
        title: post.text.substring(0, 100),
        description: post.text,
        author: post.authorId,
        createdAt: post.createdAt,
      })),
      ...materials.map((material) => ({
        _id: material._id,
        type: "material",
        title: material.title,
        description: material.category,
        author: material.authorId,
        fileUrl: material.fileUrl,
        createdAt: material.uploadedAt,
      })),
      ...users.map((user) => ({
        _id: user._id,
        type: "user",
        title: user.name,
        description: `${user.department} - Level ${user.academicLevel}`,
        email: user.email,
        profileImage: user.profileImage,
      })),
    ];

    res.json(results);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
