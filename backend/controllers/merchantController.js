/**
 * Merchant Controller
 * 
 * Handles:
 * - Merchant registration (creates both Merchant and updates User role)
 * - Merchant listing and detail
 * - Merchant transactions (incoming payments)
 * - API key management (generate, list, delete)
 */
const Merchant = require('../models/Merchant');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const ApiKey = require('../models/ApiKey');
const generateApiKey = require('../utils/generateApiKey');

/**
 * POST /api/merchants/register
 * Register as a merchant (creates a Merchant profile)
 */
const registerMerchant = async (req, res) => {
  try {
    const { businessName, description } = req.body;

    // Check if user already has a merchant profile
    const existing = await Merchant.findOne({ ownerId: req.user._id });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You already have a merchant account',
      });
    }

    // Create merchant profile
    const merchant = await Merchant.create({
      businessName,
      email: req.user.email,
      ownerId: req.user._id,
      description: description || '',
    });

    // Update user role to merchant
    await User.findByIdAndUpdate(req.user._id, { role: 'merchant' });

    res.status(201).json({
      success: true,
      message: 'Merchant registered successfully',
      data: merchant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Merchant registration failed: ' + error.message,
    });
  }
};

/**
 * GET /api/merchants
 * List all active merchants (public endpoint for customers to pick a merchant)
 */
const getMerchants = async (req, res) => {
  try {
    const merchants = await Merchant.find({ status: 'active' })
      .select('businessName description email')
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
 * GET /api/merchants/:id
 * Get merchant details
 */
const getMerchantById = async (req, res) => {
  try {
    const merchant = await Merchant.findById(req.params.id)
      .populate('ownerId', 'name email');

    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: 'Merchant not found',
      });
    }

    res.status(200).json({
      success: true,
      data: merchant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch merchant: ' + error.message,
    });
  }
};

/**
 * GET /api/merchants/:id/transactions
 * Get incoming transactions for a merchant
 */
const getMerchantTransactions = async (req, res) => {
  try {
    // Security: merchants can only view their own transactions (unless admin)
    if (req.user.role === 'merchant') {
      const merchant = await Merchant.findOne({ ownerId: req.user._id });
      if (!merchant || merchant._id.toString() !== req.params.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only view your own merchant transactions',
        });
      }
    }

    const transactions = await Transaction.find({ merchantId: req.params.id })
      .populate('customerId', 'name email')
      .populate('paymentMethodId', 'type provider')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch merchant transactions: ' + error.message,
    });
  }
};

/**
 * POST /api/merchants/keys
 * Generate a new API key for the merchant
 */
const createApiKey = async (req, res) => {
  try {
    const merchant = await Merchant.findOne({ ownerId: req.user._id });
    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: 'Merchant profile not found',
      });
    }

    const { name } = req.body;
    const key = generateApiKey();

    const apiKey = await ApiKey.create({
      merchantId: merchant._id,
      name: name || 'API Key',
      key,
    });

    // Show the key ONCE — in a real system, you'd only show it at creation time
    res.status(201).json({
      success: true,
      message: 'API key generated. Save it securely — it won\'t be shown again in full.',
      data: {
        id: apiKey._id,
        name: apiKey.name,
        key: apiKey.key, // Show full key only at creation
        createdAt: apiKey.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate API key: ' + error.message,
    });
  }
};

/**
 * GET /api/merchants/keys
 * List API keys for the merchant (masked for security)
 */
const getApiKeys = async (req, res) => {
  try {
    const merchant = await Merchant.findOne({ ownerId: req.user._id });
    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: 'Merchant profile not found',
      });
    }

    const keys = await ApiKey.find({ merchantId: merchant._id }).sort({
      createdAt: -1,
    });

    // Mask keys for security (show only last 8 characters)
    const maskedKeys = keys.map((k) => ({
      id: k._id,
      name: k.name,
      key: `pk_test_****${k.key.slice(-8)}`,
      isActive: k.isActive,
      lastUsedAt: k.lastUsedAt,
      createdAt: k.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: maskedKeys,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch API keys: ' + error.message,
    });
  }
};

/**
 * DELETE /api/merchants/keys/:id
 * Revoke/delete an API key
 */
const deleteApiKey = async (req, res) => {
  try {
    const merchant = await Merchant.findOne({ ownerId: req.user._id });
    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: 'Merchant profile not found',
      });
    }

    const key = await ApiKey.findOne({
      _id: req.params.id,
      merchantId: merchant._id,
    });

    if (!key) {
      return res.status(404).json({
        success: false,
        message: 'API key not found',
      });
    }

    key.isActive = false;
    await key.save();

    res.status(200).json({
      success: true,
      message: 'API key revoked successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete API key: ' + error.message,
    });
  }
};

module.exports = {
  registerMerchant,
  getMerchants,
  getMerchantById,
  getMerchantTransactions,
  createApiKey,
  getApiKeys,
  deleteApiKey,
};
