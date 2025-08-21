const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const UserSchema = new mongoose.Schema({
  profilePic: { type: String, default: '' },
  userID: { type: String, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullname: { type: String, required: true },
  roleName: { type: String, default: 'Client' },
  role: { type: Number, default: 3 }
}, { collection: 'users' }, { timestamps: true });

// Combined pre-save hook
UserSchema.pre('save', async function (next) {
  try {
    // Generate userID if not present
    if (!this.userID) {
      this.userID = 'usr_' + uuidv4().slice(0, 8);
    }
    
    // Hash password if modified
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('User', UserSchema);