const Post = require("../models/Post");

// Create new post
const createPost = async (req, res) => {
  const { text } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  console.log("Request body:", req.body); // Log request body
  console.log("Uploaded file:", req.file); // Log uploaded file details

  try {
    if (!text) {
      return res.status(400).json({ msg: "Text is required" });
    }

    const newPost = new Post({
      text,
      department: req.user.department, // Use department from authenticated user
      authorId: req.user._id,
      imageUrl,
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    console.error("Error creating post:", err); // Add detailed logging here
    res.status(500).json({ msg: "Server error" });
  }
};

// Get posts by department
const getPosts = async (req, res) => {
  try {
    console.log("Fetching posts for department:", req.user.department); // Log department

    const posts = await Post.find({ department: req.user.department })
      .populate("authorId", "name profileImage department academicLevel")
      .populate("comments.user", "name profileImage")
      .sort({ createdAt: -1 }); // Sort by newest first (descending order)

    console.log("Fetched posts:", posts); // Log fetched posts

    res.json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err); // Add detailed logging here
    res.status(500).json({ msg: "Server error" });
  }
};

// Update a post
const updatePost = async (req, res) => {
  const { text } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const post = await Post.findById(req.params.id);

    if (post.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    post.text = text;
    if (imageUrl) {
      post.imageUrl = imageUrl;
    }
    await post.save();
    res.json(post);
  } catch (err) {
    console.error("Error updating post:", err); // Add detailed logging here
    res.status(500).json({ msg: "Server error" });
  }
};

// Delete a post
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    await post.remove();
    res.json({ msg: "Post removed" });
  } catch (err) {
    console.error("Error deleting post:", err); // Add detailed logging here
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = {
  getPosts,
  deletePost,
  updatePost,
  createPost,
};
