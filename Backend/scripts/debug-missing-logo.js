// Debug script to check why logo is not showing
// Usage: node scripts/debug-missing-logo.js

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

async function debugMissingLogo() {
  try {
    console.log('🔍 Checking recent purchases...\n');
    
    // Get all purchases from last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const purchasesRef = db.collection('purchasedSquares');
    const snapshot = await purchasesRef
      .where('purchaseDate', '>=', yesterday)
      .orderBy('purchaseDate', 'desc')
      .limit(10)
      .get();
    
    if (snapshot.empty) {
      console.log('⚠️  No purchases found in last 24 hours');
      console.log('📋 Checking all purchases...\n');
      
      const allSnapshot = await purchasesRef
        .orderBy('purchaseDate', 'desc')
        .limit(5)
        .get();
      
      if (allSnapshot.empty) {
        console.log('❌ No purchases found in database');
        return;
      }
      
      console.log(`📊 Found ${allSnapshot.size} recent purchases:\n`);
      
      for (const doc of allSnapshot.docs) {
        await checkPurchase(doc.id, doc.data());
      }
    } else {
      console.log(`📊 Found ${snapshot.size} purchases from last 24 hours:\n`);
      
      for (const doc of snapshot.docs) {
        await checkPurchase(doc.id, doc.data());
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 9) {
      console.log('\n💡 Tip: You may need to create an index for purchaseDate');
      console.log('   Go to: https://console.firebase.google.com/');
      console.log('   Select your project → Firestore → Indexes');
    }
  }
}

async function checkPurchase(purchaseId, purchaseData) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📦 Purchase ID: ${purchaseId}`);
  console.log(`📅 Purchase Date: ${purchaseData.purchaseDate?.toDate() || 'N/A'}`);
  console.log(`🏢 Business: ${purchaseData.businessName || 'N/A'}`);
  console.log(`📧 Email: ${purchaseData.contactEmail || 'N/A'}`);
  console.log(`🔲 Square: ${purchaseData.squareNumber || 'N/A'}`);
  console.log(`📄 Page: ${purchaseData.pageNumber || 'N/A'}`);
  console.log(`✅ Status: ${purchaseData.status || 'N/A'}`);
  console.log(`💳 Payment: ${purchaseData.paymentStatus || 'N/A'}`);
  console.log('');
  
  // Check logo data
  console.log('🖼️  Logo Information:');
  console.log(`   logoData: ${purchaseData.logoData ? '✅ Present' : '❌ Missing'}`);
  if (purchaseData.logoData) {
    console.log(`   logoData type: ${purchaseData.logoData.substring(0, 50)}...`);
  }
  
  console.log(`   logoURL: ${purchaseData.logoURL ? '✅ Present' : '❌ Missing'}`);
  if (purchaseData.logoURL) {
    console.log(`   logoURL: ${purchaseData.logoURL.substring(0, 80)}...`);
  }
  
  console.log(`   storagePath: ${purchaseData.storagePath ? '✅ Present' : '❌ Missing'}`);
  if (purchaseData.storagePath) {
    console.log(`   storagePath: ${purchaseData.storagePath}`);
    
    // Check if file exists in Storage
    try {
      const bucket = storage.bucket();
      const file = bucket.file(purchaseData.storagePath);
      const [exists] = await file.exists();
      
      if (exists) {
        console.log(`   ✅ File exists in Storage`);
        
        // Check if file is accessible
        const [metadata] = await file.getMetadata();
        console.log(`   📦 File size: ${metadata.size} bytes`);
        console.log(`   📅 Created: ${metadata.timeCreated}`);
      } else {
        console.log(`   ❌ File NOT found in Storage at path: ${purchaseData.storagePath}`);
        
        // Try to find the file
        console.log(`   🔍 Searching for file in Storage...`);
        const [files] = await bucket.getFiles({ prefix: 'logos/' });
        const matchingFiles = files.filter(f => 
          f.name.includes(purchaseId) || 
          f.name.includes(purchaseData.storagePath.split('/').pop())
        );
        
        if (matchingFiles.length > 0) {
          console.log(`   ✅ Found ${matchingFiles.length} matching file(s):`);
          matchingFiles.forEach(f => {
            console.log(`      - ${f.name}`);
          });
        } else {
          console.log(`   ❌ No matching files found in Storage`);
        }
      }
    } catch (error) {
      console.log(`   ⚠️  Error checking Storage: ${error.message}`);
    }
  }
  
  console.log('');
  
  // Check expiration
  if (purchaseData.endDate) {
    const endDate = purchaseData.endDate.toDate();
    const now = new Date();
    const isExpired = endDate < now;
    console.log(`⏰ Expiration:`);
    console.log(`   End Date: ${endDate}`);
    console.log(`   Status: ${isExpired ? '❌ EXPIRED' : '✅ Active'}`);
    if (isExpired) {
      console.log(`   ⚠️  This purchase has expired - logo won't show`);
    }
  }
  
  console.log('');
  
  // Check if purchase is active
  const isActive = purchaseData.status === 'active' && 
                   purchaseData.paymentStatus === 'paid' &&
                   (!purchaseData.endDate || purchaseData.endDate.toDate() > new Date());
  
  console.log(`🎯 Display Status: ${isActive ? '✅ Should Display' : '❌ Won\'t Display'}`);
  if (!isActive) {
    console.log(`   Reasons:`);
    if (purchaseData.status !== 'active') {
      console.log(`      - Status is "${purchaseData.status}" (should be "active")`);
    }
    if (purchaseData.paymentStatus !== 'paid') {
      console.log(`      - Payment status is "${purchaseData.paymentStatus}" (should be "paid")`);
    }
    if (purchaseData.endDate && purchaseData.endDate.toDate() <= new Date()) {
      console.log(`      - Purchase has expired`);
    }
  }
  
  console.log('\n');
}

// Run the debug
debugMissingLogo()
  .then(() => {
    console.log('✅ Debug complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

