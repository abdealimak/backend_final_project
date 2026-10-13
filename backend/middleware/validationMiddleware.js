/**
 * Validation Middleware
 * 
 * Uses express-validator to validate incoming request data.
 * Each function returns an array of validation rules.
 * 
 * Usage in routes:
 *   router.post('/register', validateRegister, handleValidation, controller)
 */
const { body, validationResult } = require('express-validator');

/**
 * handleValidation — checks if any validation errors occurred.
 * If yes, returns 400 with error details. If no, continues to controller.
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// --- Validation rule sets ---

const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const validatePayment = [
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Amount must be greater than 0'),
  body('merchantId').notEmpty().withMessage('Merchant ID is required'),
  body('paymentMethodId')
    .notEmpty()
    .withMessage('Payment method ID is required'),
];

const validatePaymentMethod = [
  body('type')
    .isIn(['card', 'upi', 'wallet'])
    .withMessage('Type must be card, upi, or wallet'),
  body('provider').trim().notEmpty().withMessage('Provider is required'),
];

const validateRefund = [
  body('transactionId').notEmpty().withMessage('Transaction ID is required'),
  body('reason').trim().notEmpty().withMessage('Reason is required'),
];

const validateFee = [
  body('transactionFeePercentage')
    .isFloat({ min: 0, max: 20 })
    .withMessage('Fee must be between 0 and 20 percent'),
];

const validateSettlementRules = [
  body('settlementFrequency')
    .optional()
    .isIn(['daily', 'weekly', 'monthly'])
    .withMessage('Frequency must be daily, weekly, or monthly'),
  body('minimumSettlementAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum amount must be 0 or greater'),
];

const validateDispute = [
  body('reason').trim().notEmpty().withMessage('Reason is required'),
];

module.exports = {
  handleValidation,
  validateRegister,
  validateLogin,
  validatePayment,
  validatePaymentMethod,
  validateRefund,
  validateFee,
  validateSettlementRules,
  validateDispute,
};
