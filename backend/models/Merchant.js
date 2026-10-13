/**
 * Merchant Model
 * 
 * Stores business details for users with role "merchant".
 * - ownerId: references the User who owns this merchant account
 * - balance: tracks the merchant's accumulated payment balance (simulated)
 */
const mongoose = require('mongoose');

const merchantSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    balance: {
      type: Number,
      default: 0, // accumulated from successful payments minus fees
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Merchant', merchantSchema);
