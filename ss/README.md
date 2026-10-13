# 📸 PaySecure Screenshots & Documentation Assets

This folder contains visual artifacts and screenshots for **PaySecure - Payment Gateway System**.

These assets can be directly embedded in:
- The GitHub repository `README.md`
- Your College / Academic Project Submission Document (Word / Google Docs / PDF)
- Presentation slides (PPT / Pitch Deck)

---

## 🗂️ Screenshot Index & Mapping

| # | Asset Filename | Purpose / UI View | Assignment Requirement Covered |
|---|----------------|-------------------|--------------------------------|
| **01** | `01-customer-dashboard.png` | Customer Dashboard | Customer Registration & Account Overview |
| **02** | `02-payment-methods.png` | Payment Methods Screen | Simulated Cards, UPI VPA & Wallet management |
| **03** | `03-make-payment.png` | Payment Processing Modal / Page | Payment Execution (Success, Failed, Pending flows) |
| **04** | `04-transaction-history.png` | Transaction History Table | Status tracking (`success`, `failed`, `pending`) |
| **05** | `05-refund-request.png` | Refund Request Form | Customer-initiated refund flow |
| **06** | `06-dispute-submission.png` | Dispute Filing & Resolution | Customer dispute submission & resolution |
| **07** | `07-merchant-dashboard.png` | Merchant Incoming Transactions | Storefront incoming payment feed & net balance |
| **08** | `08-merchant-api-keys.png` | Merchant API Key Generator | Simulated API keys (`psk_live_*`) for store integration |
| **09** | `09-settlement-reports.png` | Settlement Reports View | Settlement calculation & gross/fee breakdown |
| **10** | `10-admin-dashboard.png` | Admin Platform Controls | User/Merchant management, fee config (PUT `/api/admin/fees`) |
| **11** | `11-admin-revenue-reports.png` | Financial & Revenue Analytics | Revenue reports, total volume & failure analytics |
| **12** | `12-fraud-detection.png` | Fraud Rules & Reports | High-amount triggers, velocity checks, flagged reports |
| **13** | `13-realtime-socket-alert.png` | Real-Time WebSocket Toast | Socket.io live transaction feed & toast notification |
| **14** | `14-swagger-api-docs.png` | Interactive Swagger UI (`/api-docs`)| Complete OpenAPI 3.0 API documentation |
| **15** | `15-postman-test-suite.png` | Postman Collection Execution | 30+ endpoints tested with automated assertions |

---

## 💡 Live Project Screenshots

All images above are real, high-resolution 2x retina captures taken directly from the live PaySecure backend and frontend applications.

---

## 📝 Markdown Snippets for your Project Report or README

### Customer Experience
```markdown
### 👤 Customer Experience
![Customer Dashboard](./ss/01-customer-dashboard.png)
*Figure 1: Customer dashboard displaying simulated balance and quick actions.*

![Payment Methods](./ss/02-payment-methods.png)
*Figure 2: Simulated payment instruments including Credit/Debit card, UPI VPA, and Wallet.*

![Make Payment](./ss/03-make-payment.png)
*Figure 3: Interactive payment checkout simulation with rule triggers.*
```

### Merchant Portal & Settlements
```markdown
### 🏪 Merchant Operations & API Integration
![Merchant Dashboard](./ss/07-merchant-dashboard.png)
*Figure 4: Real-time merchant dashboard showing live incoming transactions.*

![API Keys](./ss/08-merchant-api-keys.png)
*Figure 5: Simulated API key management for ecommerce store integration.*

![Settlement Reports](./ss/09-settlement-reports.png)
*Figure 6: Automated settlement batches with fee deductions and net payouts.*
```

### Platform Governance & Real-Time Monitoring
```markdown
### 🛡️ Administration, Fraud & WebSockets
![Admin Reports](./ss/11-admin-revenue-reports.png)
*Figure 7: Financial analytics displaying platform revenue, transaction volume, and failures.*

![Fraud Detection](./ss/12-fraud-detection.png)
*Figure 8: Rule-based fraud detection engine flagging anomalous transactions.*

![Swagger Documentation](./ss/14-swagger-api-docs.png)
*Figure 9: Live interactive Swagger UI mounted at http://localhost:5005/api-docs.*
```
