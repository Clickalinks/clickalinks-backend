// Cleanup script to identify files to remove
// Run: node Backend/scripts/cleanup-project.js

import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const rootDir = join(process.cwd(), '..');

const filesToRemove = {
  root: [],
  backendScripts: [],
  frontendPublic: [],
  docs: []
};

async function scanDirectory(dir, relativePath = '') {
  try {
    const entries = await readdir(dir);
    
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const relPath = join(relativePath, entry);
      const stats = await stat(fullPath);
      
      if (stats.isDirectory()) {
        // Skip node_modules, .git, etc.
        if (['node_modules', '.git', 'build', 'dist', '.next', '.firebase'].includes(entry)) {
          continue;
        }
        await scanDirectory(fullPath, relPath);
      } else {
        // Identify files to remove
        if (relativePath === '') {
          // Root directory files
          if (entry.match(/^(test-|debug-|check-|list-|verify-|encode-)/) && entry.endsWith('.js')) {
            filesToRemove.root.push(relPath);
          }
          if (entry === 'server.js' || entry === 'server.js.backup' || entry === 'debug-server.js') {
            filesToRemove.root.push(relPath);
          }
          if (entry === 'asset-manifest.json' || entry === 'cron-shuffle.js') {
            filesToRemove.root.push(relPath);
          }
          if (entry.match(/\.(html|md)$/) && !['README.md'].includes(entry)) {
            // Will categorize MD files separately
            if (entry.match(/(QUICK_|TEST_|DEBUG_|FIX_|URGENT_|CORS_|DEPLOYMENT_)/)) {
              filesToRemove.root.push(relPath);
            }
          }
        } else if (relativePath.startsWith('Backend/scripts')) {
          // Backend scripts
          if (entry.match(/^(test-|debug-|fix-|add-test-)/) && entry.endsWith('.js')) {
            if (!['fix-square-5-storage-path.js'].includes(entry)) {
              filesToRemove.backendScripts.push(relPath);
            }
          }
        } else if (relativePath.startsWith('frontend/public')) {
          // Frontend public files
          if (entry.match(/(test-|clean-|clear-|delete-|manual-|sync-|demo)/i) && entry.endsWith('.html')) {
            if (entry !== 'index.html') {
              filesToRemove.frontendPublic.push(relPath);
            }
          }
        }
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }
}

async function main() {
  console.log('🔍 Scanning project for cleanup...\n');
  
  await scanDirectory(rootDir);
  
  console.log('📋 Files to Remove:\n');
  
  if (filesToRemove.root.length > 0) {
    console.log('📁 Root Directory:');
    filesToRemove.root.forEach(f => console.log(`   - ${f}`));
    console.log('');
  }
  
  if (filesToRemove.backendScripts.length > 0) {
    console.log('📁 Backend Scripts:');
    filesToRemove.backendScripts.forEach(f => console.log(`   - ${f}`));
    console.log('');
  }
  
  if (filesToRemove.frontendPublic.length > 0) {
    console.log('📁 Frontend Public:');
    filesToRemove.frontendPublic.forEach(f => console.log(`   - ${f}`));
    console.log('');
  }
  
  const total = filesToRemove.root.length + filesToRemove.backendScripts.length + filesToRemove.frontendPublic.length;
  console.log(`\n✅ Total files to remove: ${total}`);
}

main().catch(console.error);

