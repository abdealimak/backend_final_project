# 📚 PaySecure - Comprehensive REST API & WebSocket Documentation

> **Full-Stack Simulated Payment Gateway Architecture**  
> **Interactive Swagger UI:** [http://localhost:5000/api-docs](http://localhost:5000/api-docs)  
> **Base API URL:** `http://localhost:5000/api`  
> **Postman Collection:** `paysecure/postman/PaySecure.postman_collection.json`

---

## 📌 Table of Contents
1. [Overview & Architecture](#overview--architecture)
2. [Authentication & Authorization](#authentication--authorization)
3. [Real-Time WebSockets (Socket.io)](#real-time-websockets-socketio)
4. [System Endpoints](#system-endpoints)
5. [Authentication Endpoints](#authentication-endpoints)
6. [Payment Methods Endpoints](#payment-methods-endpoints)
7. [Payments Endpoints](#payments-endpoints)
8. [Refunds Endpoints](#refunds-endpoints)
9. [Disputes Endpoints](#disputes-endpoints)
10. [Merchants Endpoints](#merchants-endpoints)
11. [Merchant API Keys Endpoints](#merchant-api-keys-endpoints)
12. [Settlements Endpoints](#settlements-endpoints)
13. [Admin Governance Endpoints](#admin-governance-endpoints)
14. [Fraud Detection Endpoints](#fraud-detection-endpoints)
15. [Status Codes & Error Handling](#status-codes--error-handling)

---

## 1. Overview & Architecture

PaySecure provides a complete simulated payment gateway infrastructure. It handles:
- **Customer flows:** Payment method provisioning, checkout execution, transaction auditing, and refund/dispute requests.
- **Merchant flows:** Incoming transaction streaming, store API keys generation, settlement calculation, and refund management.
- **Admin flows:** Platform fee configuration, settlement cycle rules, user/merchant management, revenue analytics, and fraud report audits.
- **Simulations:** Automated payment rule checks, fee deductions, and fraud risk thresholds.

---

## 2. Authentication & Authorization

### Application JWT (Bearer Authentication)
Most protected routes require a JWT token passed via the HTTP Authorization header:
```http
Authorization: Bearer <your_jwt_token>
```

Tokens are valid for **7 days** (configurable via `JWT_EXPIRES_IN`).

### Roles Matrix
- `customer`: Can manage personal payment instruments, make payments, file refunds, and submit disputes.
- `merchant`: Can view incoming store transactions, generate API keys, view settlements, and process customer refunds.
- `admin`: Superuser role with full access to all transactions, platform reports, fee percentages, dispute resolutions, and fraud audits.

### Firebase Dual Authentication
Customers and merchants can log in through client-side Firebase Auth. The frontend sends the Firebase ID token to `POST /api/auth/firebase`. The backend verifies the token using the `firebase-admin` SDK, creates/finds the user, and returns an application JWT.

---

## 3. Real-Time WebSockets (Socket.io)

**Connection URL:** `ws://localhost:5000` (or `http://localhost:5000`)

### Events Emitted by Server

| Event Name | Trigger Condition | Payload Example |
|------------|-------------------|-----------------|
| `paymentCreated` | Any successful/pending/failed payment processed | Full populated `Transaction` object (amount, fees, customer, merchant) |
| `fraudAlert` | Transaction exceeds fraud risk thresholds (>₹50k or rapid velocity) | `{ transactionId, riskLevel: 'HIGH', reason: 'High amount threshold exceeded' }` |
| `refundRequested` | Customer files a refund request | `{ refundId, transactionId, amount, customerName, reason }` |
| `refundApproved` | Merchant or Admin approves a refund | `{ refundId, transactionId, amount, status: 'approved' }` |
| `refundRejected` | Merchant or Admin rejects a refund | `{ refundId, transactionId, rejectionReason, status: 'rejected' }` |

---

## 4. System Endpoints

### 4.1 Health Check
- **Endpoint:** `GET /api/health`
- **Auth:** None
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "PaySecure API is running 🚀",
  "docs": "/api-docs"
}
```

---

## 5. Authentication Endpoints

### 5.1 Register User
- **Endpoint:** `POST /api/auth/register`
- **Auth:** None
- **Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "role": "customer" // "customer" or "merchant"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "660e1d88a123bc4567890123",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 5.2 Local Login
- **Endpoint:** `POST /api/auth/login`
- **Auth:** None
- **Request Body:**
```json
{
  "email": "customer@paysecure.com",
  "password": "customer123"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "660e1d88a123bc4567890123",
      "name": "Demo Customer",
      "email": "customer@paysecure.com",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 5.3 Firebase Authentication
- **Endpoint:** `POST /api/auth/firebase`
- **Auth:** None
- **Request Body:**
```json
{
  "idToken": "<firebase_id_token>",
  "role": "customer"
}
```
- **Response (200 OK):** Returns mapped MongoDB user and issued PaySecure JWT token.

---

## 6. Payment Methods Endpoints

### 6.1 List Payment Methods
- **Endpoint:** `GET /api/payment-methods`
- **Auth:** Customer (`Bearer <jwt>`)
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "660e1d88a123bc4567890126",
      "type": "card",
      "provider": "Visa",
      "last4": "4242",
      "expiryMonth": "12",
      "expiryYear": "28",
      "isDefault": true
    }
  ]
}
```

### 6.2 Add Payment Method
- **Endpoint:** `POST /api/payment-methods`
- **Auth:** Customer (`Bearer <jwt>`)
- **Card Request:**
```json
{
  "type": "card",
  "cardNumber": "4242424242424242",
  "cardHolderName": "John Doe",
  "expiryMonth": "12",
  "expiryYear": "28",
  "cvv": "123"
}
```
- **UPI Request:**
```json
{
  "type": "upi",
  "upiId": "john@okaxis"
}
```
- **Wallet Request:**
```json
{
  "type": "wallet",
  "walletProvider": "PaySecure Cash"
}
```

### 6.3 Delete Payment Method
- **Endpoint:** `DELETE /api/payment-methods/:id`
- **Auth:** Customer (`Bearer <jwt>`)
- **Response (200 OK):** `{ "success": true, "message": "Payment method deleted successfully" }`

---

## 7. Payments Endpoints

### 7.1 Process Payment
- **Endpoint:** `POST /api/payments`
- **Auth:** Customer (`Bearer <jwt>`)
- **Simulation Rules:**
  - `amount == 13` → **failed** (Simulation trigger)
  - `amount > 100000` → **pending** (Requires manual high-value audit)
  - `amount > 50000` → Flagged for **fraud risk**
  - Standard amounts → **success**
- **Request Body:**
```json
{
  "amount": 500,
  "merchantId": "660e1d88a123bc4567890124",
  "paymentMethodId": "660e1d88a123bc4567890126",
  "description": "Electronics purchase"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Payment success",
  "data": {
    "transactionId": "TXN-1712983742-8491",
    "amount": 500,
    "fee": 10,
    "netAmount": 490,
    "status": "success",
    "fraudCheck": {
      "flagged": false,
      "riskLevel": "LOW",
      "reason": null
    }
  }
}
```

### 7.2 Get Customer Transactions
- **Endpoint:** `GET /api/payments`
- **Auth:** Customer (`Bearer <jwt>`)
- **Response (200 OK):** Array of transactions for the authenticated customer.

### 7.3 Get Transaction Detail
- **Endpoint:** `GET /api/payments/:id`
- **Auth:** Customer, Merchant, or Admin (`Bearer <jwt>`)
- **Response (200 OK):** Populated transaction record with merchant and payment method details.

### 7.4 Request Refund (Payments Route)
- **Endpoint:** `POST /api/payments/refund`
- **Auth:** Customer (`Bearer <jwt>`)
- **Request Body:**
```json
{
  "transactionId": "660e1d88a123bc4567890127",
  "reason": "Customer cancelled order"
}
```

---

## 8. Refunds Endpoints

### 8.1 List Refunds
- **Endpoint:** `GET /api/refunds`
- **Auth:** Customer (sees own), Merchant (sees store refunds), Admin (sees all)
- **Response (200 OK):** Array of refund documents.

### 8.2 Approve Refund
- **Endpoint:** `PUT /api/refunds/:id/approve`
- **Auth:** Merchant or Admin (`Bearer <jwt>`)
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Refund approved successfully",
  "data": { "status": "approved", "processedAt": "2026-10-13T10:00:00Z" }
}
```

### 8.3 Reject Refund
- **Endpoint:** `PUT /api/refunds/:id/reject`
- **Auth:** Merchant or Admin (`Bearer <jwt>`)
- **Request Body:**
```json
{
  "rejectionReason": "Item opened and returned past return window"
}
```

---

## 9. Disputes Endpoints

### 9.1 Create Dispute
- **Endpoint:** `POST /api/payments/:id/dispute`
- **Auth:** Customer (`Bearer <jwt>`)
- **Request Body:**
```json
{
  "reason": "Merchandise not received after 14 days"
}
```

### 9.2 Get Disputes for Transaction
- **Endpoint:** `GET /api/payments/:id/disputes`
- **Auth:** Customer or Admin (`Bearer <jwt>`)

---

## 10. Merchants Endpoints

### 10.1 Register Merchant Profile
- **Endpoint:** `POST /api/merchants/register`
- **Auth:** Any authenticated user
- **Request Body:**
```json
{
  "businessName": "Apex Digital",
  "businessType": "ecommerce",
  "contactEmail": "support@apexdigital.com",
  "website": "https://apexdigital.com"
}
```

### 10.2 List All Active Merchants
- **Endpoint:** `GET /api/merchants`
- **Auth:** Authenticated user

### 10.3 Get Merchant Details
- **Endpoint:** `GET /api/merchants/:id`
- **Auth:** Authenticated user

### 10.4 Get Merchant Incoming Payments
- **Endpoint:** `GET /api/merchants/:id/transactions`
- **Auth:** Merchant (own) or Admin

---

## 11. Merchant API Keys Endpoints

### 11.1 List API Keys
- **Endpoint:** `GET /api/merchants/keys`
- **Auth:** Merchant (`Bearer <jwt>`)

### 11.2 Generate API Key
- **Endpoint:** `POST /api/merchants/keys`
- **Auth:** Merchant (`Bearer <jwt>`)
- **Request Body:** `{ "name": "Production Storefront" }`
- **Response (201 Created):** Returns generated API key (e.g. `psk_live_xxxxxxxx`).

### 11.3 Revoke API Key
- **Endpoint:** `DELETE /api/merchants/keys/:id`
- **Auth:** Merchant (`Bearer <jwt>`)

---

## 12. Settlements Endpoints

### 12.1 List Settlements
- **Endpoint:** `GET /api/settlements`
- **Auth:** Merchant (own) or Admin (all)

### 12.2 Generate Settlement Batch
- **Endpoint:** `POST /api/settlements/generate`
- **Auth:** Merchant or Admin (`Bearer <jwt>`)
- **Calculations:**
  - `grossAmount` = Sum of all successful transaction amounts
  - `totalFees` = Sum of transaction fees (platform revenue)
  - `netAmount` = `grossAmount - totalFees`

### 12.3 Get Settlement by ID
- **Endpoint:** `GET /api/settlements/:id`
- **Auth:** Merchant or Admin

---

## 13. Admin Governance Endpoints

### 13.1 View All Platform Transactions
- **Endpoint:** `GET /api/admin/transactions`
- **Auth:** Admin (`Bearer <jwt>`)

### 13.2 Generate Revenue & Performance Reports
- **Endpoint:** `GET /api/admin/reports`
- **Auth:** Admin (`Bearer <jwt>`)
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalVolume": 450000,
    "totalRevenue": 9000,
    "totalTransactions": 142,
    "successfulTransactions": 130,
    "failedTransactions": 8,
    "pendingTransactions": 4,
    "failureRate": "5.63%"
  }
}
```

### 13.3 Update Transaction Fee Percentage
- **Endpoint:** `PUT /api/admin/fees`
- **Auth:** Admin (`Bearer <jwt>`)
- **Request Body:** `{ "feePercentage": 2.5 }`

### 13.4 Update Settlement Rules
- **Endpoint:** `PUT /api/admin/settlement-rules`
- **Auth:** Admin (`Bearer <jwt>`)
- **Request Body:**
```json
{
  "settlementFrequency": "daily",
  "minSettlementAmount": 500
}
```

### 13.5 Manage Users & Merchants
- `GET /api/admin/users` - View all users
- `PUT /api/admin/users/:id` - Update user role/status
- `DELETE /api/admin/users/:id` - Deactivate user
- `GET /api/admin/merchants` - View merchant accounts & balances
- `PUT /api/admin/merchants/:id` - Update merchant status
- `DELETE /api/admin/merchants/:id` - Suspend merchant
- `GET /api/admin/disputes` - View all dispute cases
- `PUT /api/admin/disputes/:id` - Resolve dispute with notes

---

## 14. Fraud Detection Endpoints

### 14.1 Execute Fraud Check Engine
- **Endpoint:** `POST /api/fraud/check`
- **Auth:** Authenticated user
- **Rules Evaluated:**
  - `amount > 50,000` → Flagged (Risk: HIGH)
  - `amount == 13` → Flagged (Risk: MEDIUM, Test trigger)
  - `velocity > 5 txns / 10 mins` → Flagged (Risk: HIGH)
- **Request Body:** `{ "amount": 75000 }`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "flagged": true,
    "riskLevel": "HIGH",
    "reason": "Transaction amount exceeds threshold (₹50,000)"
  }
}
```

### 14.2 View Fraud Incident Reports
- **Endpoint:** `GET /api/fraud/reports`
- **Auth:** Admin (`Bearer <jwt>`)

---

## 15. Status Codes & Error Handling

All endpoints follow consistent REST error formats:
```json
{
  "success": false,
  "message": "Human-readable explanation of error",
  "errors": [] // Optional field validation errors from express-validator
}
```

| HTTP Status | Meaning | Scenario |
|-------------|---------|----------|
| `200 OK` | Success | Successful GET, PUT, or DELETE query |
| `201 Created` | Created | Successful entity creation (register, payment, refund) |
| `400 Bad Request` | Client Error | Missing required fields, invalid amount, schema validation fail |
| `401 Unauthorized` | Auth Required | Missing or expired JWT Bearer token |
| `403 Forbidden` | Access Denied | Insufficient role permissions (e.g., customer calling admin endpoint) |
| `404 Not Found` | Entity Missing | Invalid ID or non-existent endpoint |
| `429 Too Many Requests` | Rate Limited | Exceeded rate limit (100 req/15min general, 20/15min auth) |
| `500 Internal Error` | Server Exception | Database or internal processing exception |
