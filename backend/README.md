# PaySecure Backend

Express.js + MongoDB backend for the PaySecure payment gateway simulation.

## Quick Start

```bash
cp .env.example .env     # Configure environment variables
npm install              # Install dependencies
npm run seed             # Seed demo data
npm run dev              # Start development server
```

## API Health Check

```
GET http://localhost:5000/api/health
```

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@paysecure.com | admin123 |
| Customer | customer@paysecure.com | customer123 |
| Merchant | merchant@paysecure.com | merchant123 |

See the root README for full documentation.
