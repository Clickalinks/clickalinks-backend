import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';

// Load environment variables
dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const PORT = process.env.PORT || 10000;

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://www.clickalinks.com',
    'https://clickalinks.web.app'
  ],
  credentials: true
}));

// Enhanced JSON parsing with error handling
app.use(express.json({
  verify: (req, res, buf) => {
    try {
      if (buf.length > 0) {
        JSON.parse(buf);
      }
    } catch (e) {
      console.log('❌ Invalid JSON received:', buf.toString());
      res.status(400).json({ error: 'Invalid JSON format' });
      throw new Error('Invalid JSON');
    }
  },
  limit: '10mb'
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`, req.body);
  next();
});

// Basic test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'ClickALinks Backend Server is working!',
    endpoints: [
      'GET /health',
      'POST /api/create-checkout-session',
      'GET /test-connection'
    ]
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'ClickALinks Backend',
    version: '1.0.0'
  });
});

// Test connection route
app.get('/test-connection', (req, res) => {
  res.json({ 
    message: 'Backend connection successful!',
    serverTime: new Date().toISOString(),
    stripe: process.env.STRIPE_SECRET_KEY ? 'Configured' : 'Not configured'
  });
});

// Create checkout session endpoint
app.post('/api/create-checkout-session', async (req, res) => {
  console.log('🔄 Creating checkout session...', req.body);
  
  try {
    const { amount, businessName, squareNumber, duration, contactEmail, currency = 'gbp' } = req.body;

    // Validate required fields
    if (!amount || !businessName || !squareNumber || !duration) {
      return res.status(400).json({ 
        error: 'Missing required fields: amount, businessName, squareNumber, duration' 
      });
    }

    console.log('💰 Payment Details:', {
      amount,
      businessName,
      squareNumber, 
      duration,
      contactEmail,
      currency
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: `ClickALinks Ad - Square #${squareNumber}`,
              description: `${duration}-day campaign for ${businessName}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to pennies
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `https://www.clickalinks.com/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://www.clickalinks.com/checkout`,
      customer_email: contactEmail,
      metadata: {
        businessName: businessName,
        squareNumber: squareNumber,
        duration: duration,
        timestamp: new Date().toISOString()
      }
    });

    console.log('✅ Checkout session created:', session.id);
    console.log('🔗 Checkout URL:', session.url);
    
    res.json({ 
      success: true,
      url: session.url,
      sessionId: session.id
    });
    
  } catch (error) {
    console.error('❌ Checkout session error:', error.message);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      message: error.message 
    });
  }
});

// Webhook endpoint for live payments
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log(`❌ Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('💰 Payment succeeded:', session.id);
      // Update your database - mark payment as completed
      break;
    case 'checkout.session.expired':
      console.log('❌ Checkout session expired');
      break;
    default:
      console.log(`🔔 Unhandled event type: ${event.type}`);
  }

  res.json({received: true});
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    availableRoutes: [
      'GET /',
      'GET /health', 
      'GET /test-connection',
      'POST /api/create-checkout-session',
      'POST /webhook'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('🚨 Global error handler:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`💳 Payment endpoints available at http://localhost:${PORT}/api`);
  console.log(`🔗 Test URL: http://localhost:${PORT}/test-connection`);
  console.log(`🌍 Server is accessible from external connections`);
});