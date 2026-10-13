/**
 * Payment Routes
 * 
 * POST /api/payments           - Create payment (customer)
 * GET  /api/payments           - List customer's transactions
 * GET  /api/payments/:id       - Get single transaction
 * POST /api/payments/refund    - Request refund (customer)
 * POST /api/payments/:id/dispute   - Create dispute (customer)
 * GET  /api/payments/:id/disputes  - Get disputes for a transaction
 */
const express = require('express');
const router = express.Router();
const {
  createPayment,
  getTransactions,
  getTransactionById,
  requestRefund,
  createDispute,
  getDisputesByTransaction,
} = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const {
  validatePayment,
  validateRefund,
  validateDispute,
  handleValidation,
} = require('../middleware/validationMiddleware');

// All payment routes require authentication
router.use(authMiddleware);

// Payment CRUD
router.post('/', authorizeRoles('customer'), validatePayment, handleValidation, createPayment);
router.get('/', authorizeRoles('customer'), getTransactions);
router.post('/refund', authorizeRoles('customer'), validateRefund, handleValidation, requestRefund);

// Transaction detail and disputes (must be after /refund to avoid route conflicts)
router.get('/:id', authorizeRoles('customer', 'merchant', 'admin'), getTransactionById);
router.post('/:id/dispute', authorizeRoles('customer'), validateDispute, handleValidation, createDispute);
router.get('/:id/disputes', authorizeRoles('customer', 'admin'), getDisputesByTransaction);

module.exports = router;
