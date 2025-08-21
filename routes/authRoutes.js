const express = require('express');
const router = express.Router();

const { 
    loginUser,
    logoutUser
} = require('../controllers/authController');

const verifyToken = require('../middleware/verifyToken');

router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/checkAuth', verifyToken, async (req, res) => {
  try {
    // Return user info from the token
    res.json({ user: req.user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;