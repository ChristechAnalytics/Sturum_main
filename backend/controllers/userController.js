const User = require("../models/User");
const jwt = require("jsonwebtoken");

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
};

// signup user
const signupUser = async (req, res) => {
  const { department, name, email, password, contact, academicLevel } = req.body;
  console.log("Signup request body:", { department, name, email, contact, academicLevel });

  try {
    const user = await User.signup(department, name, email, password, contact, academicLevel);

    // create a token
    const token = createToken(user._id);

    res.status(200).json({ email, token, department, userId: user._id, _id: user._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);

    // create a token
    const token = createToken(user._id);

    // retrieve department from the user object
    const department = user.department;

    res.status(200).json({ email, token, department, userId: user._id, _id: user._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { signupUser, loginUser };
