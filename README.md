# 🔒 PaySecure - Payment Gateway System

> **⚠️ ACADEMIC PROJECT DISCLAIMER:** This is a SIMULATED payment gateway built for academic/college purposes. It does NOT process real money, connect to real banks, or handle real payment credentials. All transactions, refunds, settlements, and fraud detection are simulated.

## 📋 Project Overview

PaySecure is a full-stack simulated payment gateway system that demonstrates:
- Customer payment processing
- Merchant payment receiving
- Admin platform management
- Real-time transaction updates
- Fraud detection
- Settlement processing

## ✨ Features

### Customer Features
- Register/login (local + Firebase Auth)
- Add simulated payment methods (Card, UPI, Wallet)
- Make payments to merchants
- View transaction history
- Request refunds
- File disputes

### Merchant Features
- Register as merchant
- View incoming payments (real-time via Socket.io)
- Generate/manage API keys
- View settlement reports

### Admin Features
- View all transactions
- Platform reports & analytics
- Configure transaction fees
- Configure settlement rules
- Manage users and merchants
- View fraud reports
- Manage disputes

### System Features
- JWT + Firebase dual authentication
- Role-based authorization (customer, merchant, admin)
- Simulated payment processing
- Rule-based fraud detection
- Transaction fee calculation
- Settlement generation
- Real-time updates via Socket.io
- Input validation
- Rate limiting
- Security headers (Helmet)

## 🛠 Technologies

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js | Runtime |
| Express.js | Web framework |
| MongoDB | Database |
| Mongoose | ODM |
| Firebase Admin SDK | Token verification |
| JWT (jsonwebtoken) | Application authentication |
| bcryptjs | Password hashing |
| Socket.io | Real-time events |
| express-validator | Input validation |
| express-rate-limit | Rate limiting |
| Helmet | Security headers |
| CORS | Cross-origin requests |

### Frontend
| Technology | Purpose |
|-----------|---------|
| React.js | UI framework |
| Vite | Build tool |
| Axios | HTTP client |
| React Router | Client routing |
| Firebase SDK | Client authentication |
| Socket.io Client | Real-time events |
| CSS | Styling |

## 📁 Folder Structure

```
paysecure/
├── backend/
│   ├── server.js          # Entry point - starts server + Socket.io
│   ├── app.js             # Express app setup + middleware + routes
│   ├── seed.js            # Database seeding script
│   ├── package.json
│   ├── .env.example
│   ├── config/
│   │   ├── db.js          # MongoDB connection
│   │   └── firebase.js    # Firebase Admin SDK init
│   ├── models/            # Mongoose schemas
│   │   ├── User.js
│   │   ├── Merchant.js
│   │   ├── PaymentMethod.js
│   │   ├── Transaction.js
│   │   ├── Refund.js
│   │   ├── Dispute.js
│   │   ├── Settlement.js
│   │   ├── ApiKey.js
│   │   ├── FraudReport.js
│   │   └── Settings.js
│   ├── routes/            # API route definitions
│   ├── controllers/       # Request handlers
│   ├── middleware/         # Auth, roles, validation, rate limiting
│   ├── services/          # Business logic (payment, fraud, settlement)
│   └── utils/             # Helpers (JWT, API key gen, error handler)
├── frontend/
│   └── src/
│       ├── api/axios.js        # Axios config with JWT interceptor
│       ├── firebase/firebase.js # Firebase client config
│       ├── context/AuthContext.jsx # Auth state management
│       ├── components/         # Reusable UI components
│       ├── pages/              # Page components
│       └── styles/App.css      # Application styles
├── docs/
│   └── API_DOCUMENTATION.md   # Comprehensive REST & WebSocket API Reference
├── ss/                        # Screenshots & Visual Artifacts for Docs/README
│   ├── README.md              # Screenshot catalog and submission guide
│   ├── 01-customer-dashboard.svg
│   ├── 02-payment-methods.svg
│   ├── 03-make-payment.svg
│   ├── ... (15 UI mockups & captures)
├── postman/
│   ├── PaySecure.postman_collection.json # Full API Collection with test scripts
│   └── PaySecure.postman_environment.json # Pre-configured local dev environment
└── README.md
```

## 🏗 System Architecture

```
┌────────────────┐        ┌─────────────────┐        ┌──────────┐
│  React Frontend│◄──────►│  Express Backend │◄──────►│  MongoDB │
│  (Vite)        │  REST  │  (Node.js)      │Mongoose │          │
│                │  API   │                 │         │          │
│  Firebase Auth │        │  Firebase Admin  │        │          │
│  (Client SDK)  │        │  (Admin SDK)    │        │          │
│                │        │                 │        │          │
│  Socket.io     │◄──────►│  Socket.io      │        │          │
│  (Client)      │  WS    │  (Server)       │        │          │
└────────────────┘        └─────────────────┘        └──────────┘
```

## 🔐 Authentication Flow

### Local Authentication (for Postman / direct API testing)
```
1. User sends email + password to POST /api/auth/register or /login
2. Backend hashes password with bcrypt (register) or compares hash (login)
3. Backend creates JWT containing { id, role }
4. JWT is returned to client
5. Client includes JWT in Authorization header for all API calls
```

### Firebase Authentication (for Frontend)
```
1. User logs in via Firebase Auth in React
2. Firebase returns an ID token
3. Frontend sends ID token to POST /api/auth/firebase
4. Backend verifies token using Firebase Admin SDK
5. Backend finds/creates MongoDB user by firebaseUid
6. Backend issues application JWT
7. Frontend uses this JWT for all subsequent API calls
```

## 🔧 Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- Firebase project (for Firebase Auth)

### Step 1: Clone and Install

```bash
# Install backend dependencies
cd paysecure/backend
cp .env.example .env
npm install

# Install frontend dependencies
cd ../frontend
cp .env.example .env
npm install
```

### Step 2: Configure Environment Variables

**Backend `.env`:**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/paysecure
JWT_SECRET=your_secret_key_change_this
JWT_EXPIRES_IN=7d
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FRONTEND_URL=http://localhost:5173
```

**Frontend `.env`:**
```
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

### Step 3: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Email/Password authentication
4. Go to Project Settings → Service Accounts → Generate New Private Key
5. Copy the values to your backend `.env`
6. Go to Project Settings → General → Your Apps → Add Web App
7. Copy the config values to your frontend `.env`

### Step 4: Seed Database

```bash
cd backend
npm run seed
```

This creates demo data with these credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@paysecure.com | admin123 |
| Customer | customer@paysecure.com | customer123 |
| Merchant | merchant@paysecure.com | merchant123 |

### Step 5: Run the Application

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:5173

## 📡 API Documentation & Endpoints

> 📖 **Interactive Swagger UI:** [http://localhost:5000/api-docs](http://localhost:5000/api-docs)  
> 📄 **Complete API Reference:** [docs/API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md)  
> 📮 **Postman Collection:** [postman/PaySecure.postman_collection.json](./postman/PaySecure.postman_collection.json)  

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register new user | No |
| POST | /api/auth/login | Login (local) | No |
| POST | /api/auth/firebase | Firebase auth | No |

### Payment Methods
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/payment-methods | Add payment method | Customer |
| GET | /api/payment-methods | List payment methods | Customer |
| DELETE | /api/payment-methods/:id | Delete payment method | Customer |

### Payments
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/payments | Create payment | Customer |
| GET | /api/payments | List my transactions | Customer |
| GET | /api/payments/:id | Get transaction detail | Any |
| POST | /api/payments/refund | Request refund | Customer |
| POST | /api/payments/:id/dispute | Create dispute | Customer |
| GET | /api/payments/:id/disputes | Get transaction disputes | Customer/Admin |

### Merchants
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/merchants/register | Register merchant | Any |
| GET | /api/merchants | List merchants | Any |
| GET | /api/merchants/:id | Get merchant detail | Any |
| GET | /api/merchants/:id/transactions | Merchant transactions | Merchant/Admin |
| POST | /api/merchants/keys | Generate API key | Merchant |
| GET | /api/merchants/keys | List API keys | Merchant |
| DELETE | /api/merchants/keys/:id | Revoke API key | Merchant |

### Settlements
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/settlements | List settlements | Merchant/Admin |
| GET | /api/settlements/:id | Settlement detail | Merchant/Admin |
| POST | /api/settlements/generate | Generate settlement | Merchant/Admin |

### Admin
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/admin/transactions | All transactions | Admin |
| GET | /api/admin/reports | Platform reports | Admin |
| GET | /api/admin/settings | Platform settings | Admin |
| PUT | /api/admin/fees | Update fee % | Admin |
| PUT | /api/admin/settlement-rules | Update settlement config | Admin |
| GET | /api/admin/users | List users | Admin |
| PUT | /api/admin/users/:id | Update user | Admin |
| DELETE | /api/admin/users/:id | Deactivate user | Admin |
| GET | /api/admin/merchants | List merchants | Admin |
| PUT | /api/admin/merchants/:id | Update merchant | Admin |
| DELETE | /api/admin/merchants/:id | Deactivate merchant | Admin |
| GET | /api/admin/disputes | All disputes | Admin |
| PUT | /api/admin/disputes/:id | Update dispute | Admin |

### Fraud
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/fraud/check | Check fraud rules | Any |
| GET | /api/fraud/reports | Get fraud reports | Admin |

## 💰 Payment Flow

```
Customer clicks "Pay Now"
    │
    ├── 1. Frontend sends POST /api/payments with amount, merchantId, paymentMethodId
    ├── 2. Auth middleware verifies JWT
    ├── 3. Validation middleware checks input
    ├── 4. Controller verifies merchant exists & is active
    ├── 5. Controller verifies payment method belongs to customer
    ├── 6. Fraud service checks rules (amount thresholds, velocity)
    ├── 7. Payment service calculates fee: amount × feePercentage / 100
    ├── 8. Payment service simulates status based on amount
    ├── 9. Transaction saved to MongoDB
    ├── 10. If fraud flagged → FraudReport saved
    ├── 11. Socket.io emits "paymentCreated" event
    └── 12. Response returned with transaction details
```

## 🎮 Payment Simulation Rules

| Amount | Result | Reason |
|--------|--------|--------|
| Normal (1-100000) | ✅ `success` | Standard payment |
| > 100000 | ⏳ `pending` | Large amount needs review |
| Exactly 13 | ❌ `failed` | Test failure trigger |

## 🔍 Fraud Detection Rules

| Rule | Trigger | Risk Level |
|------|---------|------------|
| Large amount | amount > ₹50,000 | 🔴 High |
| Test trigger | amount = ₹13 | 🟡 Medium |
| Rapid transactions | >5 in 10 minutes | 🔴 High |

## 💸 Fee Calculation

```
Fee = amount × transactionFeePercentage / 100
Net Amount = amount - fee

Example:
  Amount: ₹500
  Fee %:  2%
  Fee:    ₹10
  Net:    ₹490 (what merchant receives)
```

Admin can change the fee via `PUT /api/admin/fees`.

## 📊 Settlement

Settlements aggregate a merchant's successful transactions over a period:

```
Gross Amount = Sum of all transaction amounts
Total Fees   = Sum of all transaction fees
Net Amount   = Gross Amount - Total Fees
```

Generate via `POST /api/settlements/generate` or from the frontend Settlements page.

## 🔌 Socket.io Events

| Event | Emitted When | Data |
|-------|-------------|------|
| `paymentCreated` | New payment processed | Transaction object |
| `paymentRefunded` | Refund processed | Transaction ID, amount |
| `fraudAlert` | Fraud detected | Transaction ID, risk, reason |

## 🧪 Postman Testing

1. Import `postman/PaySecure.postman_collection.json` into Postman
2. Set the `baseUrl` variable to `http://localhost:5000/api`
3. Login with admin/customer/merchant credentials
4. Copy the JWT token from the response
5. Set the `jwt` collection variable
6. Test endpoints in this order:

**Recommended test sequence:**
1. Login as Customer → copy JWT
2. Get Payment Methods
3. Create Payment (Success) → copy `_id` to `transactionId`
4. Create Payment (Failed - amount 13)
5. Create Payment (Fraud - amount 60000)
6. Get Transactions
7. Request Refund
8. Create Dispute
9. Login as Merchant → copy JWT
10. Get Merchant Transactions
11. Generate API Key
12. Generate Settlement
13. Login as Admin → copy JWT
14. Get Reports
15. Get All Transactions
16. Update Fee
17. Get Fraud Reports

## 📸 Screenshots & Visual UI Showcase

All screenshots below are **real high-resolution captures** from the running PaySecure frontend and backend applications, located in [`ss/`](./ss).

### 👤 1. Customer Portal & Payments
| Customer Dashboard | Payment Methods |
|:---:|:---:|
| ![Customer Dashboard](./ss/01-customer-dashboard.png) | ![Payment Methods](./ss/02-payment-methods.png) |
| *Figure 1: Customer balance & overview* | *Figure 2: Cards, UPI & Wallet management* |

| Payment Checkout Simulation | Transaction History & Auditing |
|:---:|:---:|
| ![Make Payment](./ss/03-make-payment.png) | ![Transactions](./ss/04-transaction-history.png) |
| *Figure 3: Interactive payment checkout* | *Figure 4: Transaction status filters & history* |

### 🔄 2. Refunds & Disputes Lifecycle
| Refund Request Submission | Dispute Tracking & Resolution |
|:---:|:---:|
| ![Refund Request](./ss/05-refund-request.png) | ![Dispute Submission](./ss/06-dispute-submission.png) |
| *Figure 5: Customer refund request modal* | *Figure 6: Dispute filing & status tracking* |

### 🏪 3. Merchant Portal & Settlement Batching
| Merchant Incoming Transactions | Store API Key Provisioning |
|:---:|:---:|
| ![Merchant Dashboard](./ss/07-merchant-dashboard.png) | ![API Keys](./ss/08-merchant-api-keys.png) |
| *Figure 7: Real-time incoming transactions* | *Figure 8: Simulated API keys (`psk_live_*`)* |

| Settlement Reports & Calculation |
|:---:|
| ![Settlement Reports](./ss/09-settlement-reports.png) |
| *Figure 9: Automated settlement batches & net revenue payout* |

### 🛡️ 4. Administration, Analytics & Fraud Monitoring
| Admin Platform Governance | Revenue & Performance Analytics |
|:---:|:---:|
| ![Admin Dashboard](./ss/10-admin-dashboard.png) | ![Admin Reports](./ss/11-admin-revenue-reports.png) |
| *Figure 10: User & merchant account controls* | *Figure 11: Revenue, volume & failure rate reports* |

| Rule-Based Fraud Detection System |
|:---:|
| ![Fraud Detection](./ss/12-fraud-detection.png) |
| *Figure 12: Anomaly rules engine & flagged reports* |

### ⚡ 5. Real-Time WebSockets & Developer Documentation
| WebSocket Live Notifications | Interactive Swagger Explorer (`/api-docs`) |
|:---:|:---:|
| ![WebSocket Toast](./ss/13-realtime-socket-alert.png) | ![Swagger UI](./ss/14-swagger-api-docs.png) |
| *Figure 13: Live Socket.io event broadcasting* | *Figure 14: OpenAPI 3.0 Interactive Explorer (http://localhost:5005/api-docs)* |

| Authentication & Registration Portal |
|:---:|
| ![Registration Portal](./ss/15-postman-test-suite.png) |
| *Figure 15: Dual Firebase & local JWT registration interface* |

> 💡 *All screenshots are real captures taken from the live running environment.*

---

## 🚀 System Capabilities & Feature Matrix

| Core Feature / Requirement | Status | Implementation Details |
|---|:---:|---|
| **Node.js + Express.js REST API** | ✅ Complete | Modular routes (`routes/`), controllers (`controllers/`), and services (`services/`). |
| **MongoDB + Mongoose ODM** | ✅ Complete | Schemas for `User`, `Merchant`, `PaymentMethod`, `Transaction`, `Settlement`, `Refund`, `Dispute`, `ApiKey`, `FraudReport`, `Settings`. |
| **Authentication: JWT + Firebase** | ✅ Complete | Dual-auth supporting local JWT (`/api/auth/register`, `/login`) and Firebase Admin SDK (`/api/auth/firebase`). |
| **Simulated Payment Instruments** | ✅ Complete | Credit/Debit Card, UPI VPA handles, and Digital Wallets (`/api/payment-methods`). |
| **Payment Execution & Statuses** | ✅ Complete | Simulated status engine: `success`, `pending` (>₹100k), and `failed` (₹13 test trigger). |
| **Merchant Store Integration (API Keys)** | ✅ Complete | Generate, list, and revoke simulated API keys (`psk_live_*`) via `/api/merchants/keys`. |
| **Settlement Generation & Fee Deduction** | ✅ Complete | Automatic calculation of `grossAmount`, `totalFees`, and `netAmount` via `/api/settlements`. |
| **Customer Refunds & Dispute Tracking** | ✅ Complete | Multi-stage refund lifecycle (`requested` → `approved`/`rejected`) and disputes via `/api/payments/refund` & `/api/refunds`. |
| **Admin Controls & Reports** | ✅ Complete | Platform fee configuration (`PUT /api/admin/fees`), settlement rules, user management, and revenue analytics (`GET /api/admin/reports`). |
| **Rule-Based Fraud Detection** | ✅ Complete | Evaluates large amounts (>₹50,000), velocity anomalies, and test triggers via `/api/fraud/check`. |
| **WebSockets (Socket.io)** | ✅ Complete | Real-time events: `paymentCreated`, `fraudAlert`, `refundRequested`, `refundApproved`, `refundRejected`. |
| **Middleware Suite** | ✅ Complete | JWT Auth, Role-based Authorization (`customer`, `merchant`, `admin`), Express-Validator, and Rate-Limiter (`express-rate-limit`). |
| **Deliverable: Swagger / API Documentation**| ✅ Complete | Interactive Swagger UI mounted at `/api-docs` + standalone [`docs/API_DOCUMENTATION.md`](./docs/API_DOCUMENTATION.md). |
| **Deliverable: Postman Collection** | ✅ Complete | Comprehensive [`PaySecure.postman_collection.json`](./postman/PaySecure.postman_collection.json) with automated test scripts and environment file. |
| **Deliverable: GitHub Readme & Setup** | ✅ Complete | In-depth setup instructions, architecture diagrams, and credential guides. |

---


## 📝 Database Models

| Model | Purpose | Key Fields |
|-------|---------|------------|
| User | All users | name, email, role, passwordHash, firebaseUid |
| Merchant | Business profiles | businessName, ownerId, balance, status |
| PaymentMethod | Simulated cards/UPI/wallet | userId, type, provider, last4, upiId |
| Transaction | Core payment records | transactionId, amount, fee, netAmount, status |
| Refund | Refund requests | transactionId, amount, reason, status |
| Dispute | Transaction disputes | transactionId, reason, status, resolution |
| Settlement | Merchant payouts | merchantId, grossAmount, totalFees, netAmount |
| ApiKey | Merchant API keys | merchantId, key, isActive |
| FraudReport | Flagged transactions | transactionId, riskLevel, reason |
| Settings | Platform config | transactionFeePercentage, settlementFrequency |

## 🔒 Security Notes

- Passwords are hashed with bcrypt (10 salt rounds)
- JWT secret is stored in .env (never committed)
- Firebase credentials are in .env
- Helmet adds security HTTP headers
- Rate limiting prevents abuse (100 req/15min, 20 for auth)
- Input validation on all important endpoints
- Role-based authorization on all protected routes
- Users can only access their own data
- API keys are masked when listed

## ⚠️ Limitations

This is an academic simulation. It does NOT:
- Process real payments
- Connect to real banks or payment networks
- Handle real card numbers or CVVs
- Implement PCI DSS compliance
- Use real fraud detection ML models
- Perform real bank settlements
- Support real multi-currency conversion
- Implement webhook callbacks to merchants
- Handle distributed system concerns

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection failed | Ensure MongoDB is running locally or check Atlas URI |
| Firebase auth fails | Verify Firebase credentials in .env |
| JWT errors | Check JWT_SECRET is set in .env |
| CORS errors | Ensure FRONTEND_URL in .env matches frontend port |
| Seed script fails | Make sure MongoDB is running before seeding |
| Frontend can't reach backend | Check VITE_API_URL in frontend .env |

## 📄 License

This project is for academic purposes only.
