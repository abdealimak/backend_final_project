/**
 * User Model
 * 
 * Stores all users: customers, merchants, and admins.
 * - passwordHash: only used for local (email/password) auth
 * - firebaseUid: only used for Firebase auth
 * - A user can have both if they register locally AND link Firebase
 */
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      default: null, // null for Firebase-only users
    },
    firebaseUid: {
      type: String,
      default: null, // null for local-only users
      sparse: true,  // allows multiple nulls in unique index
    },
    role: {
      type: String,
      enum: ['customer', 'merchant', 'admin'],
      default: 'customer',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model('User', userSchema);
