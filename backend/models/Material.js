const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const materialSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["Past Questions", "Handouts", "Books", "Pictures"],
  },
  fileUrl: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  authorId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const Material = mongoose.model("Material", materialSchema);
module.exports = Material;
