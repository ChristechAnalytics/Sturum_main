const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { protect } = require("../middleware/requireAuth");
const {
  createPost,
  getPosts,
  updatePost,
  deletePost,
} = require("../controllers/postController");
const Post = require("../models/Post");
const User = require("../models/User");

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
});

// Create a post
router.post("/", protect, upload.single("image"), createPost);

// Like or unlike a post
router.post("/:postId/like", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    // Check if user already liked the post
    if (post.likes.includes(req.user._id)) {
      // Unlike the post
      post.likes = post.likes.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
    } else {
      // Like the post
      post.likes.push(req.user._id);
    }

    await post.save();
    res.status(200).json({ likes: post.likes.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Add a comment to a post
router.post("/:postId/comments", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const comment = {
      user: req.user._id,
      text: req.body.text,
      userName: user.name,
      userProfileImage: user.profileImage,
    };

    post.comments.push(comment);
    await post.save();

    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get comments of a specific post
router.get("/:postId/comments", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).populate({
      path: "comments.user",
      select: "name profileImage",
    });
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(200).json({ 
      likes: post.likes.length, 
      likedUsers: post.likes,
      comments: post.comments 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get all posts
router.get("/", protect, getPosts);

// Update a post
router.put("/:id", protect, updatePost);

// Delete a post
router.delete("/:id", protect, deletePost);

module.exports = router;
