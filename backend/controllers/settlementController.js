/**
 * Settlement Controller
 * 
 * Handles settlement listing and generation.
 * Settlements summarize a merchant's earnings over a period.
 */
const Settlement = require('../models/Settlement');
const Merchant = require('../models/Merchant');
const { generateSettlement } = require('../services/settlementService');

/**
 * GET /api/settlements
 * Get settlements — merchants see their own, admins see all
 */
const getSettlements = async (req, res) => {
  try {
    let query = {};

    // Merchants can only see their own settlements
    if (req.user.role === 'merchant') {
      const merchant = await Merchant.findOne({ ownerId: req.user._id });
      if (!merchant) {
        return res.status(404).json({
          success: false,
          message: 'Merchant profile not found',
        });
      }
      query.merchantId = merchant._id;
    }

    const settlements = await Settlement.find(query)
      .populate('merchantId', 'businessName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: settlements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settlements: ' + error.message,
    });
  }
};

/**
 * GET /api/settlements/:id
 * Get a single settlement by ID
 */
const getSettlementById = async (req, res) => {
  try {
    const settlement = await Settlement.findById(req.params.id)
      .populate('merchantId', 'businessName');

    if (!settlement) {
      return res.status(404).json({
        success: false,
        message: 'Settlement not found',
      });
    }

    // Security check for merchants
    if (req.user.role === 'merchant') {
      const merchant = await Merchant.findOne({ ownerId: req.user._id });
      if (!merchant || settlement.merchantId._id.toString() !== merchant._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
    }

    res.status(200).json({
      success: true,
      data: settlement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settlement: ' + error.message,
    });
  }
};

/**
 * POST /api/settlements/generate
 * Generate a settlement for a merchant (merchant or admin)
 * This is for demo purposes — generates a settlement for the last 30 days
 */
const createSettlement = async (req, res) => {
  try {
    let merchantId;

    if (req.user.role === 'merchant') {
      const merchant = await Merchant.findOne({ ownerId: req.user._id });
      if (!merchant) {
        return res.status(404).json({
          success: false,
          message: 'Merchant profile not found',
        });
      }
      merchantId = merchant._id;
    } else if (req.body.merchantId) {
      merchantId = req.body.merchantId;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Merchant ID is required',
      });
    }

    // Generate settlement for the last 30 days
    const periodEnd = new Date();
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - 30);

    const settlement = await generateSettlement(merchantId, periodStart, periodEnd);

    if (!settlement) {
      return res.status(400).json({
        success: false,
        message: 'No successful transactions found for the given period',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Settlement generated successfully',
      data: settlement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate settlement: ' + error.message,
    });
  }
};

module.exports = { getSettlements, getSettlementById, createSettlement };
