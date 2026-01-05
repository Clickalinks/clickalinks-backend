// Check if a purchase should be visible on a specific page
// Usage: node scripts/check-square-display.js [SQUARE_NUMBER]

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
try {
  const serviceAccountPath = join(__dirname, '..', 'firebase-service-account.json');
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'clickalinks-frontend.firebasestorage.app'
  });
} catch (error) {
  console.error('❌ Error initializing Firebase:', error.message);
  process.exit(1);
}

const db = admin.firestore();

// Calculate which page a square is on (200 squares per page)
function getPageNumber(squareNumber) {
  return Math.ceil(squareNumber / 200);
}

// Calculate the start/end range for a page
function getPageRange(pageNumber) {
  const start = (pageNumber - 1) * 200 + 1;
  const end = pageNumber * 200;
  return { start, end };
}

async function checkSquare(squareNumber) {
  try {
    console.log(`🔍 Checking square ${squareNumber}...\n`);
    
    // Calculate page
    const pageNumber = getPageNumber(squareNumber);
    const { start, end } = getPageRange(pageNumber);
    
    console.log(`📄 Square ${squareNumber} is on Page ${pageNumber}`);
    console.log(`📊 Page ${pageNumber} range: squares ${start}-${end}\n`);
    
    // Find purchase for this square
    const purchasesRef = db.collection('purchasedSquares');
    const snapshot = await purchasesRef
      .where('squareNumber', '==', squareNumber)
      .where('status', '==', 'active')
      .get();
    
    if (snapshot.empty) {
      console.log(`❌ No active purchase found for square ${squareNumber}`);
      console.log(`\n💡 This square should appear as "Available" on page ${pageNumber}`);
      return;
    }
    
    console.log(`✅ Found ${snapshot.size} purchase(s) for square ${squareNumber}:\n`);
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📦 Purchase ID: ${doc.id}`);
      console.log(`🏢 Business: ${data.businessName || 'N/A'}`);
      console.log(`📧 Email: ${data.contactEmail || 'N/A'}`);
      console.log(`🔲 Square: ${data.squareNumber}`);
      console.log(`📄 Page: ${data.pageNumber || 'N/A'}`);
      console.log(`✅ Status: ${data.status}`);
      console.log(`💳 Payment: ${data.paymentStatus}`);
      console.log('');
      
      // Check if page number matches
      if (data.pageNumber && data.pageNumber !== pageNumber) {
        console.log(`⚠️  WARNING: Purchase says page ${data.pageNumber}, but square ${squareNumber} is actually on page ${pageNumber}`);
        console.log(`   This might cause the logo to not display correctly!\n`);
      }
      
      // Check logo
      console.log('🖼️  Logo:');
      if (data.logoData) {
        console.log(`   ✅ logoData: Present`);
        console.log(`   📎 URL: ${data.logoData.substring(0, 80)}...`);
      } else {
        console.log(`   ❌ logoData: Missing`);
      }
      
      if (data.storagePath) {
        console.log(`   ✅ storagePath: ${data.storagePath}`);
      } else {
        console.log(`   ❌ storagePath: Missing`);
      }
      console.log('');
      
      // Check expiration
      if (data.endDate) {
        const endDate = data.endDate.toDate();
        const now = new Date();
        const isExpired = endDate < now;
        console.log(`⏰ Expiration:`);
        console.log(`   End Date: ${endDate.toLocaleString()}`);
        console.log(`   Status: ${isExpired ? '❌ EXPIRED' : '✅ Active'}`);
        console.log('');
      }
      
      // Final verdict
      const shouldDisplay = data.status === 'active' && 
                           data.paymentStatus === 'paid' &&
                           data.logoData &&
                           (!data.endDate || data.endDate.toDate() > new Date());
      
      console.log(`🎯 Display Status: ${shouldDisplay ? '✅ SHOULD DISPLAY' : '❌ WON\'T DISPLAY'}`);
      
      if (shouldDisplay) {
        console.log(`\n✅ This logo SHOULD be visible on:`);
        console.log(`   - Page ${pageNumber} (squares ${start}-${end})`);
        console.log(`   - Square ${squareNumber}`);
        console.log(`\n💡 If it's not showing:`);
        console.log(`   1. Make sure you're viewing page ${pageNumber}`);
        console.log(`   2. Hard refresh the page (Ctrl+F5)`);
        console.log(`   3. Check browser console for errors`);
        console.log(`   4. Clear browser cache completely`);
      } else {
        console.log(`\n❌ Reasons it won't display:`);
        if (data.status !== 'active') {
          console.log(`   - Status is "${data.status}" (should be "active")`);
        }
        if (data.paymentStatus !== 'paid') {
          console.log(`   - Payment status is "${data.paymentStatus}" (should be "paid")`);
        }
        if (!data.logoData) {
          console.log(`   - logoData is missing`);
        }
        if (data.endDate && data.endDate.toDate() <= new Date()) {
          console.log(`   - Purchase has expired`);
        }
      }
      
      console.log('\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Get square number from command line
const squareNumber = process.argv[2] ? parseInt(process.argv[2]) : null;

if (!squareNumber) {
  console.log('Usage: node scripts/check-square-display.js [SQUARE_NUMBER]');
  console.log('\nExample: node scripts/check-square-display.js 1397');
  process.exit(1);
}

checkSquare(squareNumber)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

