const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PostSchema = new mongoose.Schema({
  text: {
    type: String,
    default: "",
  },
  reshareOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    default: null,
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  imageUrl: {
    type: String,
  },
  department: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      text: {
        type: String,
        required: true,
      },
      parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },
      likes: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const Post = mongoose.model("Post", PostSchema);

module.exports = Post;
