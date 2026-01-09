# Google OAuth Configuration Guide

## Critical Understanding

There are **TWO different URLs** involved in OAuth:

1. **Supabase Callback URL**: Where Google sends the OAuth authorization code
   - This is configured in **Google Cloud Console**
   - Format: `https://ovfpvoxvciijexylyndg.supabase.co/auth/v1/callback`

2. **App Redirect URL** (`redirectTo`): Where the user is redirected after authentication
   - This is configured in **your app's code**
   - For Web: Your app's URL (e.g., `http://localhost:8081/(auth)/callback`)
   - For Mobile: Deep link (e.g., `towertrade://`)

## Google Cloud Console Configuration

### Step 1: Authorized JavaScript Origins

Add **ONLY THE DOMAIN** (no paths, no trailing slashes):

```
https://ovfpvoxvciijexylyndg.supabase.co
```

**❌ WRONG:**
- `https://ovfpvoxvciijexylyndg.supabase.co/auth/v1/callback` (has path)
- `https://ovfpvoxvciijexylyndg.supabase.co/` (has trailing slash)

### Step 2: Authorized Redirect URIs

Add these URLs (in order of priority):

1. **Supabase Callback** (for OAuth code exchange):
   ```
   https://ovfpvoxvciijexylyndg.supabase.co/auth/v1/callback
   ```

2. **Local Development** (optional, for testing):
   ```
   http://localhost:8081/(auth)/callback
   ```

3. **Production Web** (when deployed):
   ```
   https://yourdomain.com/(auth)/callback
   ```

**Note**: Remove any Firebase URLs (e.g., `https://towertrader-56483.firebaseapp.com`)

## How OAuth Flow Works

### For Web:

1. User clicks "Sign in with Google"
2. App generates OAuth URL: `https://accounts.google.com/o/oauth2/v2/auth?...`
3. User authenticates with Google
4. **Google redirects to**: `https://ovfpvoxvciijexylyndg.supabase.co/auth/v1/callback?code=...`
5. **Supabase processes the OAuth code** and establishes session
6. **Supabase redirects user to**: `http://localhost:8081/(auth)/callback` (your app)
7. Your app's callback page picks up the session
8. Shows AI Market Snapshot
9. Redirects to main app

### For Mobile:

1. User clicks "Sign in with Google"
2. App opens system browser with OAuth URL
3. User authenticates with Google
4. **Google redirects to**: `https://ovfpvoxvciijexylyndg.supabase.co/auth/v1/callback?code=...`
5. **Supabase processes the OAuth code** and establishes session
6. **Supabase redirects to**: `towertrade://` (deep link)
7. Deep link triggers app to reopen
8. App picks up the session
9. Shows AI Market Snapshot
10. Redirects to main app

## Code Changes Summary

### Fixed: `services/supabase/SupabaseClient.ts`

```typescript
// ❌ BEFORE (WRONG)
if (Platform.OS === 'web') {
  redirectTo = supabaseCallbackUrl; // This is wrong!
}

// ✅ AFTER (CORRECT)
if (Platform.OS === 'web') {
  redirectTo = `${window.location.origin}/(auth)/callback`; // User's destination
}
```

### Enhanced: `app/(auth)/login.tsx`

- Added comprehensive error logging
- Enhanced error messages with specific guidance
- All errors now use `ElegantAlert` component
- Proper state management for loading indicators

### New: `app/(auth)/callback.tsx`

- Handles OAuth redirect after authentication
- Shows premium loading state
- Triggers AI Market Snapshot greeting
- Redirects to main app

## Troubleshooting

### Error: "Invalid Origin: URIs must not contain a path or end with '/'"

**Cause**: Supabase callback URL added to "Authorized JavaScript origins"

**Fix**: In Google Cloud Console:
1. Remove `https://ovfpvoxvciijexylyndg.supabase.co/auth/v1/callback` from JavaScript origins
2. Add `https://ovfpvoxvciijexylyndg.supabase.co` (domain only)

### Error: "redirect_uri_mismatch"

**Cause**: The redirect URI is not in Google's authorized list

**Fix**: In Google Cloud Console, add to "Authorized redirect URIs":
- `https://ovfpvoxvciijexylyndg.supabase.co/auth/v1/callback`
- `http://localhost:8081/(auth)/callback` (for development)

### Error: "Google Sign-In Failed"

**Possible causes**:
1. Google Cloud Console not configured correctly
2. Missing Supabase environment variables
3. Network issues

**Debug steps**:
1. Check browser console for detailed error logs
2. Verify `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are set
3. Verify Google OAuth client ID is correct
4. Check Google Cloud Console configuration

## Environment Variables

Required in `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://ovfpvoxvciijexylyndg.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
EXPO_PUBLIC_SUPABASE_CALLBACK_URL=https://ovfpvoxvciijexylyndg.supabase.co/auth/v1/callback
```

## Testing Checklist

### Web:
- [ ] Can click "Sign in with Google"
- [ ] Redirects to Google authentication page
- [ ] After authentication, returns to app
- [ ] Session is established
- [ ] AI Market Snapshot appears
- [ ] Redirects to main app

### Mobile:
- [ ] Can click "Sign in with Google"
- [ ] Opens system browser
- [ ] Redirects to Google authentication page
- [ ] After authentication, app reopens via deep link
- [ ] Session is established
- [ ] AI Market Snapshot appears
- [ ] Redirects to main app

## Support

If issues persist after following this guide:
1. Check Metro bundler logs: `workspace/.fastshot-logs/expo-dev-server.log`
2. Check browser console (for web)
3. Clear Metro cache: `npx expo start --clear`
4. Verify all environment variables are set correctly
