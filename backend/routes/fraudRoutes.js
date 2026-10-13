/**
 * Fraud Routes
 * 
 * POST /api/fraud/check    - Check if an amount is flagged
 * GET  /api/fraud/reports   - View all fraud reports (admin)
 */
const express = require('express');
const router = express.Router();
const { fraudCheck, getFraudReports } = require('../controllers/fraudController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.post('/check', fraudCheck);
router.get('/reports', authorizeRoles('admin'), getFraudReports);

module.exports = router;
