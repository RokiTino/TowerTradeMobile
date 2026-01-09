# ⚡ Quick Fix: Google OAuth Configuration

## The Problem

Your screenshot shows an error in Google Cloud Console:
> "Invalid Origin: URIs must not contain a path or end with '/'"

## The Solution (2 Steps)

### Step 1: Fix "Authorized JavaScript Origins"

**Current (WRONG):**
```
URIs 2: https://ovfpvoxvciijexylyndg.supabase.co/auth/v1/callback/
```

**Action Required:**
1. Click the trash icon (🗑️) next to URIs 2
2. Click "Add URI" button
3. Enter EXACTLY: `https://ovfpvoxvciijexylyndg.supabase.co`
   - ⚠️ NO `/auth/v1/callback/` path
   - ⚠️ NO trailing slash `/`
   - ✅ Just the domain

**Result (CORRECT):**
```
URIs 1: https://towertrader-56483.firebaseapp.com
URIs 2: https://ovfpvoxvciijexylyndg.supabase.co
```

### Step 2: Verify "Authorized Redirect URIs"

Make sure these are listed (in this order):

```
URIs 1: https://towertrader-56483.firebaseapp.com/__/auth/handler
URIs 2: https://ovfpvoxvciijexylyndg.supabase.co/auth/v1/callback
URIs 3: http://localhost:8081/(auth)/callback
```

**Note:** If URIs 3 doesn't exist, add it by clicking "Add URI"

## What Changed in the Code

### ✅ Fixed the `redirectTo` parameter

**Before (WRONG):**
```typescript
// Was sending users to Supabase's callback URL
redirectTo = 'https://ovfpvoxvciijexylyndg.supabase.co/auth/v1/callback'
```

**After (CORRECT):**
```typescript
// Now sends users to YOUR app's callback page
redirectTo = 'http://localhost:8081/(auth)/callback'
```

### ✅ Created OAuth callback handler

New file: `app/(auth)/callback.tsx`
- Handles the redirect after Google authentication
- Shows AI Market Snapshot greeting
- Premium loading indicators with Tower Gold

### ✅ Enhanced error logging

Added detailed console logs at every step:
- Login screen: When user clicks button
- Auth service: OAuth flow initiation
- Supabase client: OAuth URL generation
- Error handling: Comprehensive error details

## How to Test

### 1. Save your Google Cloud Console changes

Click "Save" button after making the changes above

### 2. Restart the Metro bundler

```bash
npx expo start --clear
```

### 3. Test the flow

1. Open the app
2. Click "Continue with Google"
3. **Check the console logs** - you should see:
   ```
   🚀 Login Screen: Starting Google Sign-In flow...
   🔐 Starting Google Sign-In with Supabase...
   📋 OAuth Flow Configuration:
     → Platform: web
     → User redirectTo: http://localhost:8081/(auth)/callback
     → Google will send OAuth code to: https://ovfpvoxvciijexylyndg.supabase.co/auth/v1/callback
   ✅ Google OAuth initiated successfully
   ```
4. Authenticate with Google
5. You should be redirected back to your app
6. AI Market Snapshot should appear
7. Finally, you'll land on the Discovery feed

## If It Still Fails

### Check Console Logs

Open browser developer tools (F12) and look for:
- Red error messages
- The detailed logs showing exactly where it fails
- Any network errors (check Network tab)

### Common Issues

**"redirect_uri_mismatch"**
- Google doesn't have your callback URL in authorized list
- Double-check Step 2 above

**"OAuth flow initiated" but nothing happens**
- This means the OAuth URL was generated successfully
- Check if browser is blocking the popup/redirect
- Look for any browser console errors

**"Google Sign-In Failed" alert**
- Check the detailed logs in console
- The error message will tell you exactly what went wrong
- Common causes:
  - Supabase not initialized (check .env file)
  - Network error (check internet connection)
  - Invalid OAuth configuration (check Google Cloud Console)

## Environment Check

Verify these are in your `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=https://ovfpvoxvciijexylyndg.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_IlXQ-4LI8tFz17AYhiD0Zg_qK1MG4rQ
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=253066400729-ci4vlbmo1mthqbgd7lt202r42lda9jom.apps.googleusercontent.com
```

✅ All present and correct!

## What to Look For

After making these changes, when you click "Continue with Google":

1. ✅ Browser opens Google authentication page
2. ✅ You can select your Google account
3. ✅ After selection, you're redirected back to app
4. ✅ Premium loading screen with Tower Gold spinner
5. ✅ AI Market Snapshot greeting appears
6. ✅ You land on the Discovery feed

## Need More Help?

Check the logs in:
- Browser console (F12)
- Metro bundler output
- `workspace/.fastshot-logs/expo-dev-server.log`

The enhanced error messages will tell you exactly what's wrong!
