const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const Users = require('../models/user');
const ConfirmationCode = require('../models/confirmationCode');
const sendEmail = require('../utils/sendEmail');

// util
const generateCode = require("../utils/generateCode");


const generateConfirmationCode = async (req, res) => {
  const { email } = req.body;
  const code = generateCode();

  if (!email) {
    return res.status(400).json({ error: 'Please provide an email.' });
  }

  const emailExist = await Users.findOne({ email });
  if (!emailExist) {
    return res.status(404).json({ error: 'Email not found.' });
  }

  try {
    const recentCode = await ConfirmationCode.findOne({ userEmail: email }).sort({ createdAt: -1 });

    const cooldownMs = 60 * 1000; // 1-minute cooldown
    if (recentCode) {
      const timeElapsed = Date.now() - new Date(recentCode.createdAt).getTime();
      if (timeElapsed < cooldownMs) {
        const secondsLeft = Math.ceil((cooldownMs - timeElapsed) / 1000);
        return res.status(429).json({
          error: `Please wait ${secondsLeft} seconds before requesting another code.`,
          cooldown: secondsLeft
        });
      }
    }

    const newConfirmationCode = new ConfirmationCode({
      userEmail: email,
      code
    });

    await newConfirmationCode.save();
    await sendEmail(email, code);

    return res.status(200).json({ message: 'Confirmation code created and sent.' });

  } catch (err) {
    console.error('Error generating confirmation code:', err);
    return res.status(500).json({ error: 'Server error while generating confirmation code.' });
  }
};  


const verifyCode = async (req, res) => {
  const { email, code } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Something went wrong. Please refresh the page and try again.' });
  }

  if (!code) {
    return res.status(400).json({ error: 'Please enter the verification code.' });
  }

  try {
    const record = await ConfirmationCode.findOne({ userEmail: email, code });

    if (!record) {
      return res.status(404).json({ error: 'Invalid or expired code.' });
    } 

    const isExpired = new Date() > new Date(record.expiresAt);
    if (isExpired) {
      return res.status(410).json({ error: 'Code has expired.' });
    }

    // Generate reset token and expiry
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update confirmation code record
    record.resetToken = resetToken;
    record.resetTokenExpires = resetTokenExpires;
    await record.save();

    return res.status(200).json({
      message: 'Code verified successfully.',
      resetToken
    });

  } catch (err) {
    console.error('Error verifying code:', err);
    return res.status(500).json({ error: 'Server error while verifying code.' });
  }
};

const checkPasswordResetAccess = async (req, res) => {
  const { email, code, resetToken, newPassword } = req.body;
  
  if(newPassword.length < 6){
    return res.status(400).json({error: "Password must be at least 6 characters."})
  }

  // Input validation
  if (!email || !code || !resetToken) {
    return res.status(400).json({ error: 'Something went wrong. Please refresh the page and try again.' });
  }

  if (!newPassword) {
    return res.status(400).json({ error: 'Please fill in all required fields.' });
  }

  try {
    // Find the confirmation record
    const resetRequest = await ConfirmationCode.findOne({
      userEmail: email,
      code,
      resetToken
    });

    if (!resetRequest) {
      return res.status(403).json({ error: 'Invalid or expired reset session. Please restart the reset process.' });
    }

    // Optional: Check if the confirmation code has expired
    if (new Date() > resetRequest.expiresAt) {
      return res.status(410).json({ error: 'Reset token has expired. Please request a new one.' });
    }

    // Hash the new password using bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    await Users.findOneAndUpdate({ email }, { password: hashedPassword });

    // Clean up: remove all confirmation records for the user
    await ConfirmationCode.deleteMany({ userEmail: email });

    return res.status(200).json({ message: 'Password has been reset successfully.' });

  } catch (err) {
    console.error('Error during password reset:', err);
    return res.status(500).json({ error: 'Server error while resetting password.' });
  }
};

module.exports = {
  generateConfirmationCode,
  verifyCode,
  checkPasswordResetAccess
};
