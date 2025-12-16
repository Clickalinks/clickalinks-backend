/**
 * Verify Base64 Encoded Firebase Service Account JSON
 * 
 * Paste your Base64 string from Render.com here to verify it decodes correctly
 */

// PASTE YOUR BASE64 STRING FROM RENDER.COM HERE:
const base64String = `IHsKICAidHlwZSI6ICJzZXJ2aWNlX2FjY291bnQiLAogICJwcm9qZWN0X2lkIjogImNsaWNrYWxpbmtzLWZyb250ZW5kIiwKICAicHJpdmF0ZV9rZXlfaWQiOiAiZDRkZjVlZWVlNGUwMGNmZDc3YjRiMjc3YWYxZDE5OTI5YjYxMTkxNCIsCiAgInByaXZhdGVfa2V5IjogIi0tLS0tQkVHSU4gUFJJVkFURSBLRVktLS0tLVxuTUlJRXZRSUJBREFOQmdrcWhraUc5dzBCQVFFRkFBU0NCS2N3Z2dTakFnRUFBb0lCQVFDc1luSTdaZ3VDTGZXZlxudVlIZ0JEVTZNb04reGo5TmdYQytWWXQ4dkV4MjRmeGFjL1M2S3ExVTEzMEdVK29ZWklmR2t3NmZGYndva2NnWlxuVTlaV3IwYlpvcGtXOGowVkVvYlNRTEgzOVhYZDBZN016MGkycDlkdlhLRWczcCs1aGpDeURLZ3M2dVM5bXlhVlxuVStFaDhxaHlmUU5TSjdwT2lBTHA0WkhCbElCaHhZeFFIUWNTYnF5Y0plZVY3VkJQa2htc21ETkQrYWRlWHhZWVxuYTlHTm80eUR2NEs1K0JYdjBTSkFtMGE2bmVRUlhyYXEzUzUrNW50SUhxWUZYbG1CYzd6RHdBeEk3cG0vWW1yaFxueWcxKzh6elRDMThENGc1ZXZzNjRpK1hLSndlWTlzOStwUVhPakdoLzZyL0twcC9ydTVoaE1qaHk4dzZuOTh1MVxueE4yMlRBT3RBZ01CQUFFQ2dnRUFCaE5kaEZOc2toVFlSSWk2RjV1cEJwaytMT0NFTXZ2emJjOC90ZENWMUt0OVxuV2ZESlRpc2FrSDdISk1zZUEraG9mVlZmTXJpR09RWFRxc293MHBMN1BuTnVlREpuSXhBcFEvZ2lHRTVaN2t5b1xuVkV2MVVQUVVjZWt1c3FVTFlITm0wYUpaa1ErMi85UnhPb1VmZVFpcVFETEF4R0NyRTlaK1hTRGxUV1hVVlRNZFxua0lvU1dyOXAzZE1hNm9nN0ROSnlGMTRUaHZlU3ROeW5TTXkzVG5MUEVxYU0xMWNKNCt4SGx3SEJoamlobFpLcFxuajVNQ1c1RjRzRUt2K1FiVkZBR0JxcUE0Y2tOaFRoc2krSEdQUWc1YU5BYkdzTXVTc05pd2lGQmVYMFBNVFZpb1xuS3d3YXRaTUpXNjVJNkM1RExuZWRjYzlOUXdFZnhOQWZMdyszQy9jdFlRS0JnUURmaUpRcllEWFBWVng2c3RyY1xuVG1Ga0FXQ1VZclNIdnoyS2ZYdTZWeXJ4NG9LVkVnRUw3K0p2Sk9RNlV1QTkxN3RiUjZ2OCtKVGYwU3Z1bEdqbVxuNndyaFg2TjdaS2JXR01kZlRadzhqUWtCT3JiVEtXcUh1NjFKOUdBcW1waWF2TERYZUVuU0ZDdDJuUkJaQ25uaVxuV3RzYXZDNGYrWFlJc3c1OU1kbzRxVjZsMFFLQmdRREZiQXdoVmhMa2FzcVpiUGRGcHpiLzZMV3FRUFlHMXZmYlxuV2x4T0RqN050VzYxNjZpb0I2S0FreUl1WUpmdTN0SjJybFBWNVc0bmxZaFpUYzluRkQrTnMrS1g5OXgwVERZYlxuYXkvVFk0ODJVMWN1b3hQdGc5MUxQcSs2YWVQR21VTW8xMjBnejhkWFhVU2ZhRWt2REtSSVhLYy9wL25YODFXOFxuZWM0bU9NOUxIUUtCZ0NBYU9VMVJiK2pxMVhFNXBuemxOTTlyOHpiY1Joa0l1Z25kbzV0TFVYdVRrRFZnZEk0R1xuVVhxc3phb2lwTm04MWNkeUw1MFJCakJ1bGVTWm84Y21FbFh6cWtMYVhhdDV1NGhRV1JQSkhYWHp2TFh1eU1IZFxuampHRXl4clRRUDlZQWYydjVNb3E0Mk1SZzN1R0thTDhjV01SaTM1RUVWT0dnNW92UXF2SWh6TkJBb0dBSmhMTFxuV0JhQWVEcThMZENjODNybkdYMW9vNWY1bXFJVWxPSWRVUlJnT2szV054Rm1xbGttbHNOSllVWlJwc2lrTUMwNFxuajlTNlpMbnEzTVlyeklaVUoyRGN2MUFXM1ByaHFISUlmQzBFTG9idUZsbHUrMnhsM2lBTnhkYXNEZDM2M01LSFxuRWovZ0F0SkM3TGN3L2ZqaktlMXNkOU5PVkw1aDk0SktKb2JvTzJVQ2dZRUFwcG96bUhIZEN4V2FUV0VmelFQbFxuc3BkcGxLVkVVQ20wWEdabkhPdGl5dklTMWw1cndVN3lON3ZqbUd2NzI0eFladitBU3dUVTdNMlVYbUs2TlhBS1xuRHV4VjBTOEs2NjFBdDFpcHRrRUJqbXFBU2ZybEd6a1RGQ3RLdGNBcG1ZWWZISGpjWGdxSUZpNFFDTjk0RStDQVxuTHRlUmlZVEw3VHNhR2ZBWDErbkQ2Ync9XG4tLS0tLUVORCBQUklWQVRFIEtFWS0tLS0tXG4iLAogICJjbGllbnRfZW1haWwiOiAiZmlyZWJhc2UtYWRtaW5zZGstZmJzdmNAY2xpY2thbGlua3MtZnJvbnRlbmQuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLAogICJjbGllbnRfaWQiOiAiMTA0MjU5NDY2MTU5NTY2MTcwNTk5IiwKICAiYXV0aF91cmkiOiAiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tL28vb2F1dGgyL2F1dGgiLAogICJ0b2tlbl91cmkiOiAiaHR0cHM6Ly9vYXV0aDIuZ29vZ2xlYXBpcy5jb20vdG9rZW4iLAogICJhdXRoX3Byb3ZpZGVyX3g1MDlfY2VydF91cmwiOiAiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vb2F1dGgyL3YxL2NlcnRzIiwKICAiY2xpZW50X3g1MDlfY2VydF91cmwiOiAiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vcm9ib3QvdjEvbWV0YWRhdGEveDUwOS9maXJlYmFzZS1hZG1pbnNkay1mYnN2YyU0MGNsaWNrYWxpbmtzLWZyb250ZW5kLmlhbS5nc2VydmljZWFjY291bnQuY29tIiwKICAidW5pdmVyc2VfZG9tYWluIjogImdvb2dsZWFwaXMuY29tIgp9`;

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║     BASE64 VERIFICATION TOOL                            ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

// Check if placeholder is still there
if (base64String === 'PASTE_YOUR_BASE64_STRING_HERE' || base64String.trim().length === 0) {
  console.log('❌ Please paste your Base64 string from Render.com into this file');
  console.log('   Replace PASTE_YOUR_BASE64_STRING_HERE with your actual Base64 string\n');
  process.exit(1);
}

try {
  console.log('🔍 Checking Base64 string...');
  console.log('   Length:', base64String.length, 'characters');
  console.log('   First 50 chars:', base64String.substring(0, 50));
  console.log('   Last 50 chars:', base64String.substring(base64String.length - 50));
  
  // Check if it contains invalid characters
  const invalidChars = base64String.match(/[^A-Za-z0-9+/=]/g);
  if (invalidChars) {
    console.log('\n❌ ERROR: Base64 string contains invalid characters!');
    console.log('   Invalid chars found:', [...new Set(invalidChars)].join(', '));
    console.log('   Base64 should only contain: A-Z, a-z, 0-9, +, /, =');
    process.exit(1);
  }
  
  // Check if it starts with JSON (shouldn't)
  if (base64String.startsWith('{') || base64String.startsWith('[')) {
    console.log('\n⚠️  WARNING: String starts with { or [');
    console.log('   This looks like raw JSON, not Base64!');
    console.log('   You need to encode it to Base64 first.\n');
  } else {
    console.log('   ✓ Does NOT start with { or [ (good for Base64)');
  }
  
  console.log('\n🔍 Attempting Base64 decode...');
  const decoded = Buffer.from(base64String, 'base64').toString('utf-8');
  
  console.log('   ✓ Decode successful!');
  console.log('   Decoded length:', decoded.length, 'characters');
  console.log('   Decoded first 100 chars:', decoded.substring(0, 100));
  
  // Check if decoded result is JSON
  if (decoded.trim().startsWith('{') || decoded.trim().startsWith('[')) {
    console.log('   ✓ Decoded result starts with { or [ (looks like JSON)');
    
    console.log('\n🔍 Attempting JSON parse...');
    const json = JSON.parse(decoded);
    
    console.log('   ✓ JSON parse successful!');
    console.log('\n✅ VERIFICATION SUCCESSFUL!\n');
    console.log('📋 Decoded JSON Details:');
    console.log('   • type:', json.type);
    console.log('   • project_id:', json.project_id);
    console.log('   • client_email:', json.client_email);
    console.log('   • private_key:', json.private_key ? 'Present ✓' : 'Missing ❌');
    console.log('   • private_key_id:', json.private_key_id);
    
    if (!json.private_key || !json.client_email || !json.project_id) {
      console.log('\n❌ ERROR: Missing required fields!');
      console.log('   Required: private_key, client_email, project_id');
      process.exit(1);
    }
    
    console.log('\n✅ All required fields present!');
    console.log('✅ Your Base64 string is CORRECT and ready to use!\n');
    
  } else {
    console.log('\n❌ ERROR: Decoded result does NOT look like JSON!');
    console.log('   Decoded result should start with { or [');
    process.exit(1);
  }
  
} catch (error) {
  console.log('\n❌ ERROR:', error.message);
  
  if (error.message.includes('Invalid character')) {
    console.log('\n💡 Tip: Make sure you copied the ENTIRE Base64 string');
    console.log('   Base64 strings can be very long (3000+ characters)');
  } else if (error.message.includes('Unexpected token')) {
    console.log('\n💡 Tip: The Base64 string might be corrupted');
    console.log('   Try re-encoding your JSON file');
  }
  
  process.exit(1);
}

