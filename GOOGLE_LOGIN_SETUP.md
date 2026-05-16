# Google Login Setup Guide for Divino

This guide walks you through setting up Google Sign-In for your Divino React Native app.

## Architecture Overview

The Google login flow now works like this:
1. **Frontend (React Native):** User taps "Sign in with Google"
2. **Firebase SDK:** Handles Google OAuth and returns credentials
3. **Firebase Auth:** Authenticates user and returns Firebase ID token
4. **Your Backend API:** Verifies Firebase token, creates/updates user in MongoDB, returns JWT
5. **Redux:** Stores JWT token and user data for authenticated requests

## Prerequisites

- A Google Developer Project
- Firebase Project setup (already created as "divino-db341")
- Your app's debug SHA-1 fingerprint (from Android/iOS build)

## Step 1: Get Your Debug SHA-1 Fingerprint

### For Android Debug Builds:

Run this command to get your debug keystore SHA-1:
```bash
cd android && ./gradlew signingReport
```

Look for output like:
```
Task :app:signingReport
...
Variant: debugAndroidTest
Config: debug
...
SHA-1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

**Copy this SHA-1 value** — you'll need it in Step 3.

### For iOS:

iOS uses automatic signing with Firebase. Get your iOS Bundle ID from `ios/Divino.xcodeproj` (it should be `com.divino` or similar).

## Step 2: Add Android OAuth Client to Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your **"divino-db341"** project
3. Go to **Project Settings** (⚙️ icon at top)
4. Select the **Apps** tab
5. Click your **Android app** (`com.divino`)
6. In the **SHA certificate fingerprints** section:
   - Click **Add Fingerprint**
   - Paste your debug SHA-1 from Step 1
   - Click **Save**

## Step 3: Enable Google Sign-In in Firebase

1. In Firebase Console, go to **Authentication**
2. Select the **Sign-in method** tab
3. Find **Google** in the list
4. Click on it to expand
5. Toggle **Enable** (turn it ON)
6. Select your **Support email** (any valid email)
7. Click **Save**

**Status should show green "ENABLED"**

## Step 4: Download Fresh google-services.json

1. In Firebase Console, go to **Project Settings** → **Apps** → **Android**
2. Click **google-services.json** download button
3. Replace the file at `android/app/google-services.json` with the downloaded version
4. **Important:** Do NOT commit this to git in production!

Now your `google-services.json` will have the OAuth client configuration needed.

## Step 5: Get Firebase Service Account Key (for Backend)

Your backend uses Firebase Admin SDK to verify Google ID tokens. You need to set up a service account:

1. In Firebase Console, go to **Project Settings** → **Service Accounts** tab
2. Click **Generate a new private key**
3. This downloads a JSON file with the service account credentials
4. **Keep this file secure!** Do not commit to git.
5. In your `.env` file, add:
   ```
   FIREBASE_SERVICE_ACCOUNT_KEY='<paste-entire-json-as-single-line>'
   ```

Or, if using environment file directly:
```bash
# .env
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"divino-db341",...}'
```

**Note:** The JSON must be on a single line or properly escaped in your `.env`.

## Step 6: Configure Google Sign-In on Frontend

The frontend already imports `@react-native-google-signin/google-signin`. You need to configure it with your Web Client ID:

### Get Your Web Client ID:

1. In Firebase Console, go to **Project Settings** → **Apps**
2. Create a new **Web** app if you haven't already (click "Add app" → "Web")
3. Copy the Web Client ID from the app credentials

### Configure in Your App:

The `Login.js` screen already configures GoogleSignin in its `useEffect`:

```javascript
GoogleSignin.configure({
  offlineAccess: false,
  forceCodeForRefreshToken: false,
});
```

**If you're still getting DEVELOPER_ERROR**, it means Firebase doesn't have your debug SHA-1. Go back to Step 2 and verify it was added correctly.

## Step 7: Install Dependencies

Since we added `firebase-admin` to `package.json`, install it:

```bash
npm install
```

## Step 8: Configure Backend Environment

Your backend needs MongoDB and Firebase credentials. Create/update `.env`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/divino

# JWT
JWT_SECRET=your-very-secret-jwt-key-change-this

# Firebase (from Step 5)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"divino-db341",...}'

# API Port
PORT=9000
```

## Step 9: Test Google Login

1. **Start your backend:**
   ```bash
   node server.js
   ```
   Should show: `✅ Firebase Admin initialized`

2. **Start Metro bundler:**
   ```bash
   npm start
   ```

3. **Run on Android:**
   ```bash
   npm run android
   ```

4. **On the login screen:**
   - Tap "Sign in with Google" button
   - You'll see Google account selection
   - Select an account
   - Should redirect to home screen (no login page)

5. **Check backend logs:**
   ```
   ✅ Firebase token verified: user@example.com
   ✅ New Google user created: user@example.com
   🟢 Google login successful: user@example.com
   ```

## Troubleshooting

### "DEVELOPER_ERROR" on Android
- ❌ **Problem:** Firebase doesn't recognize your debug build
- ✅ **Solution:** 
  1. Re-add your SHA-1 in Firebase (Step 2)
  2. Download fresh `google-services.json` (Step 4)
  3. Rebuild app: `npm run android`

### "Network request failed" on Google login
- ❌ **Problem:** Backend API is unreachable
- ✅ **Solution:**
  1. Is `node server.js` running? Start it
  2. On Android emulator, backend must be on port 9000
  3. Check `.env` has `PORT=9000`
  4. Run `adb reverse tcp:9000 tcp:9000` for physical devices

### "An account with this email already exists"
- ❌ **Problem:** User registered with email/password already exists
- ✅ **Solution:**
  1. This is expected if user has both email and Google accounts
  2. Fix: Create new Firebase test account or delete MongoDB user

### Firebase token verification fails
- ❌ **Problem:** Backend can't verify Firebase token
- ✅ **Solution:**
  1. Is `FIREBASE_SERVICE_ACCOUNT_KEY` in `.env`?
  2. Restart backend: `node server.js`
  3. Check JSON format (must be valid JSON on one line)

### User not appearing in MongoDB
- ❌ **Problem:** Google login completes but user not in database
- ✅ **Solution:**
  1. Check MongoDB is running: `mongod`
  2. Check `MONGODB_URI` in `.env` is correct
  3. Check backend logs for errors
  4. Verify backend response has `token` and `user`

## Production Deployment

When deploying to production:

1. **Add Production Keystore SHA-1** to Firebase:
   - Get SHA-1 from your production keystore
   - Add it in Firebase as a second fingerprint

2. **Use Production `google-services.json`**:
   - Download production version from Firebase
   - Use in production build

3. **Secure `.env` secrets**:
   - Use environment variables on your hosting platform
   - Never commit `.env` or service account keys to git
   - Use `.env.example` with placeholder values

4. **Update Backend URL**:
   - API layer auto-discovers dev server
   - Production: Set `NODE_ENV=production` to use production URLs

## API Endpoints

### Google Login Endpoint

**POST** `/api/auth/google-login`

**Request:**
```json
{
  "firebaseToken": "firebase-id-token-from-client",
  "email": "user@example.com",
  "name": "User Name",
  "photoURL": "https://...",
  "googleId": "firebase-uid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Google login successful",
  "token": "jwt-token-for-authenticated-requests",
  "user": {
    "id": "mongo-user-id",
    "email": "user@example.com",
    "name": "User Name",
    "photoURL": "https://...",
    "authProvider": "google",
    "createdAt": "2026-05-14T...",
    "updatedAt": "2026-05-14T..."
  }
}
```

## What Changed

- ✅ User model now supports Google authentication
- ✅ New `/api/auth/google-login` backend endpoint
- ✅ Frontend now sends Firebase token to backend after sign-in
- ✅ Backend verifies token and stores user in MongoDB
- ✅ Users get JWT token for authenticated API requests
- ✅ Google users can be migrated to email auth if needed
- ✅ Firebase Admin SDK verifies token authenticity

## Support

If you encounter issues:
1. Check backend logs: `node server.js` console output
2. Check frontend logs: React Native debugger
3. Verify Firebase project settings match code
4. Ensure all `.env` variables are set
5. Restart backend and frontend after `.env` changes
