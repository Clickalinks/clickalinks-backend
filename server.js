import express from 'express';
import Stripe from 'stripe';

const app = express();

// ✅ NUCLEAR CORS - HANDLES EVERYTHING
app.use((req, res, next) => {
  console.log(`🌐 Incoming ${req.method} request to ${req.path} from origin: ${req.headers.origin}`);
  
  // Set CORS headers for ALL responses
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Length, X-API-Key');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🛬 Handling OPTIONS preflight request');
    return res.status(200).send();
  }
  
  next();
});

app.use(express.json());

// ✅ DEBUG HEALTH CHECK
app.get('/health', (req, res) => {
  console.log('🏥 Health check called from:', req.headers.origin);
  res.json({ 
    status: 'OK', 
    message: 'Backend is running with NUCLEAR CORS!',
    timestamp: new Date().toISOString(),
    yourOrigin: req.headers.origin,
    cors: 'ENABLED_FOR_ALL_ORIGINS'
  });
});

// ✅ TEST ENDPOINT - VERIFY CORS WORKS
app.get('/api/test-cors', (req, res) => {
  console.log('🧪 CORS test endpoint called from:', req.headers.origin);
  res.json({
    success: true,
    message: 'CORS IS WORKING! 🎉',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin
  });
});

// ✅ STRIPE PAYMENT ENDPOINT
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    console.log('💰 Payment request received from origin:', req.headers.origin);
    console.log('📦 Request body:', JSON.stringify(req.body));
    
    // Validate Stripe key
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key not configured');
    }

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

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Server running with NUCLEAR CORS!');
  console.log('📍 Port:', PORT);
  console.log('🌐 CORS: ENABLED FOR ALL ORIGINS (*)');
  console.log('💳 Stripe: READY');
<<<<<<< HEAD
});
=======
});
>>>>>>> 911d79f83c9bb36638548ae1d4c5b29efd8fdf9b
