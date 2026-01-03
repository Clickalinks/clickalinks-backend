/**
 * List All Storage Files
 * Lists all files in Firebase Storage logos folder to see recent uploads
 * Note: This uses Firebase Admin SDK which doesn't have direct Storage list API
 * This script will output instructions instead
 */

console.log('📋 To check Storage files manually:');
console.log('   1. Go to Firebase Console: https://console.firebase.google.com/');
console.log('   2. Select project: clickalinks-frontend');
console.log('   3. Go to Storage');
console.log('   4. Check the logos/ folder');
console.log('   5. Look for files uploaded in the last few minutes');
console.log('');
console.log('💡 The file name pattern is: purchase-{timestamp}-{random}-{timestamp}');
console.log('   Recent files will have timestamps close to now.');
console.log('');
console.log('📝 Once you find the Storage file:');
console.log('   1. Note the full file path (e.g., logos/purchase-...)');
console.log('   2. Tell me:');
console.log('      - What square number did you select?');
console.log('      - What business name did you enter?');
console.log('      - What is the Storage file name?');
console.log('   3. I can then create the Firestore document for you.');
