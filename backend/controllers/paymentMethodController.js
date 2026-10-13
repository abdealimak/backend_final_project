/**
 * Payment Method Controller
 * 
 * Handles CRUD for simulated payment methods (card, UPI, wallet).
 * Each payment method belongs to a customer.
 */
const PaymentMethod = require('../models/PaymentMethod');

/**
 * POST /api/payment-methods
 * Add a new payment method for the logged-in customer
 */
const addPaymentMethod = async (req, res) => {
  try {
    const { type, provider, last4, upiId, nickname } = req.body;

    const paymentMethod = await PaymentMethod.create({
      userId: req.user._id,
      type,
      provider,
      last4: type === 'card' ? last4 : null,
      upiId: type === 'upi' ? upiId : null,
      nickname: nickname || `My ${provider}`,
    });

    res.status(201).json({
      success: true,
      message: 'Payment method added successfully',
      data: paymentMethod,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add payment method: ' + error.message,
    });
  }
};

/**
 * GET /api/payment-methods
 * Get all payment methods for the logged-in customer
 */
const getPaymentMethods = async (req, res) => {
  try {
    const methods = await PaymentMethod.find({
      userId: req.user._id,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: methods,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment methods: ' + error.message,
    });
  }
};

/**
 * DELETE /api/payment-methods/:id
 * Soft-delete a payment method (set isActive = false)
 */
const deletePaymentMethod = async (req, res) => {
  try {
    const method = await PaymentMethod.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!method) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found',
      });
    }

    method.isActive = false;
    await method.save();

    res.status(200).json({
      success: true,
      message: 'Payment method removed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete payment method: ' + error.message,
    });
  }
};

module.exports = { addPaymentMethod, getPaymentMethods, deletePaymentMethod };
