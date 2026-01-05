# ClickaLinks - Direct Advertising Platform

A modern grid-based advertising platform where businesses can purchase advertising squares starting at £1 per day.

## 🚀 Features

- **Grid Advertising**: 2000+ advertising squares across 10 pages
- **Affordable Pricing**: Starting at just £1 per day
- **Instant Activation**: Ads go live immediately after payment
- **Secure Payments**: Stripe integration for secure transactions
- **Promo Codes**: Support for promotional discounts
- **Admin Dashboard**: Manage shuffles, promo codes, and purchases
- **SEO Optimized**: Full search engine optimization
- **Responsive Design**: Works on all devices

## 📁 Project Structure

```
ClickaLinks/
├── Backend/              # Node.js/Express backend API
│   ├── config/          # Firebase Admin configuration
│   ├── middleware/      # Express middleware (security, validation)
│   ├── routes/          # API route handlers
│   ├── scripts/         # Utility scripts (diagnostics, admin tools)
│   ├── services/        # Business logic services
│   ├── utils/           # Utility functions
│   ├── firestore.rules  # Firestore security rules
│   ├── storage.rules    # Firebase Storage security rules
│   └── server.js        # Express server entry point
│
├── frontend/            # React frontend application
│   ├── public/         # Static assets
│   └── src/            # React source code
│       ├── components/ # React components
│       ├── utils/      # Frontend utilities
│       └── firebase.js # Firebase client configuration
│
└── docs/               # Documentation
    ├── deployment/     # Deployment guides
    ├── security/       # Security audit reports
    ├── setup/          # Setup guides
    └── archive/        # Archived documentation
```

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express
- **Firebase Admin SDK** (Firestore, Storage)
- **Stripe** (payment processing)
- **Nodemailer** (email notifications)
- **Express Validator** (input validation)
- **Helmet** (security headers)

### Frontend
- **React** (UI framework)
- **React Router** (routing)
- **Firebase SDK** (Firestore, Storage)
- **react-helmet-async** (SEO meta tags)

## 🔧 Setup

### Prerequisites
- Node.js 18+ and npm
- Firebase project
- Stripe account
- SMTP email service (IONOS, SendGrid, etc.)

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd Backend
   npm install
   ```

2. **Configure environment variables** (in Render.com or `.env`):
   ```
   FIREBASE_SERVICE_ACCOUNT=<base64-encoded-json>
   STRIPE_SECRET_KEY=<your-stripe-key>
   SMTP_HOST=smtp.ionos.co.uk
   SMTP_USER=<your-email>
   SMTP_PASS=<your-password>
   ADMIN_PASSWORD_HASH=<bcrypt-hash>
   ADMIN_MFA_SECRET=<totp-secret>
   ADMIN_MFA_ENABLED=true
   ```

3. **Deploy to Render.com** or run locally:
   ```bash
   node server.js
   ```

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure Firebase** in `src/firebase.js`

3. **Build and deploy:**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

## 📚 Documentation

- **[Deployment Guide](docs/deployment/)** - How to deploy to production
- **[Security Audit](docs/security/)** - Security audit reports
- **[Setup Guides](docs/setup/)** - Detailed setup instructions

## 🔒 Security Features

- Admin authentication with MFA
- Rate limiting on API endpoints
- HTTPS enforcement
- Firestore security rules
- File upload validation
- Virus scanning integration
- Input sanitization

## 📝 License

Copyright © ClickaLinks - Clicado Media UK Ltd

## 🆘 Support

For support, email: support@clickalinks.com

---

Built with ❤️ by ClickaLinks

