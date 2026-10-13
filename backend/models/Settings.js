/**
 * Settings Model
 * 
 * A SINGLETON document — only one Settings document exists in the database.
 * Stores platform-wide configuration like transaction fees and settlement rules.
 * 
 * Admin can update these values via PUT /api/admin/fees and PUT /api/admin/settlement-rules
 */
const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    transactionFeePercentage: {
      type: Number,
      default: 2, // 2% fee on each transaction
      min: 0,
      max: 20,
    },
    settlementFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily',
    },
    minimumSettlementAmount: {
      type: Number,
      default: 1000, // minimum ₹1000 to trigger settlement
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Static method to get the settings (creates default if none exist).
 * This ensures there's always exactly one settings document.
 */
settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
