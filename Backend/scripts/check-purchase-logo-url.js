// Check and fix purchase logo URLs
// Usage: node scripts/check-purchase-logo-url.js [PURCHASE_ID or SQUARE_NUMBER]

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
  console.log('✅ Firebase Admin initialized\n');
} catch (error) {
  console.error('❌ Error initializing Firebase:', error.message);
  process.exit(1);
}

const db = admin.firestore();
const storage = admin.storage();

async function checkAndFixLogoUrl(squareNumber) {
  try {
    console.log(`🔍 Checking square ${squareNumber}...\n`);
    
    // Find purchase for this square
    const purchasesRef = db.collection('purchasedSquares');
    const snapshot = await purchasesRef
      .where('squareNumber', '==', squareNumber)
      .where('status', '==', 'active')
      .get();
    
    if (snapshot.empty) {
      console.log(`❌ No active purchase found for square ${squareNumber}`);
      return;
    }
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const purchaseId = doc.id;
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📦 Purchase ID: ${purchaseId}`);
      console.log(`🏢 Business: ${data.businessName || 'N/A'}`);
      console.log(`🔲 Square: ${data.squareNumber}`);
      console.log(`📄 Page: ${data.pageNumber || 'N/A'}\n`);
      
      // Check logo URL
      console.log('🖼️  Logo URL Analysis:');
      let logoData = data.logoData || data.logoURL;
      
      if (!logoData) {
        console.log('   ❌ No logoData or logoURL found');
        if (data.storagePath) {
          console.log(`   ✅ storagePath exists: ${data.storagePath}`);
          console.log('   💡 Fix: Constructing URL from storagePath...');
          
          const fixedUrl = `https://firebasestorage.googleapis.com/v0/b/clickalinks-frontend.firebasestorage.app/o/${encodeURIComponent(data.storagePath)}?alt=media`;
          
          // Check if file exists
          const bucket = storage.bucket();
          const file = bucket.file(data.storagePath);
          const [exists] = await file.exists();
          
          if (exists) {
            console.log('   ✅ File exists in Storage');
            console.log(`   ✅ Fixed URL: ${fixedUrl}`);
            
            // Update the document
            await doc.ref.update({
              logoData: fixedUrl,
              logoURL: fixedUrl
            });
            console.log('   ✅ Purchase document updated with correct URL');
          } else {
            console.log('   ❌ File does NOT exist in Storage');
          }
        }
        continue;
      }
      
      console.log(`   Current URL: ${logoData.substring(0, 100)}...`);
      
      // Check for invalid token parameter
      if (logoData.includes('&token=')) {
        console.log('   ⚠️  URL contains invalid token parameter');
        
        // Remove token parameter
        const fixedUrl = logoData.split('&token=')[0];
        console.log(`   ✅ Fixed URL (removed token): ${fixedUrl}`);
        
        // Update the document
        await doc.ref.update({
          logoData: fixedUrl,
          logoURL: fixedUrl
        });
        console.log('   ✅ Purchase document updated with fixed URL');
        
        logoData = fixedUrl;
      }
      
      // Check if URL is valid format
      if (!logoData.startsWith('https://firebasestorage.googleapis.com/')) {
        console.log('   ⚠️  URL format looks incorrect');
      } else {
        console.log('   ✅ URL format looks correct');
      }
      
      // Try to check if file exists (extract path from URL)
      try {
        const urlObj = new URL(logoData);
        const pathMatch = urlObj.pathname.match(/\/o\/(.+)\?/);
        if (pathMatch) {
          const storagePath = decodeURIComponent(pathMatch[1]);
          console.log(`   📁 Extracted storage path: ${storagePath}`);
          
          const bucket = storage.bucket();
          const file = bucket.file(storagePath);
          const [exists] = await file.exists();
          
          if (exists) {
            console.log('   ✅ File exists in Storage');
            
            // Get public URL
            const [metadata] = await file.getMetadata();
            console.log(`   📦 File size: ${metadata.size} bytes`);
          } else {
            console.log('   ❌ File does NOT exist in Storage');
            console.log('   💡 The file may have been deleted or path is incorrect');
          }
        }
      } catch (urlError) {
        console.log('   ⚠️  Could not parse URL:', urlError.message);
      }
      
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Get square number from command line
const squareNumber = process.argv[2] ? parseInt(process.argv[2]) : null;

if (!squareNumber) {
  console.log('Usage: node scripts/check-purchase-logo-url.js [SQUARE_NUMBER]');
  console.log('\nExample: node scripts/check-purchase-logo-url.js 2');
  process.exit(1);
}

checkAndFixLogoUrl(squareNumber)
  .then(() => {
    console.log('✅ Check complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

