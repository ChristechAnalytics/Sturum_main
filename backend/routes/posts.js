const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/requireAuth");
const {
  createPost,
  getPosts,
  updatePost,
  deletePost,
  resharePost,
} = require("../controllers/postController");
const { upload, handleUploadError } = require("../utils/upload");
const Post = require("../models/Post");
const User = require("../models/User");
const { emitToDepartment, serializeComment } = require("../utils/socketEmit");

const assertPostAccess = async (postId, user) => {
  const post = await Post.findById(postId);
  if (!post) return { error: { status: 404, msg: "Post not found" } };
  if (post.department !== user.department) {
    return { error: { status: 403, msg: "Not authorized" } };
  }
  return { post };
};

router.post("/", protect, upload.single("image"), handleUploadError, createPost);

router.get("/:id/reshare-status", protect, async (req, res) => {
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
    res.json({ hasReshared: Boolean(existing) });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/:id/reshare", protect, resharePost);

router.post("/:postId/like", protect, async (req, res) => {
  try {
    const { post, error } = await assertPostAccess(req.params.postId, req.user);
    if (error) return res.status(error.status).json({ msg: error.msg });

    if (post.likes.includes(req.user._id)) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();
    res.status(200).json({ likes: post.likes.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/:postId/comments", protect, async (req, res) => {
  try {
    const { post, error } = await assertPostAccess(req.params.postId, req.user);
    if (error) return res.status(error.status).json({ msg: error.msg });

    const author = await User.findById(req.user._id);
    if (!author) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (!req.body.text || !req.body.text.trim()) {
      return res.status(400).json({ msg: "Comment text is required" });
    }

    const { parentCommentId } = req.body;
    if (parentCommentId) {
      const parent = post.comments.id(parentCommentId);
      if (!parent) {
        return res.status(404).json({ msg: "Parent comment not found" });
      }
    }

    post.comments.push({
      user: req.user._id,
      text: req.body.text.trim(),
      parentComment: parentCommentId || null,
      likes: [],
      createdAt: new Date(),
    });
    await post.save();

    const savedComment = post.comments[post.comments.length - 1];
    await post.populate({
      path: "comments.user",
      select: "name profileImage department academicLevel",
    });

    const populated = post.comments.id(savedComment._id);

    emitToDepartment(req.io, post.department, "post_comment", {
      postId: post._id.toString(),
      comment: serializeComment(populated),
    });

    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/:postId/comments/:commentId/like", protect, async (req, res) => {
  try {
    const { post, error } = await assertPostAccess(req.params.postId, req.user);
    if (error) return res.status(error.status).json({ msg: error.msg });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ msg: "Comment not found" });
    }

    const userId = req.user._id.toString();
    const alreadyLiked = comment.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      comment.likes = comment.likes.filter((id) => id.toString() !== userId);
    } else {
      comment.likes.push(req.user._id);
    }

    await post.save();

    emitToDepartment(req.io, post.department, "post_comment_like", {
      postId: post._id.toString(),
      commentId: comment._id.toString(),
      likes: comment.likes.map((id) => id.toString()),
    });

    res.status(200).json({
      likes: comment.likes.length,
      liked: !alreadyLiked,
      commentId: comment._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/:postId/comments", protect, async (req, res) => {
  try {
    const { post, error } = await assertPostAccess(req.params.postId, req.user);
    if (error) return res.status(error.status).json({ msg: error.msg });

    await post.populate({
      path: "comments.user",
      select: "name profileImage department academicLevel",
    });

    res.status(200).json({
      likes: post.likes.length,
      likedUsers: post.likes,
      comments: post.comments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/", protect, getPosts);
router.put("/:id", protect, upload.single("image"), handleUploadError, updatePost);
router.delete("/:id", protect, deletePost);

module.exports = router;
