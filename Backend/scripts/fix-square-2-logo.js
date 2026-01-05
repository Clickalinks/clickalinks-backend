// Fix logo URL for square 2
// Remove invalid token parameter from URL

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
const storage = admin.storage();

async function fixSquare2Logo() {
  try {
    console.log('🔍 Finding purchase for square 2...\n');
    
    // Find purchase for square 2
    const purchasesRef = db.collection('purchasedSquares');
    const snapshot = await purchasesRef
      .where('squareNumber', '==', 2)
      .where('status', '==', 'active')
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      console.log('❌ No active purchase found for square 2');
      return;
    }
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    const purchaseId = doc.id;
    
    console.log(`📦 Purchase ID: ${purchaseId}`);
    console.log(`🏢 Business: ${data.businessName || 'N/A'}`);
    console.log(`📧 Email: ${data.contactEmail || 'N/A'}\n`);
    
    // Check logo URL
    let logoData = data.logoData || data.logoURL;
    let logoURL = data.logoURL;
    
    if (!logoData) {
      console.log('❌ No logoData found');
      
      // Try to construct from storagePath
      if (data.storagePath) {
        console.log(`📁 storagePath: ${data.storagePath}`);
        const fixedUrl = `https://firebasestorage.googleapis.com/v0/b/clickalinks-frontend.firebasestorage.app/o/${encodeURIComponent(data.storagePath)}?alt=media`;
        
        // Check if file exists
        const bucket = storage.bucket();
        const file = bucket.file(data.storagePath);
        const [exists] = await file.exists();
        
        if (exists) {
          console.log('✅ File exists in Storage');
          console.log(`✅ Constructed URL: ${fixedUrl}`);
          
          await doc.ref.update({
            logoData: fixedUrl,
            logoURL: fixedUrl
          });
          console.log('✅ Purchase document updated');
        } else {
          console.log('❌ File does NOT exist in Storage');
        }
      }
      return;
    }
    
    console.log(`📎 Current logoData: ${logoData.substring(0, 120)}...`);
    
    // Check for token parameter (invalid)
    if (logoData.includes('&token=')) {
      console.log('⚠️  URL contains invalid token parameter - removing it...');
      const fixedUrl = logoData.split('&token=')[0];
      console.log(`✅ Fixed URL: ${fixedUrl.substring(0, 120)}...`);
      
      await doc.ref.update({
        logoData: fixedUrl,
        logoURL: fixedUrl
      });
      console.log('✅ Purchase document updated with fixed URL (token removed)');
      logoData = fixedUrl;
    }
    
    // Verify file exists
    try {
      const urlObj = new URL(logoData);
      const pathMatch = urlObj.pathname.match(/\/o\/(.+)\?/);
      if (pathMatch) {
        const storagePath = decodeURIComponent(pathMatch[1]);
        console.log(`\n📁 Checking file in Storage: ${storagePath}`);
        
        const bucket = storage.bucket();
        const file = bucket.file(storagePath);
        const [exists] = await file.exists();
        
        if (exists) {
          const [metadata] = await file.getMetadata();
          console.log(`✅ File exists (${metadata.size} bytes)`);
          console.log(`✅ URL should work: ${logoData.substring(0, 100)}...`);
        } else {
          console.log('❌ File does NOT exist in Storage');
          console.log('💡 The logo file may have been deleted');
        }
      }
    } catch (urlError) {
      console.log('⚠️  Could not parse URL:', urlError.message);
    }
    
    console.log('\n✅ Fix complete!');
    console.log('💡 Try refreshing the page (Ctrl+F5) to see the logo');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixSquare2Logo()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

