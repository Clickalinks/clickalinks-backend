/**
 * List All Collections
 * Lists all collections in Firestore
 */

import admin from '../config/firebaseAdmin.js';
import dotenv from 'dotenv';

dotenv.config();

const db = admin.firestore();

async function listAllCollections() {
  try {
    console.log('🔍 Listing all Firestore collections...\n');
    
    const collections = await db.listCollections();
    
    if (collections.length === 0) {
      console.log('❌ No collections found in Firestore');
      return;
    }
    
    console.log(`📊 Found ${collections.length} collection(s):\n`);
    
    for (const collection of collections) {
      console.log(`📁 Collection: ${collection.id}`);
      
      // Get document count
      const snapshot = await collection.get();
      console.log(`   Documents: ${snapshot.size}`);
      
      // Show first few document IDs if any
      if (snapshot.size > 0) {
        const docIds = snapshot.docs.slice(0, 5).map(doc => doc.id);
        console.log(`   Sample document IDs: ${docIds.join(', ')}${snapshot.size > 5 ? '...' : ''}`);
      }
      
      console.log('');
    }
    
    // Specifically check for purchasedSquares
    console.log('\n🔍 Checking purchasedSquares collection specifically...');
    const purchasedSquaresRef = db.collection('purchasedSquares');
    const purchasedSquaresSnapshot = await purchasedSquaresRef.get();
    
    if (purchasedSquaresSnapshot.empty) {
      console.log('❌ purchasedSquares collection is empty or doesn\'t exist');
    } else {
      console.log(`✅ purchasedSquares collection exists with ${purchasedSquaresSnapshot.size} document(s)`);
      purchasedSquaresSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${doc.id}: Square ${data.squareNumber || 'N/A'}, Business: ${data.businessName || 'N/A'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error listing collections:', error);
    throw error;
  }
}

// Run the script
listAllCollections()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
