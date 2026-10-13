/**
 * PaySecure OpenAPI 3.0 Specification
 * 
 * Provides interactive Swagger UI documentation for all endpoints
 * across Customer, Merchant, and Administrator domains.
 */

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'PaySecure Payment Gateway API',
    version: '1.0.0',
    description:
      'Backend REST API and WebSocket specification for PaySecure — a simulated full-stack payment gateway system.\n\n' +
      '### Roles & Permissions:\n' +
      '- **Customer:** Manage payment methods, initiate payments, request refunds, raise disputes, view history.\n' +
      '- **Merchant:** View transactions, manage API keys, generate settlements, manage refunds.\n' +
      '- **Admin:** Platform oversight, fee calculation, settlement rules, fraud detection, dispute resolution.\n\n' +
      '### Real-time Features:\n' +
      '- Real-time transaction alerts via Socket.io (`paymentCreated`, `fraudAlert`, `refundRequested`).\n\n' +
      '### Authentication:\n' +
      'Use the Authorize button below to supply your Bearer JWT token received from `/api/auth/login` or `/api/auth/firebase`.',
    contact: {
      name: 'PaySecure Engineering Team',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server',
    },
    {
      url: '{customUrl}',
      description: 'Production / Deployed Server (e.g. Render/Heroku)',
      variables: {
        customUrl: {
          default: 'https://paysecure-api.onrender.com',
        },
      },
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token: Bearer <token>',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error message description' },
          errors: {
            type: 'array',
            items: { type: 'object' },
            example: [{ field: 'amount', message: 'Amount must be greater than 0' }],
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '660e1d88a123bc4567890123' },
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', example: 'john@example.com' },
          role: { type: 'string', enum: ['customer', 'merchant', 'admin'], example: 'customer' },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Merchant: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '660e1d88a123bc4567890124' },
          businessName: { type: 'string', example: 'TechStore Pvt Ltd' },
          businessType: { type: 'string', example: 'ecommerce' },
          ownerId: { type: 'string', example: '660e1d88a123bc4567890125' },
          balance: { type: 'number', example: 45000 },
          status: { type: 'string', enum: ['active', 'suspended', 'pending'], example: 'active' },
          contactEmail: { type: 'string', example: 'support@techstore.com' },
        },
      },
      PaymentMethod: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '660e1d88a123bc4567890126' },
          userId: { type: 'string', example: '660e1d88a123bc4567890123' },
          type: { type: 'string', enum: ['card', 'upi', 'wallet'], example: 'card' },
          provider: { type: 'string', example: 'Visa' },
          last4: { type: 'string', example: '4242' },
          expiryMonth: { type: 'string', example: '12' },
          expiryYear: { type: 'string', example: '28' },
          upiId: { type: 'string', example: 'john@upi' },
          walletProvider: { type: 'string', example: 'PaySecure Cash' },
          isDefault: { type: 'boolean', example: true },
        },
      },
      Transaction: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '660e1d88a123bc4567890127' },
          transactionId: { type: 'string', example: 'TXN-1712983742-8491' },
          customerId: { type: 'string', example: '660e1d88a123bc4567890123' },
          merchantId: { type: 'string', example: '660e1d88a123bc4567890124' },
          paymentMethodId: { type: 'string', example: '660e1d88a123bc4567890126' },
          amount: { type: 'number', example: 500 },
          fee: { type: 'number', example: 10 },
          netAmount: { type: 'number', example: 490 },
          status: { type: 'string', enum: ['success', 'pending', 'failed'], example: 'success' },
          fraudStatus: { type: 'string', enum: ['clear', 'flagged'], example: 'clear' },
          description: { type: 'string', example: 'Demo payment' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Refund: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '660e1d88a123bc4567890128' },
          transactionId: { type: 'string', example: '660e1d88a123bc4567890127' },
          customerId: { type: 'string', example: '660e1d88a123bc4567890123' },
          merchantId: { type: 'string', example: '660e1d88a123bc4567890124' },
          amount: { type: 'number', example: 500 },
          reason: { type: 'string', example: 'Product defective' },
          status: { type: 'string', enum: ['requested', 'approved', 'rejected'], example: 'requested' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Settlement: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '660e1d88a123bc4567890129' },
          merchantId: { type: 'string', example: '660e1d88a123bc4567890124' },
          periodStart: { type: 'string', format: 'date-time' },
          periodEnd: { type: 'string', format: 'date-time' },
          grossAmount: { type: 'number', example: 5000 },
          totalFees: { type: 'number', example: 100 },
          netAmount: { type: 'number', example: 4900 },
          transactionCount: { type: 'number', example: 10 },
          status: { type: 'string', enum: ['pending', 'completed', 'processing'], example: 'completed' },
          payoutReference: { type: 'string', example: 'SETTLE-1712983742' },
        },
      },
      ApiKey: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '660e1d88a123bc4567890130' },
          merchantId: { type: 'string', example: '660e1d88a123bc4567890124' },
          name: { type: 'string', example: 'Production Storefront Key' },
          key: { type: 'string', example: 'psk_live_xxxxxxxxxxxxxxxx' },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/api/health': {
      get: {
        summary: 'System health check',
        tags: ['System'],
        responses: {
          200: {
            description: 'API service is operational',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'PaySecure API is running 🚀' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/register': {
      post: {
        summary: 'Register a new customer or merchant account',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Alice Smith' },
                  email: { type: 'string', example: 'alice@example.com' },
                  password: { type: 'string', example: 'password123' },
                  role: { type: 'string', enum: ['customer', 'merchant'], default: 'customer' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Authenticate with email & password',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'customer@paysecure.com' },
                  password: { type: 'string', example: 'customer123' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful with JWT token returned',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/api/auth/firebase': {
      post: {
        summary: 'Exchange Firebase ID token for PaySecure JWT',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['idToken'],
                properties: {
                  idToken: { type: 'string', example: 'firebase_id_token_string' },
                  role: { type: 'string', enum: ['customer', 'merchant'], default: 'customer' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Firebase verified and app JWT issued' },
          401: { description: 'Invalid Firebase ID token' },
        },
      },
    },
    '/api/payment-methods': {
      get: {
        summary: 'List payment methods for current customer',
        tags: ['Payment Methods'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of payment methods',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/PaymentMethod' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Add a new payment method (Card, UPI, Wallet)',
        tags: ['Payment Methods'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['type'],
                properties: {
                  type: { type: 'string', enum: ['card', 'upi', 'wallet'], example: 'card' },
                  cardNumber: { type: 'string', example: '4242424242424242' },
                  cardHolderName: { type: 'string', example: 'John Doe' },
                  expiryMonth: { type: 'string', example: '12' },
                  expiryYear: { type: 'string', example: '28' },
                  upiId: { type: 'string', example: 'user@okaxis' },
                  walletProvider: { type: 'string', example: 'PaySecure Cash' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Payment method added successfully' },
          400: { description: 'Validation failure' },
        },
      },
    },
    '/api/payment-methods/{id}': {
      delete: {
        summary: 'Delete a payment method',
        tags: ['Payment Methods'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Payment method removed' },
        },
      },
    },
    '/api/payments': {
      get: {
        summary: 'List transactions for authenticated customer',
        tags: ['Payments'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Customer transactions',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Transaction' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Process a new payment (triggers Socket.io real-time broadcast)',
        tags: ['Payments'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['amount', 'merchantId', 'paymentMethodId'],
                properties: {
                  amount: { type: 'number', example: 500, description: 'Amount in INR. Amount 13 triggers failed; >100000 triggers pending; >50000 flags fraud' },
                  merchantId: { type: 'string', example: '660e1d88a123bc4567890124' },
                  paymentMethodId: { type: 'string', example: '660e1d88a123bc4567890126' },
                  description: { type: 'string', example: 'Electronics purchase' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Payment processed and Socket.io event emitted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Payment success' },
                    data: {
                      type: 'object',
                      properties: {
                        transactionId: { type: 'string', example: 'TXN-1712983742-8491' },
                        amount: { type: 'number', example: 500 },
                        fee: { type: 'number', example: 10 },
                        netAmount: { type: 'number', example: 490 },
                        status: { type: 'string', example: 'success' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/payments/{id}': {
      get: {
        summary: 'Get transaction details by ID',
        tags: ['Payments'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Transaction details returned' },
          404: { description: 'Transaction not found' },
        },
      },
    },
    '/api/payments/refund': {
      post: {
        summary: 'Request a refund for a transaction',
        tags: ['Payments', 'Refunds'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['transactionId', 'reason'],
                properties: {
                  transactionId: { type: 'string', example: '660e1d88a123bc4567890127' },
                  reason: { type: 'string', example: 'Item arrived damaged' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Refund request registered and broadcasted' },
          400: { description: 'Cannot refund non-successful transaction' },
        },
      },
    },
    '/api/merchants/register': {
      post: {
        summary: 'Register a business profile as merchant',
        tags: ['Merchants'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['businessName'],
                properties: {
                  businessName: { type: 'string', example: 'Apex Digital Solutions' },
                  businessType: { type: 'string', example: 'ecommerce' },
                  contactEmail: { type: 'string', example: 'billing@apexdigital.com' },
                  website: { type: 'string', example: 'https://apexdigital.com' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Merchant profile created' },
        },
      },
    },
    '/api/merchants': {
      get: {
        summary: 'List all active merchants',
        tags: ['Merchants'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Array of active merchants' },
        },
      },
    },
    '/api/merchants/{id}': {
      get: {
        summary: 'Get merchant profile by ID',
        tags: ['Merchants'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Merchant details' },
        },
      },
    },
    '/api/merchants/{id}/transactions': {
      get: {
        summary: 'View incoming payments for a merchant',
        tags: ['Merchants'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Transactions for merchant' },
        },
      },
    },
    '/api/merchants/keys': {
      get: {
        summary: 'List API keys for current merchant',
        tags: ['Merchant API Keys'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Array of masked API keys' },
        },
      },
      post: {
        summary: 'Generate simulated API key for store integration',
        tags: ['Merchant API Keys'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Shopify Storefront Key' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'API Key generated' },
        },
      },
    },
    '/api/merchants/keys/{id}': {
      delete: {
        summary: 'Revoke an API key',
        tags: ['Merchant API Keys'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'API key revoked' },
        },
      },
    },
    '/api/settlements': {
      get: {
        summary: 'List settlements (merchant views own, admin views all)',
        tags: ['Settlements'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Array of settlements' },
        },
      },
    },
    '/api/settlements/generate': {
      post: {
        summary: 'Generate settlement for merchant',
        tags: ['Settlements'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  merchantId: { type: 'string', example: '660e1d88a123bc4567890124' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Settlement calculated and created' },
        },
      },
    },
    '/api/settlements/{id}': {
      get: {
        summary: 'Get settlement details by ID',
        tags: ['Settlements'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Settlement details' },
        },
      },
    },
    '/api/admin/transactions': {
      get: {
        summary: 'Admin view: all system transactions',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'All transactions across platform' },
        },
      },
    },
    '/api/admin/reports': {
      get: {
        summary: 'Admin revenue, volume, and failure reports',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Platform financial and volume analytics' },
        },
      },
    },
    '/api/admin/fees': {
      put: {
        summary: 'Admin: update transaction fee percentage',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['feePercentage'],
                properties: {
                  feePercentage: { type: 'number', example: 2.5 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Transaction fee updated' },
        },
      },
    },
    '/api/admin/settlement-rules': {
      put: {
        summary: 'Admin: update settlement frequency and rules',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  settlementFrequency: { type: 'string', enum: ['daily', 'weekly', 'monthly'], example: 'daily' },
                  minSettlementAmount: { type: 'number', example: 500 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Settlement rules updated' },
        },
      },
    },
    '/api/admin/users': {
      get: {
        summary: 'Admin: list all platform users',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'List of users' },
        },
      },
    },
    '/api/admin/merchants': {
      get: {
        summary: 'Admin: list all merchants',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'List of merchants with balances' },
        },
      },
    },
    '/api/fraud/check': {
      post: {
        summary: 'Run fraud rules engine check against transaction parameters',
        tags: ['Fraud Detection'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['amount'],
                properties: {
                  amount: { type: 'number', example: 60000 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Fraud evaluation result' },
        },
      },
    },
    '/api/fraud/reports': {
      get: {
        summary: 'Admin: retrieve all flagged fraud reports',
        tags: ['Fraud Detection'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'List of fraud incidents' },
        },
      },
    },
    '/api/refunds': {
      get: {
        summary: 'List refunds for authenticated user/merchant/admin',
        tags: ['Refunds'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Refund list' },
        },
      },
    },
    '/api/refunds/{id}/approve': {
      put: {
        summary: 'Approve refund request (merchant or admin)',
        tags: ['Refunds'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Refund approved' },
        },
      },
    },
    '/api/refunds/{id}/reject': {
      put: {
        summary: 'Reject refund request (merchant or admin)',
        tags: ['Refunds'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Refund rejected' },
        },
      },
    },
  },
};

module.exports = swaggerSpec;
