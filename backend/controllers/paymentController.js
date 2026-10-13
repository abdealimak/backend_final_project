/**
 * Payment Controller
 * 
 * Core payment processing logic:
 * - Create payments (with fraud check, fee calculation, status simulation)
 * - Get transaction history
 * - Get individual transactions
 * - Request refunds
 * - Create and view disputes
 * 
 * Socket.io events are emitted when payments are created/updated.
 */
const Transaction = require('../models/Transaction');
const Merchant = require('../models/Merchant');
const PaymentMethod = require('../models/PaymentMethod');
const Refund = require('../models/Refund');
const Dispute = require('../models/Dispute');
const FraudReport = require('../models/FraudReport');
const { calculateFee, simulatePaymentStatus } = require('../services/paymentService');
const { checkFraud } = require('../services/fraudService');

/**
 * POST /api/payments
 * Create a new payment (customer only)
 * 
 * Full payment flow:
 * 1. Validate merchant and payment method
 * 2. Run fraud detection
 * 3. Calculate fees
 * 4. Simulate payment status
 * 5. Save transaction
 * 6. Emit Socket.io event
 */
const createPayment = async (req, res) => {
  try {
    const { amount, merchantId, paymentMethodId, description } = req.body;
    const customerId = req.user._id;

    // 1. Verify merchant exists and is active
    const merchant = await Merchant.findById(merchantId);
    if (!merchant || merchant.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Merchant not found or inactive',
      });
    }

    // 2. Verify payment method belongs to this customer
    const paymentMethod = await PaymentMethod.findOne({
      _id: paymentMethodId,
      userId: customerId,
      isActive: true,
    });
    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found or does not belong to you',
      });
    }

    // 3. Run fraud check
    const fraudResult = await checkFraud({ amount, customerId });

    // 4. Calculate transaction fee
    const { fee, netAmount } = await calculateFee(amount);

    // 5. Simulate payment status
    const status = simulatePaymentStatus(amount);

    // 6. Create transaction record
    const transaction = await Transaction.create({
      customerId,
      merchantId: merchant._id,
      paymentMethodId,
      amount,
      fee,
      netAmount,
      status,
      description: description || '',
      fraudStatus: fraudResult.flagged ? 'flagged' : 'clear',
    });

    // 7. If payment succeeded, add to merchant balance
    if (status === 'success') {
      merchant.balance += netAmount;
      await merchant.save();
    }

    // 8. If fraud was detected, create a fraud report
    if (fraudResult.flagged) {
      await FraudReport.create({
        transactionId: transaction._id,
        customerId,
        merchantId: merchant._id,
        riskLevel: fraudResult.riskLevel,
        reason: fraudResult.reason,
      });
    }

    // 9. Emit Socket.io event for real-time updates
    const io = req.app.get('io');
    if (io) {
      // Populate for richer event data
      const populatedTxn = await Transaction.findById(transaction._id)
        .populate('customerId', 'name email')
        .populate('merchantId', 'businessName')
        .populate('paymentMethodId', 'type provider');

      io.emit('paymentCreated', populatedTxn);

      // If fraud flagged, emit a fraud alert too
      if (fraudResult.flagged) {
        io.emit('fraudAlert', {
          transactionId: transaction.transactionId,
          riskLevel: fraudResult.riskLevel,
          reason: fraudResult.reason,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Payment ${status}`,
      data: {
        transactionId: transaction.transactionId,
        amount: transaction.amount,
        fee: transaction.fee,
        netAmount: transaction.netAmount,
        status: transaction.status,
        fraudCheck: fraudResult,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Payment processing failed: ' + error.message,
    });
  }
};

/**
 * GET /api/payments
 * Get transaction history for the logged-in customer
 */
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ customerId: req.user._id })
      .populate('merchantId', 'businessName')
      .populate('paymentMethodId', 'type provider last4')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions: ' + error.message,
    });
  }
};

/**
 * GET /api/payments/:id
 * Get a single transaction by its MongoDB _id or transactionId
 */
const getTransactionById = async (req, res) => {
  try {
    // Try finding by _id first, then by transactionId
    let transaction = await Transaction.findById(req.params.id)
      .populate('customerId', 'name email')
      .populate('merchantId', 'businessName')
      .populate('paymentMethodId', 'type provider last4')
      .catch(() => null); // If ID format is invalid for ObjectId

    if (!transaction) {
      transaction = await Transaction.findOne({ transactionId: req.params.id })
        .populate('customerId', 'name email')
        .populate('merchantId', 'businessName')
        .populate('paymentMethodId', 'type provider last4');
    }

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    // Security: customers can only view their own transactions
    if (
      req.user.role === 'customer' &&
      transaction.customerId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own transactions',
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction: ' + error.message,
    });
  }
};

/**
 * POST /api/payments/refund
 * Request a refund for a transaction (customer only)
 */
const requestRefund = async (req, res) => {
  try {
    const { transactionId, reason } = req.body;

    // Find the transaction
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    // Verify it belongs to this customer
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

    // Check if already refunded
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

    // Create refund record in 'requested' state for merchant/admin review
    const refund = await Refund.create({
      transactionId,
      customerId: req.user._id,
      merchantId: transaction.merchantId,
      amount: transaction.amount,
      reason,
      status: 'requested',
    });

    // Emit Socket.io event for real-time notification
    const io = req.app.get('io');
    if (io) {
      io.emit('refundRequested', {
        refundId: refund._id,
        transactionId: transaction.transactionId,
        amount: refund.amount,
        status: refund.status,
        customerName: req.user.name,
        reason: refund.reason,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Refund request submitted! Awaiting merchant approval.',
      data: refund,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Refund failed: ' + error.message,
    });
  }
};

/**
 * POST /api/payments/:id/dispute
 * Create a dispute for a transaction
 */
const createDispute = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
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

    // Check for existing open dispute
    const existing = await Dispute.findOne({
      transactionId: req.params.id,
      status: { $in: ['open', 'under_review'] },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An active dispute already exists for this transaction',
      });
    }

    const dispute = await Dispute.create({
      transactionId: req.params.id,
      customerId: req.user._id,
      merchantId: transaction.merchantId,
      reason: req.body.reason,
    });

    res.status(201).json({
      success: true,
      message: 'Dispute created successfully',
      data: dispute,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create dispute: ' + error.message,
    });
  }
};

/**
 * GET /api/payments/:id/disputes
 * Get disputes for a specific transaction
 */
const getDisputesByTransaction = async (req, res) => {
  try {
    const disputes = await Dispute.find({ transactionId: req.params.id })
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: disputes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch disputes: ' + error.message,
    });
  }
};

module.exports = {
  createPayment,
  getTransactions,
  getTransactionById,
  requestRefund,
  createDispute,
  getDisputesByTransaction,
};
