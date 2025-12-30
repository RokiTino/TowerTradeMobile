# Social Authentication Setup Guide

This guide covers the configuration requirements for Google and Facebook social authentication in TowerTrade.

## Prerequisites

The Social Suite has been implemented with the following components:
- ✅ Premium UI components (SocialLoginButton, DividerWithText, PremiumLoadingOverlay)
- ✅ Facebook SDK integration (react-native-fbsdk-next)
- ✅ Google Sign-In SDK integration (@react-native-google-signin/google-signin)
- ✅ Firebase Authentication methods for both providers
- ✅ AI-powered welcome service using Newell AI

## Firebase Configuration

### 1. Enable Authentication Providers

In your Firebase Console (https://console.firebase.google.com):

1. Navigate to **Authentication** → **Sign-in method**
2. Enable **Google** provider
3. Enable **Facebook** provider
4. Add your OAuth redirect URIs

### 2. Google Sign-In Configuration

#### Web Client ID
In Firebase Console:
1. Go to **Project Settings** → **General**
2. Scroll to **Your apps** section
3. Copy the **Web client ID** (not the Android/iOS client IDs)

#### Update Configuration
Add to your `app.json` or environment variables:

```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    }
  }
}
```

Configure Google Sign-In in your app initialization:

```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  offlineAccess: true,
});
```

### 3. Facebook Login Configuration

#### Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **Create App** → Select **Consumer** or **Business**
3. Add **Facebook Login** product to your app
4. Note your **App ID** and **App Secret**

#### Configure Firebase

In Firebase Console:
1. Go to **Authentication** → **Sign-in method** → **Facebook**
2. Enter your Facebook **App ID** and **App Secret**
3. Copy the **OAuth redirect URI** provided by Firebase
4. Add this URI to your Facebook App's **Valid OAuth Redirect URIs**

#### iOS Configuration

Add to `ios/TowerTrade/Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>fbYOUR_APP_ID</string>
    </array>
  </dict>
</array>
<key>FacebookAppID</key>
<string>YOUR_APP_ID</string>
<key>FacebookClientToken</key>
<string>YOUR_CLIENT_TOKEN</string>
<key>FacebookDisplayName</key>
<string>TowerTrade</string>
<key>LSApplicationQueriesSchemes</key>
<array>
  <string>fbapi</string>
  <string>fb-messenger-share-api</string>
</array>
```

#### Android Configuration

Add to `android/app/src/main/res/values/strings.xml`:

```xml
<resources>
    <string name="app_name">TowerTrade</string>
    <string name="facebook_app_id">YOUR_APP_ID</string>
    <string name="fb_login_protocol_scheme">fbYOUR_APP_ID</string>
    <string name="facebook_client_token">YOUR_CLIENT_TOKEN</string>
</resources>
```

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<application>
  <!-- ... other configurations ... -->

  <meta-data
    android:name="com.facebook.sdk.ApplicationId"
    android:value="@string/facebook_app_id"/>

  <meta-data
    android:name="com.facebook.sdk.ClientToken"
    android:value="@string/facebook_client_token"/>

  <activity
    android:name="com.facebook.FacebookActivity"
    android:configChanges="keyboard|keyboardHidden|screenLayout|screenSize|orientation"
    android:label="@string/app_name" />

  <activity
    android:name="com.facebook.CustomTabActivity"
    android:exported="true">
    <intent-filter>
      <action android:name="android.intent.action.VIEW" />
      <category android:name="android.intent.category.DEFAULT" />
      <category android:name="android.intent.category.BROWSABLE" />
      <data android:scheme="@string/fb_login_protocol_scheme" />
    </intent-filter>
  </activity>
</application>
```

## Testing

### Local Mode (No Firebase)

The app will automatically run in **Local Mode** if Firebase configuration files are not present:
- Social login buttons will be hidden
- Email/password authentication will use AsyncStorage
- Console will display: "📱 Running in Local Mode"

### Firebase Mode

Once Firebase is configured:
1. Social login buttons will appear on login and signup screens
2. Tapping Google/Facebook will trigger OAuth flow
3. Premium loading overlay will show during authentication
4. On success, users are redirected to the main app

## AI Welcome Feature

The AI Welcome Service is already implemented and will automatically:
- Generate personalized greetings using Newell AI
- Create market briefings based on time of day
- Suggest curated property recommendations
- Provide portfolio diversification tips

**Usage Example:**
```typescript
import { generatePersonalizedWelcome } from '@/services/AIWelcomeService';

const briefing = await generatePersonalizedWelcome(user, true);
console.log(briefing.welcome);
console.log(briefing.marketSummary);
console.log(briefing.topProperties);
console.log(briefing.personalizedTip);
```

## Troubleshooting

### "Configuration Required" Alert
- Ensure `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) are present
- Verify Firebase is initialized before authentication attempts

### Google Sign-In Fails
- Check that Web Client ID is correctly configured
- Verify SHA-1/SHA-256 fingerprints are added to Firebase (Android)
- Ensure GoogleService-Info.plist is in the iOS project

### Facebook Login Fails
- Verify App ID and Client Token are correct
- Check that OAuth redirect URIs match between Firebase and Facebook App
- Ensure Facebook App is in Live mode (not Development mode)

### No Social Buttons Visible
- This is expected if Firebase is not configured (Local Mode)
- Check console for "📱 Running in Local Mode" message
- Add Firebase configuration files to enable social authentication

## Security Notes

1. **Never commit sensitive keys** to version control
2. Use **environment variables** for API keys and secrets
3. Enable **App Check** in Firebase for production
4. Configure **OAuth consent screen** properly in Google Cloud Console
5. Set up **rate limiting** for authentication endpoints
6. Use **Firebase Security Rules** to protect user data

## Next Steps

Once configuration is complete:
1. Test Google Sign-In on both iOS and Android
2. Test Facebook Login on both platforms
3. Verify AI welcome messages appear after first login
4. Test profile prepopulation with social provider data
5. Monitor Firebase Authentication logs for issues

## Support

For configuration assistance:
- Firebase Documentation: https://firebase.google.com/docs/auth
- Google Sign-In: https://developers.google.com/identity
- Facebook Login: https://developers.facebook.com/docs/facebook-login
- Newell AI: Contact TowerTrade support
