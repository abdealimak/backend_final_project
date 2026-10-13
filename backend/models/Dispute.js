/**
 * Dispute Model
 * 
 * Customers can raise disputes on transactions.
 * Flow: open → under_review → resolved
 */
const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema(
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
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'under_review', 'resolved'],
      default: 'open',
    },
    resolution: {
      type: String,
      default: '', // admin's resolution note
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Dispute', disputeSchema);
