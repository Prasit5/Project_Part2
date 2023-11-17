const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    required: false,
    default: Date.now
  },
  updated: {
    type: Date,
    required: false,
    default: Date.now
  }
});

// Middleware to update 'updated' field before saving
userSchema.pre('save', function (next) {
  this.updated = new Date(); // Update 'updated' field with the current date
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
