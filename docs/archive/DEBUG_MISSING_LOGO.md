# 🔍 Debug: Logo Not Showing on Website

Quick troubleshooting guide for when logos upload to Storage but don't appear on the website.

---

## 🔧 Step 1: Run Debug Script

I've created a debug script to check your purchase data. Run it:

```bash
cd Backend
node scripts/debug-missing-logo.js
```

This will show you:
- ✅ If the purchase document exists
- ✅ If logo data/URLs are present
- ✅ If the file exists in Storage
- ✅ If the purchase is active/expired
- ✅ Why the logo might not be showing

---

## 🔍 Step 2: Common Issues & Fixes

### Issue 1: Purchase Document Missing Logo Data

**Symptoms:**
- Logo in Storage ✅
- Purchase document exists ✅
- But `logoData` or `logoURL` is missing ❌

**Fix:**
The purchase was saved but logo URL wasn't attached. Run this script:

```bash
cd Backend
node scripts/update-purchase-logo.js [PURCHASE_ID]
```

Or manually update in Firestore:
1. Go to Firebase Console → Firestore
2. Open `purchasedSquares` collection
3. Find your purchase document
4. Add `logoData` or `logoURL` field with the Storage URL

---

### Issue 2: Purchase Status Not "active"

**Symptoms:**
- Logo data present ✅
- But `status` is not "active" ❌

**Fix:**
Update the document in Firestore:
- Set `status: "active"`
- Set `paymentStatus: "paid"`

---

### Issue 3: Purchase Expired

**Symptoms:**
- Logo data present ✅
- Status is "active" ✅
- But `endDate` is in the past ❌

**Fix:**
Check if the campaign duration was set correctly. If it expired immediately, the purchase might have been created with wrong dates.

---

### Issue 4: Logo URL Format Issue

**Symptoms:**
- Logo data present ✅
- But URL format is wrong ❌

**Check:**
- `logoData` should be a full URL: `https://firebasestorage.googleapis.com/...`
- OR `storagePath` should be: `logos/purchase-xxx-xxx`

---

### Issue 5: Wrong Square Number

**Symptoms:**
- Logo shows in Storage ✅
- Purchase document exists ✅
- But square number doesn't match ❌

**Check:**
- Verify `squareNumber` in Firestore matches the square you selected
- Check `pageNumber` is correct

---

## 🔧 Step 3: Manual Check in Firebase Console

1. **Check Firestore:**
   - Go to: https://console.firebase.google.com/
   - Select project: `clickalinks-frontend`
   - Go to: **Firestore Database**
   - Open: `purchasedSquares` collection
   - Find your recent purchase
   - Check these fields:
     - ✅ `status`: Should be `"active"`
     - ✅ `paymentStatus`: Should be `"paid"`
     - ✅ `logoData` OR `logoURL`: Should have a URL
     - ✅ `storagePath`: Should have a path
     - ✅ `squareNumber`: Should match your selected square
     - ✅ `endDate`: Should be in the future

2. **Check Storage:**
   - Go to: **Storage**
   - Open: `logos/` folder
   - Verify your logo file exists
   - Check the file name matches `storagePath` in Firestore

3. **Check AdGrid Loading:**
   - Open browser console (F12)
   - Go to your website
   - Look for errors related to:
     - Image loading
     - Firestore queries
     - Logo URLs

---

## 🔧 Step 4: Quick Fix Script

If the purchase exists but logo URL is missing, use this:

```bash
cd Backend
node scripts/find-and-fix-missing-logo.js [PURCHASE_ID]
```

Or create the script to automatically fix it.

---

## 🔧 Step 5: Check Browser Console

1. Open your website
2. Press **F12** → **Console** tab
3. Look for errors like:
   - `Failed to load image`
   - `logoData is null`
   - `Purchase not found`
4. Check **Network** tab:
   - Look for image requests
   - Check if logo URLs are being requested
   - See if requests are failing (404, 403, etc.)

---

## 🔧 Step 6: Verify AdGrid is Loading Purchases

The AdGrid component loads purchases from Firestore. Check:

1. Go to browser console
2. Look for logs like:
   - `✅ Loaded X purchases from Firestore`
   - `✅ Purchase data for square X`
3. If no logs, the purchases might not be loading

---

## 🆘 Still Not Working?

Run the debug script and share the output. It will tell us exactly what's wrong:

```bash
cd Backend
node scripts/debug-missing-logo.js
```

Common outputs:
- **"File NOT found in Storage"** → Logo wasn't uploaded correctly
- **"Status: EXPIRED"** → Purchase expired immediately
- **"logoData: Missing"** → Logo URL wasn't saved to Firestore
- **"Status: inactive"** → Purchase wasn't marked as active

---

*Created: January 2026*

