/**
 * Refund Controller
 * 
 * Handles refund lifecycle:
 * 1. Customer requests refund (status: 'requested')
 * 2. Merchant/Admin tracks all refund requests
 * 3. Merchant/Admin approves or rejects refund
 */
const Refund = require('../models/Refund');
const Transaction = require('../models/Transaction');
const Merchant = require('../models/Merchant');

/**
 * GET /api/refunds
 * List refunds based on user role (customer, merchant, admin)
 */
const getRefunds = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'customer') {
      // Customer sees only their requested refunds
      query.customerId = req.user._id;
    } else if (req.user.role === 'merchant') {
      // Merchant sees refunds for their store
      const merchant = await Merchant.findOne({ ownerId: req.user._id });
      if (!merchant) {
        return res.status(404).json({
          success: false,
          message: 'Merchant profile not found',
        });
      }
      query.merchantId = merchant._id;
    }
    // Admin sees all refunds (query stays empty {})

    const refunds = await Refund.find(query)
      .populate('customerId', 'name email')
      .populate('merchantId', 'businessName')
      .populate('transactionId', 'transactionId amount description status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: refunds,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch refunds: ' + error.message,
    });
  }
};

/**
 * POST /api/refunds/request (or POST /api/payments/refund)
 * Customer initiates a refund request
 */
const requestRefund = async (req, res) => {
  try {
    const { transactionId, reason } = req.body;

    if (!transactionId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID and reason are required',
      });
    }

    // Find transaction
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    // Verify ownership
    if (transaction.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'This transaction does not belong to you',
      });
    }

    // Only successful transactions can be refunded
    if (transaction.status !== 'success') {
      return res.status(400).json({
        success: false,
        message: 'Only successful transactions can be refunded',
      });
    }

    // Check if already requested or processed
    const existingRefund = await Refund.findOne({
      transactionId,
      status: { $in: ['requested', 'approved', 'refunded'] },
    });
    if (existingRefund) {
      return res.status(409).json({
        success: false,
        message: 'A refund has already been requested for this transaction',
      });
    }

    // Create refund in 'requested' state
    const refund = await Refund.create({
      transactionId,
      customerId: req.user._id,
      merchantId: transaction.merchantId,
      amount: transaction.amount,
      reason,
      status: 'requested',
    });

    // Notify via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('refundRequested', {
        refundId: refund._id,
        transactionId: transaction.transactionId,
        amount: refund.amount,
        customerName: req.user.name,
        reason: refund.reason,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Refund requested successfully! Awaiting merchant review.',
      data: refund,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to request refund: ' + error.message,
    });
  }
};

/**
 * PUT /api/refunds/:id/approve
 * Merchant or Admin approves a requested refund
 */
const approveRefund = async (req, res) => {
  try {
    const refund = await Refund.findById(req.params.id)
      .populate('transactionId')
      .populate('merchantId');

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: 'Refund request not found',
      });
    }

    // Permission check for merchant
    if (req.user.role === 'merchant') {
      const merchant = await Merchant.findOne({ ownerId: req.user._id });
      if (!merchant || refund.merchantId._id.toString() !== merchant._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to approve this refund',
        });
      }
    }

    if (refund.status !== 'requested') {
      return res.status(400).json({
        success: false,
        message: `Refund is already ${refund.status}`,
      });
    }

    // Update refund status to refunded
    refund.status = 'refunded';
    await refund.save();

    // Update transaction status to refunded
    const transaction = await Transaction.findById(refund.transactionId._id);
    if (transaction) {
      transaction.status = 'refunded';
      await transaction.save();
    }

    // Deduct net amount from merchant balance
    const merchant = await Merchant.findById(refund.merchantId._id);
    if (merchant && transaction) {
      merchant.balance = Math.max(0, merchant.balance - transaction.netAmount);
      await merchant.save();
    }

    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      io.emit('paymentRefunded', {
        refundId: refund._id,
        transactionId: transaction ? transaction.transactionId : '',
        amount: refund.amount,
        status: 'refunded',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Refund approved and processed successfully!',
      data: refund,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to approve refund: ' + error.message,
    });
  }
};

/**
 * PUT /api/refunds/:id/reject
 * Merchant or Admin rejects a requested refund
 */
const rejectRefund = async (req, res) => {
  try {
    const refund = await Refund.findById(req.params.id);

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: 'Refund request not found',
      });
    }

    // Permission check for merchant
    if (req.user.role === 'merchant') {
      const merchant = await Merchant.findOne({ ownerId: req.user._id });
      if (!merchant || refund.merchantId.toString() !== merchant._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to reject this refund',
        });
      }
    }

    if (refund.status !== 'requested') {
      return res.status(400).json({
        success: false,
        message: `Refund is already ${refund.status}`,
      });
    }

    refund.status = 'rejected';
    await refund.save();

    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      io.emit('refundRejected', {
        refundId: refund._id,
        status: 'rejected',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Refund request rejected.',
      data: refund,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reject refund: ' + error.message,
    });
  }
};

module.exports = {
  getRefunds,
  requestRefund,
  approveRefund,
  rejectRefund,
};
