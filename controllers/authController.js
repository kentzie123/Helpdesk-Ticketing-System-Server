const User = require("../models/user");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

// LOGIN
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    generateToken(
      {
        userID: user.userID,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
      },
      res
    );

    res.json({
      message: "Login successful",
      user: {
        userID: user.userID,
        profilePic: user.profilePic,
        email: user.email,
        fullname: user.fullname,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error during login" });
  }
};

// LOGOUT
const logoutUser = (req, res) => {
  res.clearCookie("access", {
    httpOnly: true,
    secure: false,
    sameSite: "lax", 
  });

  res.status(200).json({ message: "Logged out successfully" });
};

module.exports = {
  loginUser,
  logoutUser,
};
