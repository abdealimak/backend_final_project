# PaySecure Frontend - Client Web Application

The modern client dashboard and interactive checkout portal for the **PaySecure** payment gateway platform.

## Features Included

- **Role-Based Portals:**
  - **Customer Portal:** Simulated wallet balance, payment instruments (Card, UPI, Wallet), instant checkout, dispute filing, and refund management.
  - **Merchant Dashboard:** Real-time incoming payment updates, net revenue calculation, API key provisioning, and settlement reports.
  - **Admin Control Center:** Platform fee configuration, settlement cycle rules, user & merchant management, fraud monitoring, and financial analytics.
- **Dual Authentication:** Firebase Authentication client SDK integration with local JWT fallback.
- **Real-Time Updates:** Socket.io client listening for live payment status changes, refunds, and fraud alerts.

## Technology Stack

- **Framework:** React 18 / 19
- **Build Tool:** Vite
- **Routing:** React Router v7
- **HTTP Client:** Axios with JWT interceptor
- **Real-Time:** Socket.io Client
- **Authentication:** Firebase Client SDK

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure variables point to your local backend:
```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

### 3. Run Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```
