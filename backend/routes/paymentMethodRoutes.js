/**
 * Payment Method Routes
 * 
 * POST   /api/payment-methods      - Add payment method
 * GET    /api/payment-methods      - List payment methods
 * DELETE /api/payment-methods/:id  - Remove payment method
 */
const express = require('express');
const router = express.Router();
const {
  addPaymentMethod,
  getPaymentMethods,
  deletePaymentMethod,
} = require('../controllers/paymentMethodController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const { validatePaymentMethod, handleValidation } = require('../middleware/validationMiddleware');

router.use(authMiddleware);
router.use(authorizeRoles('customer'));

router.post('/', validatePaymentMethod, handleValidation, addPaymentMethod);
router.get('/', getPaymentMethods);
router.delete('/:id', deletePaymentMethod);

module.exports = router;
