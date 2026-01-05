// Fix missing storagePath for square 5
// Extract storagePath from logoData URL

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

async function fixSquare5() {
  try {
    console.log('🔍 Finding purchase for square 5...\n');
    
    const purchasesRef = db.collection('purchasedSquares');
    const snapshot = await purchasesRef
      .where('squareNumber', '==', 5)
      .where('status', '==', 'active')
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      console.log('❌ No active purchase found for square 5');
      return;
    }
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    const purchaseId = doc.id;
    
    console.log(`📦 Purchase ID: ${purchaseId}`);
    console.log(`🏢 Business: ${data.businessName || 'N/A'}`);
    console.log(`📧 Email: ${data.contactEmail || 'N/A'}\n`);
    
    const logoData = data.logoData || data.logoURL;
    const storagePath = data.storagePath;
    
    console.log('🖼️  Current Status:');
    console.log(`   logoData: ${logoData ? 'PRESENT' : 'MISSING'}`);
    console.log(`   storagePath: ${storagePath || 'MISSING'}\n`);
    
    if (logoData && !storagePath) {
      console.log('🔧 Extracting storagePath from logoData URL...');
      
      // Extract path from Firebase Storage URL
      const urlMatch = logoData.match(/\/o\/([^?]+)/);
      if (urlMatch) {
        const extractedPath = decodeURIComponent(urlMatch[1]);
        console.log(`   ✅ Extracted: ${extractedPath}`);
        
        // Verify file exists
        const bucket = admin.storage().bucket();
        const file = bucket.file(extractedPath);
        const [exists] = await file.exists();
        
        if (exists) {
          console.log('   ✅ File exists in Storage');
          
          // Clean logoData URL (remove token)
          let cleanLogoData = logoData;
          if (logoData.includes('&token=')) {
            cleanLogoData = logoData.split('&token=')[0];
            console.log('   ✅ Cleaned logoData URL (removed token)');
          }
          
          // Update document
          await doc.ref.update({
            storagePath: extractedPath,
            logoData: cleanLogoData,
            logoURL: cleanLogoData
          });
          
          console.log('\n✅ Purchase document updated!');
          console.log(`   storagePath: ${extractedPath}`);
          console.log(`   logoData: ${cleanLogoData.substring(0, 80)}...`);
        } else {
          console.log('   ❌ File does NOT exist in Storage');
        }
      } else {
        console.log('   ❌ Could not extract path from URL');
      }
    } else if (!logoData) {
      console.log('❌ No logoData found - cannot fix');
    } else if (storagePath) {
      console.log('✅ storagePath already exists - no fix needed');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixSquare5()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

