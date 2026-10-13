/**
 * Auth Routes
 * 
 * POST /api/auth/register  - Local registration
 * POST /api/auth/login     - Local login
 * POST /api/auth/firebase  - Firebase token → app JWT
 */
const express = require('express');
const router = express.Router();
const { register, login, firebaseAuth } = require('../controllers/authController');
const { validateRegister, validateLogin, handleValidation } = require('../middleware/validationMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

// Apply rate limiting to all auth routes
router.use(authLimiter);

router.post('/register', validateRegister, handleValidation, register);
router.post('/login', validateLogin, handleValidation, login);
router.post('/firebase', firebaseAuth);

module.exports = router;
