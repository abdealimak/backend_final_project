/**
 * Fraud Detection Service
 * 
 * Simple RULE-BASED fraud detection (NOT machine learning).
 * 
 * Rules:
 * 1. Amount > 50000 → high risk
 * 2. Amount === 13 → medium risk (test trigger for demos)
 * 3. More than 5 transactions by same customer in last 10 minutes → high risk
 * 
 * Returns: { flagged, riskLevel, reason }
 */
const Transaction = require('../models/Transaction');

const checkFraud = async ({ amount, customerId }) => {
  // Rule 1: Large transaction amount
  if (amount > 50000) {
    return {
      flagged: true,
      riskLevel: 'high',
      reason: 'Large transaction amount exceeds ₹50,000',
    };
  }

  // Rule 2: Test trigger amount (useful for demos)
  if (amount === 13) {
    return {
      flagged: true,
      riskLevel: 'medium',
      reason: 'Suspicious test amount detected',
    };
  }

  // Rule 3: Rapid transactions (more than 5 in last 10 minutes)
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const recentCount = await Transaction.countDocuments({
    customerId,
    createdAt: { $gte: tenMinutesAgo },
  });

  if (recentCount >= 5) {
    return {
      flagged: true,
      riskLevel: 'high',
      reason: `Rapid transactions detected: ${recentCount + 1} transactions in 10 minutes`,
    };
  }

  // No fraud detected
  return {
    flagged: false,
    riskLevel: 'low',
    reason: 'No suspicious activity detected',
  };
};

module.exports = { checkFraud };
