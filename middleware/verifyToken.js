const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.cookies.access; // 🔐 Get cookie named "access"

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
 
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded.user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

module.exports = verifyToken;
