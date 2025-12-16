# Step-by-Step: Base64 Encode Your JSON

## 📋 Exact Steps Based on Your Screenshot

### Step 1: Paste Your JSON
1. Find the large text area labeled **"Type (or paste) here..."**
2. Click inside that text area
3. Paste your **ENTIRE JSON** file content (all 13 lines)
   - It should start with `{` and end with `}`

### Step 2: Check/Uncheck Boxes

**IMPORTANT - Set these correctly:**

✅ **"Encode each line separately"** - **UNCHECKED** (leave it unchecked)
- This should NOT be checked

✅ **"Split lines into 76 character wide chunks"** - **UNCHECKED** (leave it unchecked)
- This should NOT be checked

❌ **"Perform URL-safe encoding (uses Base64URL format)"** - **UNCHECK IT!**
- This is currently CHECKED in your screenshot
- **UNCHECK this box** - we need standard Base64, not URL-safe

### Step 3: Click Encode
1. Click the big green button: **"> ENCODE <"**
2. Wait a moment for encoding to complete

### Step 4: Copy the Result
1. Look at the area labeled **"Result goes here..."**
2. The Base64 encoded string will appear there
3. Click the **"Copy to clipboard"** button (has a clipboard icon)
4. Or manually select all the text and copy it (Ctrl+A, then Ctrl+C)

### Step 5: Add to Render.com
1. Go to Render.com → Your Service → Environment
2. Find `FIREBASE_SERVICE_ACCOUNT`
3. Click Edit
4. Paste the Base64 string
5. Save

## ⚠️ Important Settings Summary

| Setting | Value |
|---------|-------|
| **Destination character set** | UTF-8 (default is fine) |
| **Destination newline separator** | LF (Unix) (default is fine) |
| **Encode each line separately** | ❌ UNCHECKED |
| **Split lines into chunks** | ❌ UNCHECKED |
| **Perform URL-safe encoding** | ❌ **UNCHECK THIS!** |

## ✅ What the Result Should Look Like

After encoding, you'll get a long string like:
```
ewogICJ0eXBlIjogInNlcnZpY2VfYWNjb3VudCIsCiAgInByb2plY3RfaWQiOiAiY2xpY2thbGlua3MtZnJvbnRlbmQiLAogICJwcml2YXRlX2tleV9pZCI6ICJiOTJmZWMyOGVmYjk5NTE5ZmM1YmQ2Njk0YjA4MTFlODJiMTMzZTQ2IiwKICAicHJpdmF0ZV9rZXkiOiAiLS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tXG5NSUlFdlFJQkFEQU5CZ2txaGtpRzl3MEJBUUVGQUFTQ0JLY3dnZ1NqQWdFQUFvSUJBUUN5OTdNcTdJN251eGRTXG5vZS85OTYwSC9mdzhSZGU0M2VrdFBhcUVPTm0vZzl5Ynp1TkpVWUxjN01jbmhFeStsSkVXcmd6am1ESDA4NXZJXG5hNUd4ZVJldVJLQ09qZnEvSzZsT3RtczcyNHdCMXNxc3ZuUExyalZBRXhYZ0wzQ2c3SWl6KzVjdjJpeGZxYWkwXG5vQ250R1VlSTZPbVpvVmM2MWRlSmZOb28vZFp5QkpDaHNZZitYUnlpLzIxSlFrTUxSV2g0Rkhpb2ZlSmVxNFpNXG43OHA5TEFVdVpiZ21qbGNHL3FnaWFNU25UR2dPUFVoeU9zWXl4cFhpWWczOW5LNW9yaUo2UU4rblFwRml5UzM5XG51Y3h6Ly9tOEc2RVZ4aW0wMDdjVCtZdGhEUGlqWk40NmlKKzllb3BBeTgyOVVvRzkxcW1BbDJtRVdlTlljTWZkXG5lR1BHOWNkbkFnTUJBQUVDZ2dFQVVxT2FNZm5seXc5VEo2N3JHTVNqTzR1R1MzYWN0QnFVTDNYSUpTSHpPa0h6XG5QbWI4QU1FSXdtYjdWejM2Q2c2a0tHcmFQTVhzVzRXWnE2UXdORmtNSEVaSU5VdE9PN1EzaThja0lSR3h4cStlXG5Dc0l1eWlCNUtrc2wwTTFYSHBmYVQvR2UwRlBZSlp3NzhKdjhnQ1VxS1FnVHhnTUFPb1MvOEJhY3prellGdkZLXG4vRVRaR3RuUDhpR3NxK1NlQ3Y2eXAvWGovWUMwVWxubUErVFVJdEYrWnplbEpzemQzOCtCWm0wVitHU0lDTndpXG5iaFh3bVpUVHN5Q2V5TE56TWJGbkczaSt4TVZtc2h2T0c5d25yUGxNeHdhVmMvLzAzMlN4M3BzclZVdHY5cXZXXG5LRHg2bGdKZ1U5MFEyRWgyM1pYUmN0UHFGL2oxODh0WVpvVXZjSHV4VVFLQmdRRFpkRTlHanpmZVdsb3lVZjZRXG5qRWhsNmVsRWZwc0UvMGRleVZBWjRSa2xrdU54RkNPcFYyYys4RFRNbi9OKzI2aDRiV24rM21KVy9USWx6TkRmXG5ISDE2M1lNRTJ5eXg2OUZFR3BiUHByVHhNbFE4Ync3Y1NpVFNrbnBQNHl0NDdGL0VvZ2Rwa3AxUTA3R3B4ekFBXG44SDNvK2JaMzlOR1ovUmxqRUFISExxcXFrd0tCZ1FEU3NPNEMxalVzbGtvZGZ5NFhvL3ZVSDlHcldIVkQraFExXG5tLzh1RVB5TURrMmp5S1p1S3FYZHlPM3dLbk1tQnJXS0xQcFhzK2RXNTFEelM0OVRWd3dFdmxPdnZpQTdWcXA5XG5xT3FlSFRvSUxoNGRqWlJiaEFPeVI0N1FzaFlKMHJOeFBDeEJPbkEyZzV3QkI0aURzZUdyQkhrZkV0QnQ3ZGtnXG5WVGxoN0VUd1hRS0JnR00wdi9JVjVzd25kbHpjc1lHcXJtRG9iVWFWYUEzSWxQdjJaZmZZalF0cVR4OUlxOWhYXG5Dc0JaQUEyV3I1VGhpNk9kYnkwYXNjeXo2TXY3L0JLOXdiVnJGNW9Ba0F4LzVGSG91NEx5c0R3VjFQNVpRSE5aXG4xQ0RKT01uM2Z0N0ZJQS9xUisxdk9Sd2w2RGpucWN2VDYrMTg5elVVMlFjaXhCRkF2VDdzMkduSEFvR0JBTTN6XG4xQVdEM1NERG5KbHUyK0NTRkxZTGtJcGRBdXc3Qmd4TmZFbE1vNEpJN1E0Z01zaFgraUZ0cTJGc0xYbExiNlF0XG5TVjMzNXpqbER4VjBsQnNVYVJRdDlHSkRpUUJZUEhwdlowQytNeDhSN2JCWDJHRUpFQS95c1NGQ0pCYmdGemFtXG5hbUFzdnNvYkpxRSsrdXc1TXU1WWhnbWcrNHVweCtnNlJzaDVDLzZsQW9HQUx1bWNtV0N4a3A0Ymx6cTNZQmhrXG40RmkrV0FkT3FDT3ptM3ZIUVVOKzR6Y1NrUVVmcTFUN1lFbm1kTU1NRUUvWmhyS2VKUnluZlpVNnZhNXJoanlLXG5tVkh2RWUzZkNQVkNsdEp6MTcwb3A5UHk4VUpwRjhVWlg4QUJpM2tTLzhjRk5PQkhWL3pyM0NCakxnTEhna0ZPXG5XNkFpRFptYzBQNjhDdDB5Z2NRdm1oOD1cbi0tLS0tRU5EIFBSSVZBVEUgS0VZLS0tLS1cbiIsCiAgImNsaWVudF9lbWFpbCI6ICJmaXJlYmFzZS1hZG1pbnNkay1mYnN2Y0BjbGlja2FsaW5rcy1mcm9udGVuZC5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsCiAgImNsaWVudF9pZCI6ICIxMDQyNTk0NjYxNTk1NjYxNzA1OTkiLAogICJhdXRoX3VyaSI6ICJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20vby9vYXV0aDIvYXV0aCIsCiAgInRva2VuX3VyaSI6ICJodHRwczovL29hdXRoMi5nb29nbGVhcGlzLmNvbS90b2tlbiIsCiAgImF1dGhfcHJvdmlkZXJfeDUwOV9jZXJ0X3VybCI6ICJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9vYXV0aDIvdjEvY2VydHMiLAogICJjbGllbnRfeDUwOV9jZXJ0X3VybCI6ICJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9yb2JvdC92MS9tZXRhZGF0YS94NTA5L2ZpcmViYXNlLWFkbWluc2RrLWZic3ZjJTQwY2xpY2thbGlua3MtZnJvbnRlbmQuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLAogICJ1bml2ZXJzZV9kb21haW4iOiAiZ29vZ2xlYXBpcy5jb20iCn0K
```

This is a single continuous line (no line breaks).

## 🎯 Quick Checklist

- [ ] Paste JSON in "Type (or paste) here..." area
- [ ] **UNCHECK** "Perform URL-safe encoding" 
- [ ] Leave other checkboxes **UNCHECKED**
- [ ] Click "> ENCODE <" button
- [ ] Copy result from "Result goes here..." area
- [ ] Paste into Render.com

That's it!

