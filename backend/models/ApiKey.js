/**
 * ApiKey Model
 * 
 * Merchants get simulated API keys for integration.
 * Keys look like: pk_test_xxxxxxxxxxxx
 * 
 * In a real system, keys would be hashed before storage.
 * For this academic project, we store them directly for easy demo.
 */
const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      required: true,
    },
    name: {
      type: String,
      required: true, // e.g., "Production Key", "Test Key"
    },
    key: {
      type: String,
      required: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ApiKey', apiKeySchema);
