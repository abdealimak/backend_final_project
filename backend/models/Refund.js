/**
 * Refund Model
 * 
 * Created when a customer requests a refund for a successful transaction.
 * Flow: requested → approved → refunded (or rejected)
 */
const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema(
  {
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      required: true,
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
    amount: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['requested', 'approved', 'refunded', 'rejected'],
      default: 'requested',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Refund', refundSchema);
