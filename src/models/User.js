const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const TodoUserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true,
    unique: true
  },
  userPassword: {
    type: String,
    required: true
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  userCreatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
TodoUserSchema.pre('save', async function(next) {
  if (!this.isModified('userPassword')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.userPassword = await bcrypt.hash(this.userPassword, salt);
});

// Compare entered password with hashed password
TodoUserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.userPassword);
};

module.exports = mongoose.model('User', TodoUserSchema);