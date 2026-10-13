/**
 * Rate Limiter Middleware
 * 
 * Prevents abuse by limiting how many requests a client can make.
 * Uses express-rate-limit.
 */
const rateLimit = require('express-rate-limit');

// General API rate limiter: generous limit for smooth testing & demo
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50000,
  skip: () => process.env.NODE_ENV !== 'production', // Never block during local testing or presentations
  message: {
    success: false,
    message: 'Too many requests. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth limiter for login/register
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20000,
  skip: () => process.env.NODE_ENV !== 'production', // Never block during local testing or presentations
  message: {
    success: false,
    message: 'Too many login/register attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { generalLimiter, authLimiter };
