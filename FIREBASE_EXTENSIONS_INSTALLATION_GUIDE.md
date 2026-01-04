# 🔧 Firebase Extensions Installation Guide - ClickaLinks

Complete step-by-step guide for installing 3 recommended Firebase extensions.

---

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ Firebase project: `clickalinks-frontend`
- ✅ Firestore Database enabled
- ✅ Firebase Storage enabled
- ✅ Admin access to Firebase Console
- ✅ Billing enabled (required for some extensions)

---

## 🖼️ Extension 1: Resize Images

**Purpose:** Automatically resize and optimize uploaded logos  
**Made by:** Firebase  
**Cost:** Free (uses Cloud Functions & Storage)

### Step 1: Navigate to Extensions

1. Go to: https://console.firebase.google.com/
2. Select your project: **clickalinks-frontend**
3. Click **Extensions** in the left sidebar
4. Click **Browse Extensions** (or **Explore Extensions**)

### Step 2: Find and Install

1. In the search bar, type: **"Resize Images"**
2. Click on **"Resize Images"** (Made by Firebase)
3. Click **"Install"** button

### Step 3: Configure Extension

You'll see a configuration screen. Fill in these values:

#### **Required Configuration:**

1. **Cloud Storage bucket for images:**
   - Value: `clickalinks-frontend.firebasestorage.app` (or your storage bucket name)
   - This is where your logos are stored

2. **Size of resized images:**
   - Value: `500x500`
   - This matches your logo requirement (500x500 pixels)

3. **Cloud Storage path for resized images:**
   - Value: `logos/resized`
   - This creates a separate folder for resized images

4. **Cloud Storage path for original images:**
   - Value: `logos`
   - This is your current logo storage path

5. **Delete original file:**
   - Value: **No** (keep original)
   - You may want to keep originals for future use

6. **Cloud Storage path for thumbnails:**
   - Value: `logos/thumbnails`
   - Optional: creates smaller thumbnails

7. **Size of thumbnails:**
   - Value: `200x200`
   - Optional: for faster loading

8. **Generate thumbnails:**
   - Value: **Yes** (recommended)
   - Helps with performance

#### **Advanced Settings (Optional):**

- **Convert image to preferred types:**
  - Leave default or set to: `webp` (for better compression)

- **Cloud Storage path for converted images:**
  - Value: `logos/converted`
  - Optional

### Step 4: Review and Install

1. Review all settings
2. Check the **"Billing"** section (should show free tier)
3. Click **"Install extension"**
4. Wait 2-3 minutes for installation

### Step 5: Verify Installation

1. Go to **Extensions** → **Installed**
2. You should see **"Resize Images"** with status **"Active"**
3. Test by uploading a new logo:
   - Upload a logo through your website
   - Check Firebase Storage:
     - Original: `logos/[filename]`
     - Resized: `logos/resized/[filename]` (500x500)
     - Thumbnail: `logos/thumbnails/[filename]` (200x200)

### ✅ What This Does:

- Automatically resizes all uploaded logos to 500x500px
- Creates 200x200px thumbnails for faster loading
- Keeps original files
- Optimizes images for web performance

---

## 💾 Extension 2: Back up Firestore to Storage

**Purpose:** Automatic daily backups of Firestore data  
**Made by:** htsuruo  
**Cost:** Free (uses Cloud Functions & Storage)

### Step 1: Navigate to Extensions

1. Go to: https://console.firebase.google.com/
2. Select your project: **clickalinks-frontend**
3. Click **Extensions** in the left sidebar
4. Click **Browse Extensions**

### Step 2: Find and Install

1. In the search bar, type: **"Back up Firestore to Storage"**
2. Click on **"Back up Firestore to Storage"** (Made by htsuruo)
3. Click **"Install"** button

### Step 3: Configure Extension

Fill in these configuration values:

#### **Required Configuration:**

1. **Cloud Storage bucket for backups:**
   - Value: `clickalinks-frontend.firebasestorage.app` (or your storage bucket)
   - This is where backups will be stored

2. **Cloud Storage path for backups:**
   - Value: `backups/firestore`
   - Creates organized backup folder

3. **Cloud Firestore collection IDs to back up:**
   - Value: `purchasedSquares,clickAnalytics,promoCodes`
   - These are your main collections
   - Separate multiple collections with commas

4. **Schedule (Cloud Scheduler):**
   - Value: `0 2 * * *` (2 AM daily)
   - Or choose: `0 0 * * *` (midnight daily)
   - Format: `minute hour day month day-of-week`

5. **Time zone:**
   - Value: `Europe/London` (or your timezone)
   - UK timezone for ClickaLinks

6. **Compress backup files:**
   - Value: **Yes** (recommended)
   - Saves storage space

#### **Advanced Settings (Optional):**

- **Delete backups older than X days:**
  - Value: `30` (keep 30 days of backups)
  - Adjust based on your needs

### Step 4: Review and Install

1. Review all settings
2. Check billing (should be free tier)
3. Click **"Install extension"**
4. Wait 2-3 minutes

### Step 5: Verify Installation

1. Go to **Extensions** → **Installed**
2. You should see **"Back up Firestore to Storage"** with status **"Active"**
3. Check Cloud Scheduler:
   - Go to: https://console.cloud.google.com/cloudscheduler
   - Select project: **clickalinks-frontend**
   - You should see a scheduled job for backups
4. Wait for first backup (or trigger manually):
   - Go to Cloud Scheduler
   - Click on the backup job
   - Click **"Run now"** to test
   - Check Storage: `backups/firestore/` should have backup files

### ✅ What This Does:

- Automatically backs up `purchasedSquares`, `clickAnalytics`, and `promoCodes` daily
- Stores backups in Firebase Storage
- Compresses files to save space
- Keeps backups for 30 days (configurable)
- Runs at 2 AM daily (configurable)

---

## 📊 Extension 3: Stream Firestore to BigQuery

**Purpose:** Real-time analytics and reporting  
**Made by:** Firebase  
**Cost:** Free tier available, then pay-per-use (BigQuery)

### Step 1: Enable BigQuery API

**IMPORTANT:** BigQuery must be enabled first!

1. Go to: https://console.cloud.google.com/
2. Select project: **clickalinks-frontend**
3. Go to **APIs & Services** → **Library**
4. Search for: **"BigQuery API"**
5. Click **"Enable"**
6. Wait for activation (1-2 minutes)

### Step 2: Navigate to Extensions

1. Go to: https://console.firebase.google.com/
2. Select your project: **clickalinks-frontend**
3. Click **Extensions** in the left sidebar
4. Click **Browse Extensions**

### Step 3: Find and Install

1. In the search bar, type: **"Stream Firestore to BigQuery"**
2. Click on **"Stream Firestore to BigQuery"** (Made by Firebase)
3. Click **"Install"** button

### Step 4: Configure Extension

Fill in these configuration values:

#### **Required Configuration:**

1. **Cloud Firestore collection path:**
   - Value: `purchasedSquares`
   - Start with your main collection
   - You can add more collections later

2. **BigQuery dataset location:**
   - Value: `europe-west2` (or your Firestore region)
   - Should match your Firestore location

3. **BigQuery dataset ID:**
   - Value: `clickalinks_analytics`
   - Creates a new dataset for analytics

4. **BigQuery table ID prefix:**
   - Value: `firestore_export`
   - Prefix for table names

5. **Use a wildcard to match subcollections:**
   - Value: **No** (unless you have subcollections)
   - Keep as "No" for now

#### **Advanced Settings (Optional):**

- **Time partition field:**
  - Leave default: `timestamp`
  - Helps with query performance

- **Clustering fields:**
  - Leave empty (or add: `squareNumber,pageNumber`)
  - Optional optimization

### Step 5: Review and Install

1. Review all settings
2. **Important:** Check billing - BigQuery has free tier (10 GB/month)
3. Click **"Install extension"**
4. Wait 3-5 minutes (longer than others)

### Step 6: Verify Installation

1. Go to **Extensions** → **Installed**
2. You should see **"Stream Firestore to BigQuery"** with status **"Active"**
3. Check BigQuery:
   - Go to: https://console.cloud.google.com/bigquery
   - Select project: **clickalinks-frontend**
   - You should see dataset: `clickalinks_analytics`
   - Inside: table `firestore_export_purchasedSquares`
4. Test with a new purchase:
   - Make a test purchase on your website
   - Wait 1-2 minutes
   - Check BigQuery table - new row should appear

### Step 7: Add More Collections (Optional)

To also stream `clickAnalytics`:

1. Go to **Extensions** → **Installed**
2. Click on **"Stream Firestore to BigQuery"**
3. Click **"Add another instance"** (or reinstall with multiple collections)
4. Configure for `clickAnalytics` collection

**OR** install a second instance:
- Collection: `clickAnalytics`
- Same dataset: `clickalinks_analytics`
- Different table prefix: `click_analytics_export`

### ✅ What This Does:

- Streams all Firestore writes to BigQuery in real-time
- Enables SQL queries on your data
- Creates analytics dashboards
- Tracks trends over time
- Free tier: 10 GB/month, then pay-per-use

---

## 📝 Post-Installation Checklist

After installing all 3 extensions:

### ✅ Verify All Extensions:

1. Go to **Firebase Console** → **Extensions** → **Installed**
2. All 3 should show status: **"Active"**
3. Check for any errors (red indicators)

### ✅ Test Each Extension:

1. **Resize Images:**
   - Upload a new logo
   - Check Storage: `logos/resized/` and `logos/thumbnails/`

2. **Back up Firestore:**
   - Go to Cloud Scheduler
   - Run backup job manually
   - Check Storage: `backups/firestore/`

3. **Stream to BigQuery:**
   - Make a test purchase
   - Wait 1-2 minutes
   - Check BigQuery: `clickalinks_analytics.firestore_export_purchasedSquares`

### ✅ Monitor Costs:

1. Go to: https://console.cloud.google.com/billing
2. Set up billing alerts (recommended)
3. Monitor usage:
   - **Resize Images:** Free tier (Cloud Functions)
   - **Backups:** Free tier (Storage)
   - **BigQuery:** 10 GB/month free, then $5/TB

---

## 🔧 Troubleshooting

### Extension Not Installing:

- **Check billing:** Some extensions require billing enabled
- **Check permissions:** Ensure you're project owner
- **Check API enablement:** BigQuery extension needs BigQuery API enabled

### Extension Shows Errors:

1. Click on the extension in **Installed** list
2. Check **"Logs"** tab for error messages
3. Common issues:
   - Missing permissions
   - Incorrect bucket names
   - API not enabled

### BigQuery Not Receiving Data:

1. Check extension logs
2. Verify collection path is correct
3. Wait 2-3 minutes (streaming has slight delay)
4. Check BigQuery dataset exists

### Backups Not Running:

1. Check Cloud Scheduler job exists
2. Verify schedule is correct
3. Check job logs for errors
4. Manually trigger job to test

---

## 📊 Usage Examples

### Query BigQuery Data:

Once data is streaming, you can run SQL queries:

```sql
-- Count purchases by day
SELECT 
  DATE(TIMESTAMP_MILLIS(timestamp)) as date,
  COUNT(*) as purchases
FROM `clickalinks-frontend.clickalinks_analytics.firestore_export_purchasedSquares`
GROUP BY date
ORDER BY date DESC;

-- Find most popular squares
SELECT 
  squareNumber,
  COUNT(*) as times_purchased
FROM `clickalinks-frontend.clickalinks_analytics.firestore_export_purchasedSquares`
GROUP BY squareNumber
ORDER BY times_purchased DESC
LIMIT 10;
```

### Access Backup Files:

1. Go to Firebase Storage
2. Navigate to: `backups/firestore/`
3. Download backup files (JSON format)
4. Restore if needed (manual process)

---

## 🎯 Next Steps

After installation:

1. **Monitor for 1 week** - Check all extensions are working
2. **Set up billing alerts** - Monitor BigQuery costs
3. **Create BigQuery dashboards** - Visualize your data
4. **Schedule regular backup reviews** - Verify backups are working

---

## 📞 Support

If you encounter issues:

1. Check extension logs in Firebase Console
2. Review Cloud Functions logs
3. Check Cloud Scheduler for backup jobs
4. Verify all APIs are enabled

---

*Last Updated: January 2026*

