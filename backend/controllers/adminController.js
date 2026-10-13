/**
 * Admin Controller
 * 
 * Admin-only operations:
 * - View all transactions
 * - Generate reports (aggregated stats)
 * - Configure fees
 * - Configure settlement rules
 * - Manage users and merchants
 * - View and manage disputes
 */
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Merchant = require('../models/Merchant');
const Refund = require('../models/Refund');
const Dispute = require('../models/Dispute');
const FraudReport = require('../models/FraudReport');
const Settings = require('../models/Settings');

/**
 * GET /api/admin/transactions
 * View all transactions across the platform
 */
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('customerId', 'name email')
      .populate('merchantId', 'businessName')
      .populate('paymentMethodId', 'type provider')
      .sort({ createdAt: -1 })
      .limit(100); // Limit for performance

    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions: ' + error.message,
    });
  }
};

/**
 * GET /api/admin/reports
 * Generate aggregated platform reports
 * 
 * Uses MongoDB aggregation to calculate totals efficiently
 */
const getReports = async (req, res) => {
  try {
    // Get transaction stats using aggregation
    const stats = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          successful: {
            $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] },
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
          },
          transactionVolume: { $sum: '$amount' },
          gatewayRevenue: { $sum: '$fee' },
        },
      },
    ]);

    // Get refund total
    const refundStats = await Refund.aggregate([
      { $match: { status: 'refunded' } },
      { $group: { _id: null, totalRefunds: { $sum: '$amount' } } },
    ]);

    // Get fraud count
    const fraudFlags = await FraudReport.countDocuments({ flagged: true });

    // Combine results
    const report = {
      totalTransactions: stats[0]?.totalTransactions || 0,
      successful: stats[0]?.successful || 0,
      failed: stats[0]?.failed || 0,
      pending: stats[0]?.pending || 0,
      transactionVolume: stats[0]?.transactionVolume || 0,
      gatewayRevenue: parseFloat((stats[0]?.gatewayRevenue || 0).toFixed(2)),
      totalRefunds: refundStats[0]?.totalRefunds || 0,
      fraudFlags,
    };

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate reports: ' + error.message,
    });
  }
};

/**
 * PUT /api/admin/fees
 * Update the transaction fee percentage
 */
const updateFees = async (req, res) => {
  try {
    const { transactionFeePercentage } = req.body;

    const settings = await Settings.getSettings();
    settings.transactionFeePercentage = transactionFeePercentage;
    await settings.save();

    res.status(200).json({
      success: true,
      message: `Transaction fee updated to ${transactionFeePercentage}%`,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update fees: ' + error.message,
    });
  }
};

/**
 * PUT /api/admin/settlement-rules
 * Update settlement configuration
 */
const updateSettlementRules = async (req, res) => {
  try {
    const { settlementFrequency, minimumSettlementAmount } = req.body;

    const settings = await Settings.getSettings();

    if (settlementFrequency) {
      settings.settlementFrequency = settlementFrequency;
    }
    if (minimumSettlementAmount !== undefined) {
      settings.minimumSettlementAmount = minimumSettlementAmount;
    }

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Settlement rules updated',
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update settlement rules: ' + error.message,
    });
  }
};

// --- User & Merchant Management ---

/**
 * GET /api/admin/users
 */
const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users: ' + error.message,
    });
  }
};

/**
 * PUT /api/admin/users/:id
 * Update user (toggle active, change role, etc.)
 */
const updateUser = async (req, res) => {
  try {
    const { isActive, role, name } = req.body;
    const updates = {};

    if (isActive !== undefined) updates.isActive = isActive;
    if (role) updates.role = role;
    if (name) updates.name = name;

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    }).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user: ' + error.message,
    });
  }
};

/**
 * DELETE /api/admin/users/:id
 * Deactivate a user (soft delete)
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deactivated',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete user: ' + error.message,
    });
  }
};

/**
 * GET /api/admin/merchants
 */
const getAdminMerchants = async (req, res) => {
  try {
    const merchants = await Merchant.find()
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: merchants,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch merchants: ' + error.message,
    });
  }
};

/**
 * PUT /api/admin/merchants/:id
 */
const updateMerchant = async (req, res) => {
  try {
    const { status, businessName } = req.body;
    const updates = {};

    if (status) updates.status = status;
    if (businessName) updates.businessName = businessName;

    const merchant = await Merchant.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: 'Merchant not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Merchant updated',
      data: merchant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update merchant: ' + error.message,
    });
  }
};

/**
 * DELETE /api/admin/merchants/:id
 */
const deleteMerchant = async (req, res) => {
  try {
    const merchant = await Merchant.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    );

    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: 'Merchant not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Merchant deactivated',
      data: merchant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete merchant: ' + error.message,
    });
  }
};

/**
 * GET /api/admin/disputes
 * View all disputes across the platform
 */
const getAllDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find()
      .populate('transactionId', 'transactionId amount status')
      .populate('customerId', 'name email')
      .populate('merchantId', 'businessName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: disputes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch disputes: ' + error.message,
    });
  }
};

/**
 * PUT /api/admin/disputes/:id
 * Update dispute status
 */
const updateDispute = async (req, res) => {
  try {
    const { status, resolution } = req.body;
    const updates = {};

    if (status) updates.status = status;
    if (resolution) updates.resolution = resolution;

    const dispute = await Dispute.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Dispute updated',
      data: dispute,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update dispute: ' + error.message,
    });
  }
};

/**
 * GET /api/admin/settings
 * Get current platform settings
 */
const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings: ' + error.message,
    });
  }
};

module.exports = {
  getAllTransactions,
  getReports,
  updateFees,
  updateSettlementRules,
  getUsers,
  updateUser,
  deleteUser,
  getAdminMerchants,
  updateMerchant,
  deleteMerchant,
  getAllDisputes,
  updateDispute,
  getSettings,
};
