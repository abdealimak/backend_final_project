/**
 * PaymentMethod Model
 * 
 * Stores SIMULATED payment methods for customers.
 * Types: card, upi, wallet
 * 
 * IMPORTANT: This is a simulation!
 * - For cards: only store last4 and brand (NEVER store CVV or full number)
 * - For UPI: store a simulated UPI ID
 * - For wallet: store provider name
 */
const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['card', 'upi', 'wallet'],
      required: true,
    },
    provider: {
      type: String,
      required: true, // e.g., "Visa", "Mastercard", "Google Pay", "Paytm"
    },
    last4: {
      type: String,
      default: null, // only for card type
    },
    upiId: {
      type: String,
      default: null, // only for upi type, e.g., "user@upi"
    },
    nickname: {
      type: String,
      default: '', // friendly name like "My Visa Card"
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
