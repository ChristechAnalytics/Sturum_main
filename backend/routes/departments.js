const express = require("express");
const {
  DEPARTMENTS,
  searchDepartments,
  getCategories,
} = require("../constants/departments");

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const { q, category } = req.query;
    let results = searchDepartments(q || "");

    if (category && category.trim()) {
      const cat = category.trim().toLowerCase();
      results = results.filter((d) => d.category.toLowerCase() === cat);
    }

    res.json({
      total: results.length,
      categories: getCategories(),
      departments: results,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/all", (_req, res) => {
  try {
    res.json({
      total: DEPARTMENTS.length,
      categories: getCategories(),
      departments: DEPARTMENTS,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
