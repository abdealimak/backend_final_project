/**
 * Fraud Controller
 * 
 * Handles:
 * - Manual fraud check on a transaction amount
 * - Viewing fraud reports
 */
const FraudReport = require('../models/FraudReport');
const { checkFraud } = require('../services/fraudService');

/**
 * POST /api/fraud/check
 * Manually check if an amount/customer would be flagged
 * Useful for testing fraud detection rules
 */
const fraudCheck = async (req, res) => {
  try {
    const { amount, customerId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required',
      });
    }

    const result = await checkFraud({
      amount,
      customerId: customerId || req.user._id,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Fraud check failed: ' + error.message,
    });
  }
};

/**
 * GET /api/fraud/reports
 * Get all fraud reports (admin only)
 */
const getFraudReports = async (req, res) => {
  try {
    const reports = await FraudReport.find()
      .populate('transactionId', 'transactionId amount status')
      .populate('customerId', 'name email')
      .populate('merchantId', 'businessName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fraud reports: ' + error.message,
    });
  }
};

module.exports = { fraudCheck, getFraudReports };
