/**
 * Merchant Routes
 * 
 * POST /api/merchants/register          - Register as merchant
 * GET  /api/merchants                   - List merchants
 * GET  /api/merchants/:id               - Get merchant details
 * GET  /api/merchants/:id/transactions  - Get merchant's incoming payments
 * POST /api/merchants/keys              - Generate API key
 * GET  /api/merchants/keys              - List API keys
 * DELETE /api/merchants/keys/:id        - Revoke API key
 */
const express = require('express');
const router = express.Router();
const {
  registerMerchant,
  getMerchants,
  getMerchantById,
  getMerchantTransactions,
  createApiKey,
  getApiKeys,
  deleteApiKey,
} = require('../controllers/merchantController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// Public route — customers need to see available merchants
router.get('/', authMiddleware, getMerchants);

// Merchant registration
router.post('/register', authMiddleware, registerMerchant);

// API key management (merchant only)
router.post('/keys', authMiddleware, authorizeRoles('merchant'), createApiKey);
router.get('/keys', authMiddleware, authorizeRoles('merchant'), getApiKeys);
router.delete('/keys/:id', authMiddleware, authorizeRoles('merchant'), deleteApiKey);

// Merchant detail and transactions
router.get('/:id', authMiddleware, getMerchantById);
router.get(
  '/:id/transactions',
  authMiddleware,
  authorizeRoles('merchant', 'admin'),
  getMerchantTransactions
);

module.exports = router;
