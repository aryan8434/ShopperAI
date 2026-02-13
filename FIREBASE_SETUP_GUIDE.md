# Firebase Setup Guide - Fix auth/configuration-not-found Error

## Problem

You're seeing the error: **auth/configuration-not-found**

This error occurs when Firebase authentication is not properly configured in your Firebase console.

## Solution Steps

### Step 1: Verify Firebase Project Exists

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **shopper-40b0f**
3. You should see your project dashboard

### Step 2: Enable Authentication Methods

1. In Firebase Console, go to **Authentication** (left sidebar)
2. Click on the **Sign-in method** tab
3. Enable these providers:
   - **Email/Password**: Click and toggle ON
   - **Google**:
     - Click on Google provider
     - Toggle ON
     - Select your project from dropdown
     - Add an email address for support
     - Save

### Step 3: Configure OAuth Redirect URLs (for Google Sign-in)

1. Go to **Authentication** → **Settings** tab (gear icon)
2. Scroll to **Authorized domains**
3. Add these domains:
   - `localhost` (for local development)
   - `127.0.0.1` (for local testing)
   - Your production domain (when deployed)

### Step 4: Enable Firestore Database

1. In Firebase Console, go to **Firestore Database** (left sidebar)
2. Click **Create Database**
3. Choose **Start in: Test Mode** (for development)
4. Click **Next** → Choose region → **Create**

### Step 5: Verify Your Config is Correct

Your current config in `src/firebase.js` is:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBwpngJkBSH3frU6oNSRmpJCgptiyapPgc",
  authDomain: "shopper-40b0f.firebaseapp.com",
  projectId: "shopper-40b0f",
  storageBucket: "shopper-40b0f.firebasestorage.app",
  messagingSenderId: "416148063018",
  appId: "1:416148063018:web:a97ae350f29f0c1df29453",
  measurementId: "G-K93EJQMY75",
};
```

✅ This config looks correct!

### Step 6: Test Your Setup

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Go to http://localhost:5174/signup

3. Try creating an account with:
   - Name: Test User
   - Email: test@example.com
   - Password: test@123

4. If it works, you'll be redirected to home page and logged in

### Step 7: Check Browser Console for Errors

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for any Firebase-related errors
4. Post any error messages if still having issues

## Still Having Issues?

If you still see the error after following these steps:

1. **Clear browser cache**:
   - Press `Ctrl + Shift + Delete`
   - Clear "All time" data
   - Reload the page

2. **Check Firebase Console**:
   - Make sure Email/Password authentication is enabled
   - Make sure Google OAuth is enabled (if using Google login)
   - Verify authDomain matches exactly

3. **Restart dev server**:

   ```bash
   npm run dev
   ```

4. **Try in Incognito Mode**:
   - Open new incognito window
   - Go to http://localhost:5174
   - Try signing up again

## Firebase Firestore Rules (for Development)

Your current test mode rules allow anyone to read/write. For production, update to:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```

## Success Signs ✅

When everything is working correctly, you should:

1. ✅ Create account successfully
2. ✅ Login with email/password works
3. ✅ Google Sign-in works (if enabled)
4. ✅ No auth errors in console
5. ✅ Can access /profile (protected route)
6. ✅ Add to Cart button works when logged in
