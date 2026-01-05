// Check if a file exists in Firebase Storage
// Usage: node scripts/check-storage-file.js [STORAGE_PATH]

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

const storage = admin.storage();
const bucket = storage.bucket();

async function checkFile(storagePath) {
  try {
    console.log(`🔍 Checking file: ${storagePath}\n`);
    
    const file = bucket.file(storagePath);
    const [exists] = await file.exists();
    
    if (exists) {
      const [metadata] = await file.getMetadata();
      console.log('✅ File EXISTS in Storage');
      console.log(`📦 File size: ${metadata.size} bytes`);
      console.log(`📅 Created: ${metadata.timeCreated}`);
      console.log(`🔗 Content Type: ${metadata.contentType}`);
      
      // Get public URL
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media`;
      console.log(`\n🔗 Public URL: ${publicUrl}`);
      console.log('\n✅ File is accessible');
    } else {
      console.log('❌ File does NOT exist in Storage');
      console.log('\n💡 Possible reasons:');
      console.log('   1. File was deleted');
      console.log('   2. Storage path is incorrect');
      console.log('   3. File was never uploaded');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

const storagePath = process.argv[2];

if (!storagePath) {
  console.log('Usage: node scripts/check-storage-file.js [STORAGE_PATH]');
  console.log('\nExample: node scripts/check-storage-file.js logos/purchase-1767622227434-sgpkqceb9aq-1767622227434');
  process.exit(1);
}

checkFile(storagePath)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

