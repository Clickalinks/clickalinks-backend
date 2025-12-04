# How to Get Your Firebase Service Account JSON File

## ❌ What `firebase.json` Is NOT

The `firebase.json` file in your `frontend/` folder is **NOT** your service account JSON file. It's just a configuration file for Firebase Hosting that tells Firebase:
- Where your built files are (`"public": "build"`)
- How to handle routes (rewrites)
- What headers to set (cache control, etc.)

## ✅ What You Need: Service Account JSON

Your **Firebase Service Account JSON** file contains:
- `"type": "service_account"`
- `"private_key"` (your credentials)
- `"client_email"` (service account email)
- `"project_id"` (your project ID)
- Other authentication details

## 📋 Step-by-Step: Get Your Service Account JSON

### Step 1: Go to Firebase Console
1. Open: https://console.firebase.google.com/
2. Sign in with your Google account

### Step 2: Select Your Project
1. Click on **clickalinks-frontend** project
2. (Or select it from the project dropdown if you have multiple projects)

### Step 3: Open Project Settings
1. Click the **⚙️ Settings** icon (gear) in the left sidebar
2. Click **Project settings**

### Step 4: Go to Service Accounts Tab
1. Click the **Service accounts** tab at the top
2. You'll see a section about "Firebase Admin SDK"

### Step 5: Generate New Private Key
1. Click the **Generate new private key** button
2. A warning popup will appear
3. Click **Generate key** to confirm

### Step 6: Download the JSON File
1. A JSON file will automatically download to your computer
2. The filename will be something like: `clickalinks-frontend-xxxxx-firebase-adminsdk-xxxxx-xxxxx.json`
3. **Save this file somewhere safe** (like your Downloads folder)

### Step 7: Open and Verify
1. Open the downloaded JSON file in a text editor
2. It should look like this:

```json
{
  "type": "service_account",
  "project_id": "clickalinks-frontend",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@clickalinks-frontend.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40clickalinks-frontend.iam.gserviceaccount.com"
}
```

## 🔐 Security Notes

⚠️ **IMPORTANT:**
- This file contains **sensitive credentials**
- **NEVER** commit it to Git
- **NEVER** share it publicly
- Keep it secure and private

## 📤 Next Steps: Add to Render.com

Once you have the JSON file:

1. **Option A: Use Base64 (Recommended)**
   - Go to: https://www.base64encode.org/
   - Paste the entire JSON content
   - Click "Encode"
   - Copy the Base64 string
   - Add to Render.com as `FIREBASE_SERVICE_ACCOUNT`

2. **Option B: Use Raw JSON**
   - Copy the entire JSON content
   - Make it one line (remove line breaks)
   - Add to Render.com as `FIREBASE_SERVICE_ACCOUNT`

See `docs/FIX_JSON_SYNTAX_ERROR.md` for detailed instructions!

