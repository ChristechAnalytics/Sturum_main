const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const { isValidDepartment, normalizeDepartment } = require("../constants/departments");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    department: {
      type: String,
      required: true,
      validate: {
        validator: (v) => isValidDepartment(v),
        message: "Please select a valid department from the list",
      },
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    contact: { type: Number, required: true },
    academicLevel: { type: Number, required: true },
    profileImage: { type: String },
    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    notificationPreferences: {
      friendRequests: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
      likes: { type: Boolean, default: true },
      newPosts: { type: Boolean, default: true },
    },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

// static signup method
userSchema.statics.signup = async function (department, name, email, password, contact, academicLevel) {
  // Validate all required fields
  if (!email || !password || !name || !department) {
    throw Error("All fields must be filled");
  }
  
  // Validate contact and academicLevel specifically
  if (!contact || contact === "" || contact === null || contact === undefined) {
    throw Error("Contact number is required");
  }
  if (!academicLevel || academicLevel === "" || academicLevel === null || academicLevel === undefined) {
    throw Error("Academic level is required");
  }
  
  const normalizedEmail = validator.normalizeEmail(email?.trim()) || email?.trim()?.toLowerCase();
  if (!normalizedEmail || !validator.isEmail(normalizedEmail)) {
    throw Error("Please enter a valid email address");
  }
  email = normalizedEmail;
  if (!validator.isStrongPassword(password)) {
    throw Error("Password not strong enough");
  }

  const exists = await this.findOne({ email: normalizedEmail });

  if (exists) {
    throw Error("Email already in use");
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  // Convert to numbers, ensuring they're valid
  const contactNumber = Number(contact);
  
  // Handle "graduate" string by converting to 600
  let academicLevelNumber;
  if (academicLevel === "graduate" || academicLevel === "Graduate") {
    academicLevelNumber = 600;
  } else {
    academicLevelNumber = Number(academicLevel);
  }
  
  if (isNaN(contactNumber) || contactNumber <= 0) {
    throw Error("Contact number must be a valid positive number");
  }
  if (isNaN(academicLevelNumber) || academicLevelNumber <= 0) {
    throw Error("Academic level must be a valid number");
  }

  const user = await this.create({
    department: normalizeDepartment(department),
    name,
    email,
    password: hash,
    contact: contactNumber,
    academicLevel: academicLevelNumber,
  });

  return user;
};

// static login method
userSchema.statics.login = async function (email, password) {
  if (!email || !password) {
    throw Error("All fields must be filled");
  }

  const normalizedEmail =
    validator.normalizeEmail(email?.trim()) || email?.trim()?.toLowerCase();

  const user = await this.findOne({ email: normalizedEmail });

  if (!user) {
    throw Error("Incorrect email");
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw Error("Incorrect password");
  }

  return user;
};

userSchema.statics.changePassword = async function (userId, currentPassword, newPassword) {
  if (!currentPassword || !newPassword) {
    throw Error("Current and new password are required");
  }
  if (!validator.isStrongPassword(newPassword)) {
    throw Error("Password not strong enough");
  }

  const user = await this.findById(userId);
  if (!user) {
    throw Error("User not found");
  }

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) {
    throw Error("Current password is incorrect");
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  return user;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
