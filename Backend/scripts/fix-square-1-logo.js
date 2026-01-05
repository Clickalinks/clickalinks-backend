// Fix logo for square 1 (AQ Accountants)
// Check if logo file exists, if not, try to find it or mark purchase for manual fix

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
const bucket = storage.bucket();

async function fixSquare1Logo() {
  try {
    console.log('🔍 Finding purchase for square 1...\n');
    
    // Find purchase for square 1
    const purchasesRef = db.collection('purchasedSquares');
    const snapshot = await purchasesRef
      .where('squareNumber', '==', 1)
      .where('status', '==', 'active')
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      console.log('❌ No active purchase found for square 1');
      return;
    }
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    const purchaseId = doc.id;
    
    console.log(`📦 Purchase ID: ${purchaseId}`);
    console.log(`🏢 Business: ${data.businessName || 'N/A'}`);
    console.log(`📧 Email: ${data.contactEmail || 'N/A'}`);
    console.log(`📅 Created: ${data.createdAt?.toDate() || data.purchaseDate || 'N/A'}\n`);
    
    // Check logo file
    const storagePath = data.storagePath;
    const logoData = data.logoData || data.logoURL;
    
    console.log('🖼️  Logo Status:');
    console.log(`   storagePath: ${storagePath || 'NOT SET'}`);
    console.log(`   logoData: ${logoData ? logoData.substring(0, 80) + '...' : 'NOT SET'}\n`);
    
    if (storagePath) {
      console.log(`🔍 Checking if file exists: ${storagePath}`);
      const file = bucket.file(storagePath);
      const [exists] = await file.exists();
      
      if (exists) {
        console.log('✅ File EXISTS in Storage!');
        const [metadata] = await file.getMetadata();
        console.log(`   Size: ${metadata.size} bytes`);
        console.log(`   Content Type: ${metadata.contentType}`);
        console.log('\n💡 The file exists - URL might just need token removal or refresh');
        
        // Get public URL
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media`;
        console.log(`\n🔗 Public URL (no token): ${publicUrl}`);
        
        // Check if URL has token parameter
        if (logoData && logoData.includes('&token=')) {
          console.log('\n⚠️  Current URL has token parameter - this is normal for Firebase Storage');
          console.log('💡 Removing token parameter and updating...');
          
          const cleanUrl = logoData.split('&token=')[0];
          await doc.ref.update({
            logoData: cleanUrl,
            logoURL: cleanUrl
          });
          console.log('✅ Updated with clean URL');
        }
      } else {
        console.log('❌ File does NOT exist in Storage');
        console.log('\n🔍 Searching for similar files...');
        
        // Try to find files with similar names
        const prefix = storagePath.split('-').slice(0, -1).join('-');
        console.log(`   Searching for files matching: ${prefix}*`);
        
        const [files] = await bucket.getFiles({ prefix: 'logos/' });
        const matchingFiles = files.filter(f => f.name.includes(prefix.split('/').pop()));
        
        if (matchingFiles.length > 0) {
          console.log(`\n✅ Found ${matchingFiles.length} similar file(s):`);
          matchingFiles.forEach(f => {
            console.log(`   - ${f.name}`);
          });
          
          // Use the first matching file
          const foundFile = matchingFiles[0];
          const foundPath = foundFile.name;
          const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(foundPath)}?alt=media`;
          
          console.log(`\n💡 Updating purchase with found file: ${foundPath}`);
          await doc.ref.update({
            logoData: publicUrl,
            logoURL: publicUrl,
            storagePath: foundPath
          });
          console.log('✅ Purchase updated with correct file path');
        } else {
          console.log('❌ No similar files found');
          console.log('\n⚠️  LOGO FILE IS MISSING');
          console.log('💡 Options:');
          console.log('   1. Delete this purchase and ask customer to re-upload');
          console.log('   2. Manually upload the logo file to Storage');
          console.log('   3. Contact customer to provide logo again');
          
          // Mark purchase as needing manual review
          await doc.ref.update({
            logoIssue: 'FILE_MISSING',
            logoIssueDate: admin.firestore.FieldValue.serverTimestamp()
          });
          console.log('\n✅ Purchase marked with logoIssue flag');
        }
      }
    } else {
      console.log('❌ No storagePath found in purchase document');
      console.log('💡 Logo was never uploaded or path was lost');
      
      if (logoData && logoData.startsWith('http')) {
        console.log('\n⚠️  logoData is a URL but storagePath is missing');
        console.log('💡 This suggests the file was deleted from Storage');
      }
    }
    
    console.log('\n✅ Check complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

fixSquare1Logo()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

