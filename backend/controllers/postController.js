const Post = require("../models/Post");
const { emitToDepartment } = require("../utils/socketEmit");

const authorFields = "name profileImage department academicLevel";

const populatePost = (query) =>
  query
    .populate("authorId", authorFields)
    .populate({
      path: "reshareOf",
      populate: { path: "authorId", select: authorFields },
    });

const createPost = async (req, res) => {
  const { text } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    if (!text || !text.trim()) {
      return res.status(400).json({ msg: "Text is required" });
    }

    const newPost = new Post({
      text: text.trim(),
      department: req.user.department,
      authorId: req.user._id,
      imageUrl,
    });
    await newPost.save();
    await newPost.populate("authorId", "name profileImage department academicLevel");
    res.status(201).json(newPost);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

const resharePost = async (req, res) => {
  try {
    const original = await Post.findById(req.params.id);
    if (!original) {
      return res.status(404).json({ msg: "Post not found" });
    }
    if (original.department !== req.user.department) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    const targetId = original.reshareOf || original._id;

    const existing = await Post.findOne({
      authorId: req.user._id,
      reshareOf: targetId,
    });
    if (existing) {
      return res.status(400).json({ msg: "You have already reshared this post" });
    }

    const { comment } = req.body;
    const reshare = new Post({
      authorId: req.user._id,
      department: req.user.department,
      text: (comment || "").trim(),
      reshareOf: targetId,
    });

    await reshare.save();
    const populated = await populatePost(Post.findById(reshare._id));

    const payload = populated.toObject();
    if (req.io) {
      emitToDepartment(req.io, req.user.department, "post_reshare", {
        post: payload,
      });
    }

    res.status(201).json(populated);
  } catch (err) {
    console.error("Error resharing post:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

const getPosts = async (req, res) => {
  try {
    const posts = await populatePost(
      Post.find({ department: req.user.department })
    )
      .populate("comments.user", "name profileImage")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

const updatePost = async (req, res) => {
  const { text } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    if (post.department !== req.user.department) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    if (post.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    if (post.reshareOf && imageUrl) {
      return res.status(400).json({ msg: "Cannot change image on a reshare" });
    }

    if (text !== undefined) {
      post.text = text.trim();
    }
    if (imageUrl) {
      post.imageUrl = imageUrl;
    }
    await post.save();
    await post.populate("authorId", "name profileImage department academicLevel");
    res.json(post);
  } catch (err) {
    console.error("Error updating post:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    if (post.department !== req.user.department) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    if (post.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ msg: "Post removed" });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = {
  getPosts,
  deletePost,
  updatePost,
  createPost,
  resharePost,
};
