import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import bodyParser from 'body-parser';

// Load environment variables
dotenv.config();

// Initialize Express and Stripe
const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const PORT = process.env.PORT || 10000;

// CORS configuration - UPDATED WITH ALL POSSIBLE DOMAINS
app.use(cors({
  origin: [
    'https://clickanlinks-frontend.web.app',    // Your main domain
    'https://clickalinks-frontend.web.app',     // Alternative spelling
    'https://clickanlinks-frontend.firebaseapp.com',
    'https://clickalinks-frontend.firebaseapp.com',
    'http://localhost:3000',
    'https://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ✅ Use JSON parser for all non-webhook routes
// Stripe webhooks must use `express.raw`, so we’ll exclude that below
app.use((req, res, next) => {
  if (req.originalUrl === '/webhook') {
    next(); // skip JSON parsing for Stripe webhook
  } else {
    bodyParser.json({ limit: '10mb' })(req, res, next);
  }
});

// ✅ Request logging (useful for Render)
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`, req.body || 'No body');
  next();
});

// ✅ Root route
app.get('/', (req, res) => {
  res.json({
    message: 'ClickALinks Backend Server is running 🚀',
    endpoints: [
      'GET /health',
      'GET /test-connection',
      'POST /api/create-checkout-session',
      'POST /webhook'
    ],
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// ✅ Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'ClickALinks Backend',
    version: '2.0.0',
    stripe: process.env.STRIPE_SECRET_KEY ? 'Configured' : 'Not configured'
  });
});

// ✅ Connection test route
app.get('/test-connection', (req, res) => {
  res.json({
    message: 'Backend connection successful!',
    stripe: process.env.STRIPE_SECRET_KEY ? 'Configured' : 'Not configured',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// ✅ Stripe Checkout Session Creation
app.post('/api/create-checkout-session', async (req, res) => {
  console.log('🔄 Creating checkout session...');
  try {
    const { amount, businessName, squareNumber, duration, contactEmail, currency = 'gbp' } = req.body;

    // Validation
    if (!amount || !businessName || !squareNumber || !duration) {
      console.log('❌ Missing required fields:', { amount, businessName, squareNumber, duration });
      return res.status(400).json({
        error: 'Missing required fields: amount, businessName, squareNumber, duration'
      });
    }

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    // ✅ Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: `ClickALinks Ad - Square #${squareNumber}`,
              description: `${duration}-day campaign for ${businessName}`,
            },
            unit_amount: Math.round(amount * 100), // convert to smallest currency unit
          },
          quantity: 1,
        },
      ],
      customer_email: contactEmail || undefined,
      metadata: {
        businessName,
        squareNumber: squareNumber.toString(),
        duration: duration.toString(),
        createdAt: new Date().toISOString(),
      },
      success_url: `https://clickanlinks-frontend.web.app/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://clickanlinks-frontend.web.app/checkout`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // expires in 30 mins
    });

    console.log('✅ Checkout session created:', session.id);
    res.json({ success: true, url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('❌ STRIPE ERROR:', error);
    res.status(500).json({
      error: 'Stripe payment failed',
      message: error.message,
      details: {
        type: error.type,
        code: error.code,
        param: error.param
      }
    });
  }
});

// ✅ Stripe Webhook Handler
app.post(
  '/webhook',
  bodyParser.raw({ type: 'application/json' }),
  (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
      console.log('✅ Webhook verified:', event.type);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed':
        console.log('💰 Payment succeeded:', event.data.object.id);
        break;
      case 'checkout.session.expired':
        console.log('⌛ Session expired:', event.data.object.id);
        break;
      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  }
);

// ✅ 404 handler
app.use('*', (req, res) => {
  console.log('❌ Route not found:', req.originalUrl);
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    available: [
      'GET /',
      'GET /health',
      'GET /test-connection',
      'POST /api/create-checkout-session',
      'POST /webhook'
    ]
  });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('🚨 Global error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// ✅ Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 URL: https://clickalinks-backend-1.onrender.com`);
  console.log(`💳 Stripe mode: ${process.env.STRIPE_SECRET_KEY?.includes('_live_') ? 'LIVE' : 'TEST'}`);
});
