const User = require("../models/User");
const { buildAuthPayload } = require("../utils/tokens");

const signupUser = async (req, res) => {
  const { department, name, email, password, contact, academicLevel } = req.body;

  try {
    const user = await User.signup(
      department,
      name,
      email,
      password,
      contact,
      academicLevel
    );
    res.status(200).json(buildAuthPayload(user));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    res.status(200).json(buildAuthPayload(user));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { signupUser, loginUser };
