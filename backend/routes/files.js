const express = require("express");
const Material = require("../models/Material");
const Post = require("../models/Post");
const User = require("../models/User");
const { authenticateRequest } = require("../middleware/authenticateRequest");
const {
  isGridFsRef,
  refFromFileKey,
  streamGridFsToResponse,
  sendLegacyDiskFile,
} = require("../utils/fileStorage");

const router = express.Router();

const userCanAccessProfileImage = (profileUser, reqUser) =>
  profileUser &&
  (profileUser._id.toString() === reqUser._id.toString() ||
    profileUser.department === reqUser.department);

const authorizeFileRef = async (fileRef, reqUser) => {
  const material = await Material.findOne({
    fileUrl: fileRef,
    department: reqUser.department,
  });
  if (material) return true;

  const post = await Post.findOne({
    department: reqUser.department,
    $or: [{ imageUrl: fileRef }, { imageUrls: fileRef }],
  });
  if (post) return true;

  const profileUser = await User.findOne({ profileImage: fileRef }).select(
    "_id department"
  );
  if (userCanAccessProfileImage(profileUser, reqUser)) return true;

  return false;
};

router.get("/:fileKey", authenticateRequest, async (req, res) => {
  try {
    const fileKey = req.params.fileKey;
    const fileRef = refFromFileKey(fileKey);

    const allowed = await authorizeFileRef(fileRef, req.user);
    if (!allowed) {
      return res.status(403).json({ error: "Not authorized to access this file" });
    }

    if (isGridFsRef(fileRef) || /^[a-f0-9]{24}$/i.test(fileKey)) {
      const ok = await streamGridFsToResponse(fileKey, res);
      if (ok) return;
      return res.status(404).json({ error: "File not found" });
    }

    const sent = sendLegacyDiskFile(fileKey, res);
    if (!sent) {
      return res.status(404).json({
        error: "File not found. It may have been removed when the server restarted.",
      });
    }
  } catch (error) {
    console.error("[files] serve error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

module.exports = router;
