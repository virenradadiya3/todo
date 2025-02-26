const mongoose = require('mongoose');

const InvalidTokenSchema = new mongoose.Schema({
  tokenString: {
    type: String,
    required: true,
    unique: true
  },
  tokenExpiry: {
    type: Date,
    required: true
  }
});

// Create index that automatically removes expired documents
InvalidTokenSchema.index({ tokenExpiry: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('BlacklistedToken', InvalidTokenSchema); 