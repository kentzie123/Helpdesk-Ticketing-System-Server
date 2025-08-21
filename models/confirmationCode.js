const mongoose = require('mongoose');

const ConfirmationCodeSchema = new mongoose.Schema({
  userEmail: { type: String },
  code: { type: String, unique: true },
  requestDate: { type: Date, default: Date.now },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 10 * 60 * 1000),
    expires: 0 // Will auto-delete after expiration
  },
  used: { type: Boolean, default: false },
  attempts: { type: Number, default: 0 },
  // for phase 3
  resetToken: { type: String },
  resetTokenExpires: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('ConfirmationCode', ConfirmationCodeSchema);
