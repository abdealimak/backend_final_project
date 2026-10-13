/**
 * Generate Simulated API Key
 * 
 * Creates a test-style API key for merchants.
 * Format: pk_test_xxxxxxxxxxxxxxxxxxxx
 * 
 * This is NOT a real payment key — it's for simulation only.
 */
const crypto = require('crypto');

const generateApiKey = () => {
  const randomPart = crypto.randomBytes(16).toString('hex'); // 32 hex characters
  return `pk_test_${randomPart}`;
};

module.exports = generateApiKey;
