const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
  role: {
    type: String,
    // Hierarchy (low → high): developer < lead < manager < super_manager
    enum: ['developer', 'lead', 'manager', 'super_manager'],
    default: 'developer',
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
