/**
 * Settlement Service
 * 
 * Calculates settlements for merchants based on their successful transactions.
 * A settlement is a summary of what the merchant earned over a period.
 * 
 * grossAmount = sum of transaction amounts
 * totalFees = sum of fees taken by the platform
 * netAmount = grossAmount - totalFees (what merchant receives)
 */
const Transaction = require('../models/Transaction');
const Settlement = require('../models/Settlement');

/**
 * Generate a settlement for a merchant over a date range.
 * Only considers successful, non-settled transactions.
 */
const generateSettlement = async (merchantId, periodStart, periodEnd) => {
  // Find all successful transactions for this merchant in the period
  const transactions = await Transaction.find({
    merchantId,
    status: 'success',
    createdAt: { $gte: periodStart, $lte: periodEnd },
  });

  if (transactions.length === 0) {
    return null; // No transactions to settle
  }

  // Calculate totals
  let grossAmount = 0;
  let totalFees = 0;

  transactions.forEach((txn) => {
    grossAmount += txn.amount;
    totalFees += txn.fee;
  });

  const netAmount = grossAmount - totalFees;

  // Create settlement record
  const settlement = await Settlement.create({
    merchantId,
    grossAmount: parseFloat(grossAmount.toFixed(2)),
    totalFees: parseFloat(totalFees.toFixed(2)),
    netAmount: parseFloat(netAmount.toFixed(2)),
    periodStart,
    periodEnd,
    status: 'pending',
  });

  return settlement;
};

module.exports = { generateSettlement };
