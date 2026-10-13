/**
 * Express Application Setup
 * 
 * This file configures the Express app with:
 * - Security middleware (helmet, cors)
 * - Request parsing (JSON)
 * - Rate limiting
 * - API routes
 * - Error handling
 * 
 * The app is separated from server.js so it can be tested independently.
 */
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { generalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./utils/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const paymentMethodRoutes = require('./routes/paymentMethodRoutes');
const merchantRoutes = require('./routes/merchantRoutes');
const settlementRoutes = require('./routes/settlementRoutes');
const adminRoutes = require('./routes/adminRoutes');
const fraudRoutes = require('./routes/fraudRoutes');
const refundRoutes = require('./routes/refundRoutes');

const app = express();

// --- Security Middleware ---
app.use(helmet()); // Sets various HTTP security headers
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);

// --- Request Parsing ---
app.use(express.json()); // Parse JSON request bodies

// --- Rate Limiting ---
app.use('/api/', generalLimiter);

// --- Swagger API Documentation ---
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swaggerSpec');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'PaySecure API Documentation',
  customCss: '.swagger-ui .topbar { display: block; }',
}));

app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'PaySecure API is running 🚀', docs: '/api-docs' });
});

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);
app.use('/api/merchants', merchantRoutes);
app.use('/api/settlements', settlementRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/fraud', fraudRoutes);
app.use('/api/refunds', refundRoutes);

// --- 404 handler for unknown routes ---
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// --- Centralized Error Handler (must be last) ---
app.use(errorHandler);

module.exports = app;
