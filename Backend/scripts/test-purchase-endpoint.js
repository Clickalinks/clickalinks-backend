// Test script to check if purchase endpoint is working
// Usage: node scripts/test-purchase-endpoint.js

const BACKEND_URL = process.env.BACKEND_URL || 'https://clickalinks-backend-2.onrender.com';

async function testPurchaseEndpoint() {
  console.log('🧪 Testing purchase endpoint...\n');
  console.log('Backend URL:', BACKEND_URL);
  
  const testPurchase = {
    squareNumber: 999,
    pageNumber: 1,
    businessName: 'Test Business',
    contactEmail: 'test@example.com',
    website: 'https://example.com',
    dealLink: 'https://example.com',
    logoData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    duration: 10,
    amount: 10,
    transactionId: `test-${Date.now()}`,
    paymentStatus: 'paid'
  };

  try {
    console.log('\n📤 Sending test purchase request...');
    console.log('Data:', JSON.stringify(testPurchase, null, 2));
    
    const response = await fetch(`${BACKEND_URL}/api/purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPurchase)
    });

    const result = await response.json();
    
    console.log('\n📥 Response Status:', response.status);
    console.log('📥 Response:', JSON.stringify(result, null, 2));
    
    if (response.ok && result.success) {
      console.log('\n✅ Purchase endpoint is working!');
    } else {
      console.log('\n❌ Purchase endpoint failed:');
      console.log('Error:', result.error || result.message);
    }
    
  } catch (error) {
    console.error('\n❌ Error testing endpoint:', error.message);
    console.error('Full error:', error);
  }
}

testPurchaseEndpoint();

