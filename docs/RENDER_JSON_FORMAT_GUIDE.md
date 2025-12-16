# Render.com FIREBASE_SERVICE_ACCOUNT JSON Format Guide

## ⚠️ Common Issues

1. **"full JSON" is a placeholder** - You need the ACTUAL JSON content
2. **JSON formatting** - Must be properly formatted
3. **Special characters** - May need escaping in Render.com

## ✅ Correct Format

### Option 1: Single Line (RECOMMENDED for Render.com)

Paste the JSON as **one continuous line** (no line breaks):

```json
{"type":"service_account","project_id":"clickalinks-frontend","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
```

### Option 2: Escaped JSON String

If Render.com requires it as a string, wrap it in quotes and escape internal quotes:

```
"{""type"":""service_account"",""project_id"":""clickalinks-frontend"",...}"
```

**⚠️ But try Option 1 first!**

## 📋 Step-by-Step Instructions

### Step 1: Get Your JSON File

1. Go to Firebase Console → Your Project → Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file

### Step 2: Prepare the JSON

**Method A: Use Online Tool (Easiest)**
1. Open your JSON file
2. Go to: https://www.freeformatter.com/json-formatter.html
3. Paste your JSON
4. Click "Minify" (removes all line breaks)
5. Copy the result

**Method B: Manual (VS Code)**
1. Open JSON file in VS Code
2. Right-click → "Format Document" (to ensure valid JSON)
3. Select all (Ctrl+A)
4. Copy (Ctrl+C)
5. Paste into a text editor
6. Remove ALL line breaks (replace `\n` with nothing)
7. Copy the single-line result

### Step 3: Add to Render.com

1. Go to Render.com → Your Service → Environment
2. Find `FIREBASE_SERVICE_ACCOUNT`
3. Click the **eye icon** to reveal current value
4. Click **Edit** (or the pencil icon)
5. **Delete** the placeholder "full JSON"
6. **Paste** your single-line JSON
7. Click **Save Changes**

### Step 4: Verify JSON is Valid

The JSON should:
- Start with `{`
- End with `}`
- Contain `"type":"service_account"`
- Contain `"project_id":"clickalinks-frontend"`
- Contain `"private_key":"-----BEGIN PRIVATE KEY-----..."`
- Contain `"client_email":"..."`

## 🔍 Troubleshooting

### Still Failing? Try This:

1. **Check JSON Validity:**
   - Copy your JSON
   - Go to: https://jsonlint.com/
   - Paste and validate
   - Fix any errors

2. **Check for Hidden Characters:**
   - Make sure there are no extra spaces before/after
   - No quotes around the JSON (unless Render requires it)
   - No trailing commas

3. **Alternative: Use Individual Variables**

If JSON still doesn't work, use individual variables instead:

- `FIREBASE_PROJECT_ID` = `clickalinks-frontend` ✅ (you have this)
- `FIREBASE_CLIENT_EMAIL` = `firebase-adminsdk-xxxxx@clickalinks-frontend.iam.gserviceaccount.com`
- `FIREBASE_PRIVATE_KEY` = `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n`

**Note:** Keep the `\n` characters in the private key!

## ✅ What Success Looks Like

After adding the JSON correctly, check Render.com logs for:

```
✅ Firebase Admin initialized from FIREBASE_SERVICE_ACCOUNT env var
🔑 Project ID: clickalinks-frontend
✅ Firebase Admin initialized successfully
```

If you see errors, check the exact error message and we can troubleshoot further!

