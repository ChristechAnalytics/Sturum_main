const express = require("express");
const router = express.Router();
const Material = require("../models/Material");
const { protect } = require("../middleware/requireAuth");
const { upload, handleUploadError } = require("../utils/upload");
const { persistUpload, deleteFileRef } = require("../utils/fileStorage");

router.get("/", protect, async (req, res) => {
  try {
    const materials = await Material.find({
      department: req.user.department,
    })
      .populate("authorId", "name")
      .sort({ uploadedAt: -1 });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post(
  "/",
  protect,
  upload.single("file"),
  handleUploadError,
  persistUpload,
  async (req, res) => {
  try {
    if (!req.fileRef) {
      return res.status(400).json({ error: "File is required" });
    }

    const { title, category } = req.body;

    if (!title || !category) {
      return res.status(400).json({ error: "Title and category are required" });
    }

    const fileUrl = req.fileRef;
    const newMaterial = new Material({
      title,
      category,
      fileUrl,
      department: req.user.department,
      authorId: req.user._id,
    });

    await newMaterial.save();
    await newMaterial.populate("authorId", "name");
    res.status(201).json(newMaterial);
  } catch (error) {
    console.error("Error uploading material:", error);
    res.status(500).json({ error: error.message });
  }
  }
);

router.delete("/:id", protect, async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }
    if (material.department !== req.user.department) {
      return res.status(403).json({ error: "Not authorized" });
    }
    if (material.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Only the author can delete this material" });
    }

    await deleteFileRef(material.fileUrl);
    await Material.findByIdAndDelete(req.params.id);
    res.json({ message: "Material deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
