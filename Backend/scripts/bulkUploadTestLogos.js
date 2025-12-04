/**
 * Bulk Upload Test Logos Script
 * Uploads 200 test logos to Firestore for shuffle testing
 * 
 * Usage: node scripts/bulkUploadTestLogos.js
 */

import admin from '../config/firebaseAdmin.js';

// Get Firestore instance
const db = admin.firestore();

// Generate unique purchase ID
function generateUniquePurchaseId() {
  return `purchase-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

// Generate unique logo with pattern - each purchase gets a unique visual identifier
// This way you can see which logo moved where after shuffle
function generateUniqueLogo(purchaseIndex, purchaseId) {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#E74C3C',
    '#52BE80', '#5DADE2', '#F39C12', '#E67E22', '#9B59B6',
    '#1ABC9C', '#3498DB', '#E91E63', '#00BCD4', '#FF9800',
    '#8E44AD', '#16A085', '#27AE60', '#2980B9', '#C0392B'
  ];
  
  // Generate unique identifier based on purchase index (not square number!)
  // This stays with the purchase, so you can track movement
  let identifier = '';
  let pattern = '';
  
  // Use ABC pattern: A-Z (26), then AA-ZZ (676), then AAA-ZZZ, etc.
  if (purchaseIndex < 26) {
    identifier = String.fromCharCode(65 + purchaseIndex); // A-Z
    pattern = 'circle';
  } else if (purchaseIndex < 702) { // 26 + 26*26 = 702
    const first = Math.floor((purchaseIndex - 26) / 26);
    const second = (purchaseIndex - 26) % 26;
    identifier = String.fromCharCode(65 + first) + String.fromCharCode(65 + second); // AA-ZZ
    pattern = 'square';
  } else {
    const first = Math.floor((purchaseIndex - 702) / 676);
    const second = Math.floor(((purchaseIndex - 702) % 676) / 26);
    const third = (purchaseIndex - 702) % 26;
    identifier = String.fromCharCode(65 + first) + String.fromCharCode(65 + second) + String.fromCharCode(65 + third);
    pattern = 'triangle';
  }
  
  const color = colors[purchaseIndex % colors.length];
  const textColor = '#FFFFFF';
  const fontSize = identifier.length === 1 ? '100' : identifier.length === 2 ? '70' : '50';
  
  // Create SVG with unique identifier and pattern
  let shape = '';
  if (pattern === 'circle') {
    shape = '<circle cx="100" cy="100" r="80" fill="rgba(255,255,255,0.2)"/>';
  } else if (pattern === 'square') {
    shape = '<rect x="30" y="30" width="140" height="140" fill="rgba(255,255,255,0.2)" rx="10"/>';
  } else {
    shape = '<polygon points="100,30 170,150 30,150" fill="rgba(255,255,255,0.2)"/>';
  }
  
  const svg = `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="${color}"/>
      ${shape}
      <text x="100" y="110" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" 
            fill="${textColor}" text-anchor="middle" dominant-baseline="middle">
        ${identifier}
      </text>
    </svg>
  `.trim();
  
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

// Business names for variety
const BUSINESS_NAMES = [
  'Tech Solutions Inc',
  'Digital Marketing Pro',
  'Creative Design Studio',
  'Business Consulting Group',
  'E-Commerce Experts',
  'Web Development Co',
  'Marketing Masters',
  'Brand Identity Agency',
  'Social Media Hub',
  'Content Creation Lab',
  'SEO Specialists',
  'Graphic Design Pro',
  'Video Production Co',
  'Photography Studio',
  'Event Planning Services',
  'Fitness & Wellness',
  'Restaurant & Catering',
  'Real Estate Agency',
  'Legal Services',
  'Financial Advisors',
];

// Generate random business name
function getRandomBusinessName(index) {
  const baseName = BUSINESS_NAMES[index % BUSINESS_NAMES.length];
  return `${baseName} #${Math.floor(index / BUSINESS_NAMES.length) + 1}`;
}

// Generate logo - use purchase index (not square number!) so logos move visibly
function getLogoForPurchase(purchaseIndex, purchaseId) {
  // Use purchase index, not square number, so logos have unique identifiers
  // When shuffled, you'll see different letters/patterns move to different squares
  return generateUniqueLogo(purchaseIndex, purchaseId);
}

// Generate random email
function getRandomEmail(index) {
  return `test-business-${index}@example.com`;
}

// Generate square number - for 2000 logos, assign sequentially to ensure all squares are filled
function getSquareNumber(index, usedSquares) {
  // For full coverage, assign sequentially: 1, 2, 3, ..., 2000
  // This ensures every square gets a logo
  const square = index + 1;
  
  if (usedSquares.has(square)) {
    // If somehow already used, find next available
    for (let i = 1; i <= 2000; i++) {
      if (!usedSquares.has(i)) {
        usedSquares.add(i);
        return i;
      }
    }
  }
  
  usedSquares.add(square);
  return square;
}

async function bulkUploadTestLogos(count = 2000) {
  console.log(`🚀 Starting bulk upload of ${count} test logos...\n`);
  console.log(`📊 This will fill all ${count} squares across ${Math.ceil(count / 200)} pages\n`);
  
  const usedSquares = new Set();
  let batch = db.batch();
  let batchCount = 0;
  const BATCH_SIZE = 500; // Firestore batch limit
  
  try {
    for (let i = 0; i < count; i++) {
      const purchaseId = generateUniquePurchaseId();
      const squareNumber = getSquareNumber(i, usedSquares);
      const pageNumber = Math.floor((squareNumber - 1) / 200) + 1;
      
      const purchaseData = {
        purchaseId: purchaseId,
        status: 'active',
        businessName: getRandomBusinessName(i),
        logoData: getLogoForPurchase(i, purchaseId), // Use purchase index, not square number!
        dealLink: `https://example.com/business-${i + 1}`,
        contactEmail: getRandomEmail(i + 1),
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        amount: 10,
        duration: 30,
        transactionId: `test-txn-${Date.now()}-${i}`,
        purchaseDate: new Date().toISOString(),
        paymentStatus: 'paid',
        storageType: 'local',
        storagePath: null,
        squareNumber: squareNumber,
        pageNumber: pageNumber,
        clickCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      const docRef = db.collection('purchasedSquares').doc(purchaseId);
      batch.set(docRef, purchaseData);
      batchCount++;
      
      // Commit batch if it reaches the limit
      if (batchCount >= BATCH_SIZE) {
        console.log(`📤 Committing batch of ${batchCount} documents...`);
        await batch.commit();
        batchCount = 0;
        // Create new batch
        batch = db.batch();
      }
      
      // Progress indicator - more frequent for large batches
      if ((i + 1) % 50 === 0 || (i + 1) === count) {
        const percentage = Math.round(((i + 1) / count) * 100);
        console.log(`✅ Processed ${i + 1}/${count} logos (${percentage}%) - Square #${squareNumber}, Page ${pageNumber}`);
      }
    }
    
    // Commit remaining documents
    if (batchCount > 0) {
      console.log(`📤 Committing final batch of ${batchCount} documents...`);
      await batch.commit();
    }
    
    console.log(`\n✅ Successfully uploaded ${count} test logos to Firestore!`);
    console.log(`📊 Squares used: ${usedSquares.size}`);
    console.log(`📄 Pages covered: ${Math.ceil(Math.max(...Array.from(usedSquares)) / 200)}`);
    console.log(`📈 Squares per page: 200`);
    console.log(`\n🎯 All ${count} squares are now filled!`);
    console.log(`🔄 You can now test the shuffle functionality with a full grid!`);
    console.log(`⚡ This will test page loading performance and shuffle behavior under full load.`);
    
  } catch (error) {
    console.error('❌ Error uploading test logos:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

// Run the script - upload 2000 logos to fill all squares
bulkUploadTestLogos(2000)
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Check your website - all 2000 squares should have logos');
    console.log('   2. Test page navigation - try different pages');
    console.log('   3. Test shuffle - trigger manual shuffle from admin panel');
    console.log('   4. Monitor performance - check page load times');
    console.log('   5. Verify shuffle - logos should randomly rearrange');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

