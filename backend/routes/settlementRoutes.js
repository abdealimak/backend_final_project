/**
 * Settlement Routes
 * 
 * GET  /api/settlements           - List settlements
 * GET  /api/settlements/:id       - Get settlement details
 * POST /api/settlements/generate  - Generate new settlement (for demo)
 */
const express = require('express');
const router = express.Router();
const {
  getSettlements,
  getSettlementById,
  createSettlement,
} = require('../controllers/settlementController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(authorizeRoles('merchant', 'admin'));

router.get('/', getSettlements);
router.post('/generate', createSettlement);
router.get('/:id', getSettlementById);

module.exports = router;
