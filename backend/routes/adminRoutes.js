/**
 * Admin Routes
 * 
 * All routes require admin role.
 * 
 * GET  /api/admin/transactions        - View all transactions
 * GET  /api/admin/reports             - Platform reports
 * PUT  /api/admin/fees                - Update transaction fee
 * PUT  /api/admin/settlement-rules    - Update settlement rules
 * GET  /api/admin/settings            - View platform settings
 * GET  /api/admin/users               - List all users
 * PUT  /api/admin/users/:id           - Update user
 * DELETE /api/admin/users/:id         - Deactivate user
 * GET  /api/admin/merchants           - List all merchants
 * PUT  /api/admin/merchants/:id       - Update merchant
 * DELETE /api/admin/merchants/:id     - Deactivate merchant
 * GET  /api/admin/disputes            - View all disputes
 * PUT  /api/admin/disputes/:id        - Update dispute
 */
const express = require('express');
const router = express.Router();
const {
  getAllTransactions,
  getReports,
  updateFees,
  updateSettlementRules,
  getUsers,
  updateUser,
  deleteUser,
  getAdminMerchants,
  updateMerchant,
  deleteMerchant,
  getAllDisputes,
  updateDispute,
  getSettings,
} = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const {
  validateFee,
  validateSettlementRules,
  handleValidation,
} = require('../middleware/validationMiddleware');

// All admin routes require authentication + admin role
router.use(authMiddleware);
router.use(authorizeRoles('admin'));

// Transactions & Reports
router.get('/transactions', getAllTransactions);
router.get('/reports', getReports);
router.get('/settings', getSettings);

// Fee & Settlement configuration
router.put('/fees', validateFee, handleValidation, updateFees);
router.put('/settlement-rules', validateSettlementRules, handleValidation, updateSettlementRules);

// User management
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Merchant management
router.get('/merchants', getAdminMerchants);
router.put('/merchants/:id', updateMerchant);
router.delete('/merchants/:id', deleteMerchant);

// Dispute management
router.get('/disputes', getAllDisputes);
router.put('/disputes/:id', updateDispute);

module.exports = router;
