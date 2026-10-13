/**
 * FraudReport Model
 * 
 * Created when the fraud detection service flags a transaction.
 * Stores the reason why it was flagged and the risk level.
 */
const mongoose = require('mongoose');

const fraudReportSchema = new mongoose.Schema(
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
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    flagged: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('FraudReport', fraudReportSchema);
