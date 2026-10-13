/**
 * Transaction Model
 * 
 * The CORE model of PaySecure. Every payment creates a transaction.
 * 
 * - transactionId: a human-readable unique ID (e.g., "TXN_abc123")
 * - fee: calculated by backend (amount × feePercentage / 100)
 * - netAmount: amount - fee (what the merchant actually receives)
 * - fraudStatus: set by the fraud detection service
 */
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      default: () => `TXN_${uuidv4().slice(0, 12)}`, // e.g., "TXN_a1b2c3d4e5f6"
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      required: true,
    },
    paymentMethodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PaymentMethod',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    fee: {
      type: Number,
      default: 0,
    },
    netAmount: {
      type: Number,
      default: 0, // amount - fee
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
    },
    description: {
      type: String,
      default: '',
    },
    fraudStatus: {
      type: String,
      enum: ['clear', 'flagged', 'review'],
      default: 'clear',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Transaction', transactionSchema);
