const express = require("express");
const router = express.Router();
const multer = require("multer");
const Material = require("../models/Material");
const { protect } = require("../middleware/requireAuth");

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Fetch all materials
router.get("/", protect, async (req, res) => {
  try {
    const materials = await Material.find().populate("authorId", "name");
    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload a new material
router.post("/", protect, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "File is required" });
    }

    const { title, category } = req.body;
    
    if (!title || !category) {
      return res.status(400).json({ error: "Title and category are required" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const newMaterial = new Material({
      title,
      category,
      fileUrl,
      authorId: req.user._id,
    });
    
    await newMaterial.save();
    await newMaterial.populate("authorId", "name");
    res.status(201).json(newMaterial);
  } catch (error) {
    console.error("Error uploading material:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
