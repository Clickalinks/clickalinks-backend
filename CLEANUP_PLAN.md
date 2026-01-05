# 🧹 Codebase Cleanup Plan

## Files to Remove

### Root Directory - Temporary/Debug Files
- All test-*.js files
- debug-server.js
- server.js (duplicate/backup)
- server.js.backup
- encode-json-to-base64.js
- verify-base64.js
- check-*.js files
- list-*.js files
- cron-shuffle.js
- asset-manifest.json

### Root Directory - Outdated Documentation
- Most .md files (keep only essential ones in docs/)
- All duplicate CORS fix docs
- All duplicate deployment docs
- All fix/urgent/temporary docs
- Debug guides
- Old setup guides

### Backend/scripts - Keep Only Essential
**Keep:**
- check-square-display.js (useful diagnostic)
- check-storage-file.js (useful diagnostic)
- createFreePromoCodes.js (admin utility)
- retry-emails.js (admin utility)

**Remove:**
- All fix-*.js (one-time fixes)
- All test-*.js
- All debug-*.js
- All add-test-*.js
- Old update scripts

### Frontend/public - Remove Test Files
- clean-firestore.html
- clear-storage.html
- delete-all-firestore.html
- delete-orphaned-ads.html
- manual-sync.html
- sync-to-firestore.html
- test-firestore.html
- LogoGridDemo.html (if exists in root)
- HowItWorksDemo.html (if exists in root)
- QUICK_TEST.html
- test-mfa-endpoint.html
- mfa-setup.html (can move to docs if needed)

### Duplicate Rule Files
- Keep only Backend/firestore.rules and Backend/storage.rules
- Remove all .txt duplicates in root

### Documentation Organization
**Keep in docs/:**
- Essential setup guides
- Security audit reports
- Deployment guides (final versions)

**Remove:**
- Temporary fix guides
- Debug guides
- Old/duplicate setup guides
- Test guides

