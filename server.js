import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';

// Load environment variables
dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const PORT = process.env.PORT || 10000;

// ✅ FIXED CORS - ADD YOUR ACTUAL FRONTEND DOMAIN
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://clickalinks-frontend.web.app', // ← ADD THIS
    'https://clickalinks-frontend.firebaseapp.com', // ← ADD THIS
    'https://clickalinks-frontend-1.onrender.com',
    'https://www.clickalinks.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ✅ HEALTH CHECK
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend is running with FIXED CORS!',
    timestamp: new Date().toISOString(),
    frontend: 'https://clickalinks-frontend.web.app'
  });
});

// ✅ TEST CORS ENDPOINT
app.get('/api/test-cors', (req, res) => {
  res.json({
    success: true,
    message: 'CORS IS WORKING! 🎉',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin
  });
});

// ✅ STRIPE PAYMENT ENDPOINT
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    console.log('💰 Payment request received from:', req.headers.origin);
    
    const { 
      amount, 
      businessName, 
      squareNumber, 
      duration, 
      contactEmail,
      pageNumber = 1,
      website = '',
      dealDescription = ''
    } = req.body;

    // Validate required fields
    if (!amount || !businessName || !squareNumber || !duration || !contactEmail) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    console.log(`🔄 Creating Stripe session for ${businessName}, Amount: £${amount}`);
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'gbp',
          product_data: {
            name: `ClickALinks - Square #${squareNumber}`,
            description: `${duration} days advertising for ${businessName}`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `https://clickalinks-frontend.web.app/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: 'https://clickalinks-frontend.web.app/',
      customer_email: contactEmail,
      metadata: {
        squareNumber: squareNumber.toString(),
        pageNumber: pageNumber.toString(),
        businessName: businessName,
        duration: duration.toString(),
        contactEmail: contactEmail,
        website: website,
        dealDescription: dealDescription
      }
    });

    console.log('✅ Stripe session created:', session.id);
    
    res.json({
      success: true,
      url: session.url,
      sessionId: session.id,
      message: 'Redirect to Stripe Checkout'
    });
    
  } catch (error) {
    console.error('❌ Stripe error:', error.message);
    res.status(500).json({ 
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 CORS enabled for: clickalinks-frontend.web.app`);
});