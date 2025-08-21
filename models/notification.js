const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  notificationId: { type: String, required: true, unique: true },
  receiverUserId: { type: String, required: true }, 
  ticketId: { type: String, default: null }, 
  title: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['Unread', 'Read'], default: 'Unread' },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  type: { type: String, enum: ['Ticket Assignment', 'Ticket Update']} 
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
