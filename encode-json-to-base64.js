/**
 * Encode Firebase Service Account JSON to Base64
 * 
 * This script reads your JSON file and outputs the Base64 encoded version
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║     JSON TO BASE64 ENCODER                               ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

try {
  // Try to read the Firebase service account JSON file
  const jsonPath = join(__dirname, 'Backend', 'firebase-service-account.json');
  console.log('🔍 Looking for JSON file at:', jsonPath);
  
  const jsonContent = readFileSync(jsonPath, 'utf-8');
  console.log('   ✓ File found and read successfully');
  
  // Parse JSON to validate it
  const json = JSON.parse(jsonContent);
  console.log('   ✓ JSON is valid');
  console.log('   • Project ID:', json.project_id);
  console.log('   • Client Email:', json.client_email);
  
  // Encode to Base64
  console.log('\n🔍 Encoding to Base64...');
  const base64String = Buffer.from(jsonContent, 'utf-8').toString('base64');
  
  console.log('   ✓ Encoding successful!\n');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     BASE64 ENCODED STRING (Copy this to Render.com)        ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  console.log(base64String);
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║     VERIFICATION INFO                                     ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  console.log('   • Base64 length:', base64String.length, 'characters');
  console.log('   • First 50 chars:', base64String.substring(0, 50));
  console.log('   • Last 50 chars:', base64String.substring(base64String.length - 50));
  console.log('\n✅ Copy the Base64 string above and paste it into Render.com');
  console.log('   Environment Variable: FIREBASE_SERVICE_ACCOUNT\n');
  
} catch (error) {
  console.log('❌ ERROR:', error.message);
  
  if (error.code === 'ENOENT') {
    console.log('\n💡 File not found. Make sure you have:');
    console.log('   Backend/firebase-service-account.json');
    console.log('\n   Or provide the JSON file path manually.\n');
  } else if (error.message.includes('JSON')) {
    console.log('\n💡 JSON file is invalid. Please check the file format.\n');
  }
  
  process.exit(1);
}

