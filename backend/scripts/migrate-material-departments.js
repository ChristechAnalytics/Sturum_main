/**
 * One-time migration: assign department to materials missing it.
 * Run: node scripts/migrate-material-departments.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const Material = require("../models/Material");
const User = require("../models/User");

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI_COMPASS);
  const materials = await Material.find({
    $or: [{ department: { $exists: false } }, { department: null }, { department: "" }],
  });

  let updated = 0;
  for (const material of materials) {
    const author = await User.findById(material.authorId);
    if (author?.department) {
      material.department = author.department;
      await material.save();
      updated += 1;
    }
  }

  console.log(`Migrated ${updated} of ${materials.length} materials.`);
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
