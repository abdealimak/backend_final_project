/**
 * Refund Routes
 * 
 * GET  /api/refunds               - List refunds (customer, merchant, admin)
 * POST /api/refunds/request       - Request a refund (customer)
 * PUT  /api/refunds/:id/approve   - Approve refund (merchant, admin)
 * PUT  /api/refunds/:id/reject    - Reject refund (merchant, admin)
 */
const express = require('express');
const router = express.Router();
const {
  getRefunds,
  requestRefund,
  approveRefund,
  rejectRefund,
} = require('../controllers/refundController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// All refund routes require authentication
router.use(authMiddleware);

// Get refunds (accessible by customer, merchant, admin)
router.get('/', authorizeRoles('customer', 'merchant', 'admin'), getRefunds);

// Request refund (customer only)
router.post('/request', authorizeRoles('customer'), requestRefund);

// Approve / Reject (merchant, admin)
router.put('/:id/approve', authorizeRoles('merchant', 'admin'), approveRefund);
router.put('/:id/reject', authorizeRoles('merchant', 'admin'), rejectRefund);

module.exports = router;
