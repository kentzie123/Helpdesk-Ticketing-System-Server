const bcrypt = require("bcryptjs");

// Models
const User = require("../models/user");
const ConfirmationCode = require("../models/confirmationCode");

// Utils
const sendEmail = require("../utils/sendEmail");
const generateCode = require("../utils/generateCode");

const getAllUsers = async (req, res) => {
  try {
    const { userID } = req.user;
    const users = await User.find(
      {
        userID: { $ne: userID },
      },
      { password: 0 }
    );
    // const users = await User.find({});
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Server error while fetching users" });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params; // User ID from URL
  try {
    const findUser = await User.findOne({ userID: id });
    if (!findUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(findUser);
  } catch (err) {
    res.status(500).json({ error: "Server error while fetching user" });
  }
};

const createUser = async (req, res) => {
  const { email, password, fullname, role } = req.body;

  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters." });
  }

  if (!email || !password || !fullname || !role) {
    return res.status(400).json({ error: "Please fill all required fields." });
  }

  if (!role?.roleId || !role?.roleName) {
    return res.status(400).json({ error: "Invalid role object." });
  }

  try {
    const emailExist = await User.findOne({ email });
    if (emailExist) {
      return res.status(409).json({ error: "Email already used." });
    }

    const newUser = new User({
      email,
      password,
      fullname,
      roleName: role.roleName,
      role: role.roleId,
    });

    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while creating user" });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, fullname, role, password } = req.body;

  if (password) {
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters." });
    }
  }

  if (!email || !fullname || !role) {
    return res.status(400).json({ error: "Please fill all required fields." });
  }

  if (!id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const user = await User.findOne({ userID: id }); // Using custom userID
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prevent duplicate emails if changed
    if (email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ error: "Email already in use" });
      }
      user.email = email;
    }

    // Update fields
    user.fullname = fullname;
    user.role = role.roleId;
    user.roleName = role.roleName;
    // Handle password update if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.json({
      message: "User updated successfully",
      user: {
        userID: user.userID,
        email: user.email,
        fullname: user.fullname,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error while updating user" });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params; // Extract userID from URL

  if (!id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    // Find and delete the user by userID (not MongoDB's default _id)
    const deletedUser = await User.findOneAndDelete({ userID: id });

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return success (without sensitive data)
    res.json({
      message: "User deleted successfully",
      deletedUser: {
        userID: deletedUser.userID,
        email: deletedUser.email,
        fullname: deletedUser.fullname,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error while deleting user" });
  }
};

const signUpGenerateConfirmationCode = async (req, res) => {
  const { email, password, fullname } = req.body;

  const code = generateCode();

  if (!email || !password || !fullname) {
    return res.status(400).json({ error: "Please fill all required fields." });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters." });
  }

  try {
    const emailExist = await User.findOne({ email });

    if (emailExist) {
      return res.status(409).json({ error: "Email already used." });
    }

    const recentCode = await ConfirmationCode.findOne({
      userEmail: email,
    }).sort({ createdAt: -1 });

    const newConfirmationCode = new ConfirmationCode({
      userEmail: email,
      code,
    });

    await newConfirmationCode.save();
    await sendEmail(email, code);

    return res
      .status(200)
      .json({ message: "Confirmation code created and sent." });
  } catch (err) {
    console.error("Error generating confirmation code:", err);
    return res
      .status(500)
      .json({ error: "Server error while generating confirmation code." });
  }
};

// Create a new user
const SignUpCreateUser = async (req, res) => {
  const { email, password, fullname, code } = req.body;

  if (!email || !password || !fullname) {
    return res.status(400).json({
      error: "Missing required fields. Please refresh the page and try again.",
    });
  }

  if (!code) {
    return res
      .status(400)
      .json({ error: "Please enter the verification code." });
  }

  try {
    const record = await ConfirmationCode.findOne({ userEmail: email, code });

    if (!record) {
      return res.status(404).json({ error: "Invalid or expired code." });
    }

    const isExpired = new Date() > new Date(record.expiresAt);
    if (isExpired) {
      return res.status(410).json({ error: "Code has expired." });
    }

    // Input validation
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "Email already exists" });
    }

    await ConfirmationCode.deleteMany({ userEmail: email });

    const newUser = new User({
      email,
      password,
      fullname,
    });

    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server error while verifying code." });
  }
};

module.exports = {
  getAllUsers,
  SignUpCreateUser,
  updateUser,
  deleteUser,
  signUpGenerateConfirmationCode,
  createUser,
  getUserById,
};
