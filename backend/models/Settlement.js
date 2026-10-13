/**
 * Settlement Model
 * 
 * Represents a batch payout to a merchant.
 * Calculated from successful transactions over a period.
 * 
 * grossAmount = sum of all transaction amounts in the period
 * totalFees = sum of all fees
 * netAmount = grossAmount - totalFees (what merchant gets)
 */
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const settlementSchema = new mongoose.Schema(
  {
    settlementId: {
      type: String,
      unique: true,
      default: () => `STL_${uuidv4().slice(0, 12)}`,
    },
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      required: true,
    },
    grossAmount: {
      type: Number,
      required: true,
    },
    totalFees: {
      type: Number,
      required: true,
    },
    netAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processed'],
      default: 'pending',
    },
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
    },
    processedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Settlement', settlementSchema);
