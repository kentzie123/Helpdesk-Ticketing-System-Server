const jwt = require('jsonwebtoken');

const generateToken = (user, res) => {
  const token = jwt.sign({ user }, process.env.JWT_SECRET, {
    expiresIn: "2d",
  });

  res.cookie("access", token, {
    httpOnly: true,
    secure: false, // true if using HTTPS
    sameSite: "lax", // "None" if not same host change to "lax" for development
    maxAge: 2 * 24 * 60 * 60 * 1000 // 2 days
  });
};

module.exports = generateToken;