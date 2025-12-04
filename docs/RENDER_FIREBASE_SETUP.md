# Render.com Firebase Environment Variables Setup Guide

## ✅ Current Status
You have `FIREBASE_PROJECT_ID` set. Now you need to add Firebase credentials.

## 🎯 Option 1: FIREBASE_SERVICE_ACCOUNT (RECOMMENDED - Best for Render.com)

This is the **easiest and most reliable** method for Render.com.

### Step 1: Get Your Firebase Service Account JSON

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **clickalinks-frontend**
3. Click the **⚙️ Settings** icon (gear) → **Project settings**
4. Go to the **Service accounts** tab
5. Click **Generate new private key**
6. Click **Generate key** in the popup
7. A JSON file will download (e.g., `clickalinks-frontend-xxxxx.json`)

### Step 2: Copy the Entire JSON Content

1. Open the downloaded JSON file in a text editor (Notepad, VS Code, etc.)
2. **Select ALL** the content (Ctrl+A)
3. **Copy** it (Ctrl+C)

The JSON should look like this:
```json
{
  "type": "service_account",
  "project_id": "clickalinks-frontend",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

### Step 3: Add to Render.com

1. Go to [Render.com Dashboard](https://dashboard.render.com/)
2. Click on your backend service: **clickalinks-backend-2**
3. Go to **Environment** tab (left sidebar)
4. Click **Add Environment Variable**
5. Set:
   - **Key:** `FIREBASE_SERVICE_ACCOUNT`
   - **Value:** Paste the **ENTIRE JSON** (all on one line, or with proper formatting)
6. Click **Save Changes**

**⚠️ IMPORTANT:** 
- Paste the **ENTIRE JSON** including all curly braces `{}`
- Make sure it's all on **one line** (no line breaks) OR properly formatted JSON
- Don't add quotes around it - just paste the raw JSON

### Step 4: Verify

After saving, Render.com will automatically redeploy. Check the logs to see:
```
✅ Firebase Admin initialized from FIREBASE_SERVICE_ACCOUNT env var
🔑 Project ID: clickalinks-frontend
```

---

## 🎯 Option 2: Individual Environment Variables (Alternative)

If you prefer to use individual variables instead of the full JSON:

### Required Variables:

1. **FIREBASE_PROJECT_ID** ✅ (You already have this)
   - **Value:** `clickalinks-frontend`

2. **FIREBASE_CLIENT_EMAIL**
   - **How to get:** From your service account JSON file, copy the `client_email` value
   - **Example:** `firebase-adminsdk-xxxxx@clickalinks-frontend.iam.gserviceaccount.com`

3. **FIREBASE_PRIVATE_KEY**
   - **How to get:** From your service account JSON file, copy the `private_key` value
   - **IMPORTANT:** Keep the `\n` characters (they represent newlines)
   - **Example:** `-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n`

### Steps:

1. Open your downloaded service account JSON file
2. Find these values:
   - `project_id` → Already set as `FIREBASE_PROJECT_ID`
   - `client_email` → Copy this value
   - `private_key` → Copy this value (keep the `\n` characters!)

3. In Render.com → Your Service → Environment tab:
   - Add `FIREBASE_CLIENT_EMAIL` with the `client_email` value
   - Add `FIREBASE_PRIVATE_KEY` with the `private_key` value (keep `\n` characters!)

**⚠️ NOTE:** Option 1 (FIREBASE_SERVICE_ACCOUNT) is **much easier** and less error-prone!

---

## ✅ Verification Checklist

After adding the environment variables:

- [ ] Environment variable added to Render.com
- [ ] Render.com automatically redeployed
- [ ] Check logs for: `✅ Firebase Admin initialized`
- [ ] No errors about "private_key property"
- [ ] Backend starts successfully

---

## 🔍 Troubleshooting

### Error: "Service account object must contain a string 'private_key' property"

**Solution:** 
- Make sure you copied the **ENTIRE** JSON for `FIREBASE_SERVICE_ACCOUNT`
- Or if using individual vars, make sure `FIREBASE_PRIVATE_KEY` includes the `\n` characters

### Error: "Unable to detect a Project Id"

**Solution:**
- Make sure `FIREBASE_PROJECT_ID` is set to `clickalinks-frontend`
- Check for typos in the environment variable name

### Still having issues?

Use **Option 1 (FIREBASE_SERVICE_ACCOUNT)** - it's the most reliable method!

---

## 📝 Quick Reference

**Minimum Required (for Option 1):**
- `FIREBASE_PROJECT_ID` = `clickalinks-frontend` ✅ (You have this)
- `FIREBASE_SERVICE_ACCOUNT` = `{full JSON}` ← **Add this**

**That's it!** With these two variables, Firebase Admin will initialize correctly.

