/**
 * API Key Authentication Middleware
 * 
 * For merchant integration scenarios.
 * Merchants include their API key in the x-api-key header.
 * 
 * Usage: router.post('/merchant-endpoint', apiKeyMiddleware, controller)
 */
const ApiKey = require('../models/ApiKey');

const apiKeyMiddleware = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key is required. Provide it in the x-api-key header.',
      });
    }

    // Find the key in database
    const keyDoc = await ApiKey.findOne({ key: apiKey, isActive: true });
    if (!keyDoc) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or deactivated API key.',
      });
    }

    // Update last used timestamp
    keyDoc.lastUsedAt = new Date();
    await keyDoc.save();

    // Attach merchant ID to request
    req.merchantId = keyDoc.merchantId;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'API key verification failed.',
    });
  }
};

module.exports = apiKeyMiddleware;
