# 🧹 Cleanup Execution Plan

## Phase 1: Remove Temporary/Debug Files (Root)

### JavaScript Files to Remove:
- test-*.js (all test files)
- debug-server.js
- server.js (if duplicate)
- check-*.js
- list-*.js
- verify-*.js
- encode-*.js
- cron-shuffle.js

### HTML Demo Files:
- HowItWorksDemo.html
- LogoGridDemo.html
- QUICK_TEST.html
- test-mfa-endpoint.html
- mfa-setup.html (move to docs if needed)

### Asset Files:
- asset-manifest.json (generated file)

## Phase 2: Remove Outdated Documentation

Keep only these essential docs in root:
- README.md (create new one)
- LICENSE (if exists)

Move to docs/archive/:
- All CORS fix docs
- All deployment fix docs
- All temporary fix guides
- Debug guides
- Old setup guides

## Phase 3: Clean Backend Scripts

Keep only:
- check-square-display.js
- check-storage-file.js
- check-purchase-logo-url.js
- createFreePromoCodes.js
- retry-emails.js
- update-promo-expiration.js
- update-purchase-details.js
- update-purchase-url.js

Remove:
- All fix-*.js (one-time fixes)
- All test-*.js
- All debug-*.js
- All add-test-*.js
- Old bulk upload scripts

## Phase 4: Clean Frontend Public

Remove:
- clean-firestore.html
- clear-storage.html
- delete-all-firestore.html
- delete-orphaned-ads.html
- manual-sync.html
- sync-to-firestore.html
- test-firestore.html

Keep:
- index.html
- 404.html
- robots.txt
- sitemap.xml
- manifest.json
- site.webmanifest
- favicon files
- service-worker.js
- _redirects

## Phase 5: Remove Duplicate Rule Files

Keep only:
- Backend/firestore.rules
- Backend/storage.rules

Remove all .txt duplicates in root

## Phase 6: Organize Documentation

Create docs/ structure:
- docs/README.md (main docs index)
- docs/deployment/ (deployment guides)
- docs/security/ (security audit reports)
- docs/setup/ (setup guides)
- docs/archive/ (old/temporary docs)

