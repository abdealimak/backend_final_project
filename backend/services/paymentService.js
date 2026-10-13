/**
 * Payment Processing Service
 * 
 * SIMULATES payment processing. No real money involved!
 * 
 * Simulation Rules (deterministic for reliable testing):
 * - amount > 100000 → status: "pending" (large amount needs review)
 * - amount === 13    → status: "failed"  (test failure trigger)
 * - everything else  → status: "success"
 * 
 * Also calculates transaction fee based on platform settings.
 */
const Settings = require('../models/Settings');

/**
 * Calculate the transaction fee and net amount
 */
const calculateFee = async (amount) => {
  const settings = await Settings.getSettings();
  const feePercentage = settings.transactionFeePercentage;
  const fee = parseFloat(((amount * feePercentage) / 100).toFixed(2));
  const netAmount = parseFloat((amount - fee).toFixed(2));
  return { fee, netAmount, feePercentage };
};

/**
 * Simulate payment status based on amount
 */
const simulatePaymentStatus = (amount) => {
  if (amount > 100000) {
    return 'pending'; // Large amounts go to pending for review
  }
  if (amount === 13) {
    return 'failed'; // Test failure trigger
  }
  return 'success'; // Normal payments succeed
};

module.exports = { calculateFee, simulatePaymentStatus };
