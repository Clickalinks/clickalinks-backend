// Delete purchase for square 2 (file doesn't exist in Storage)
// Usage: node scripts/delete-square-2-purchase.js

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

async function deleteSquare2Purchase() {
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
      console.log('✅ No active purchase found for square 2 - square is already available');
      return;
    }
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    const purchaseId = doc.id;
    
    console.log(`📦 Purchase ID: ${purchaseId}`);
    console.log(`🏢 Business: ${data.businessName || 'N/A'}`);
    console.log(`📧 Email: ${data.contactEmail || 'N/A'}`);
    console.log(`📅 Created: ${data.createdAt?.toDate() || 'N/A'}`);
    console.log(`🖼️  Logo file: ${data.storagePath || 'N/A'}`);
    console.log('\n⚠️  This purchase references a logo file that was deleted from Storage.');
    console.log('🗑️  Deleting purchase document...\n');
    
    // Delete the document
    await doc.ref.delete();
    
    console.log('✅ Purchase document deleted successfully!');
    console.log('✅ Square 2 is now available again');
    console.log('\n💡 You can now upload a new logo to square 2');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

deleteSquare2Purchase()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

