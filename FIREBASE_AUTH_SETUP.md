# Firebase Authentication Setup Guide

This guide explains how to configure Firebase with Google and Facebook login for TowerTrade.

## Prerequisites

- Firebase project created at [Firebase Console](https://console.firebase.google.com)
- Facebook Developer account at [Facebook Developers](https://developers.facebook.com)

---

## Step 1: Firebase Project Setup

### 1.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name: `TowerTrade`
4. Enable/disable Google Analytics as needed
5. Click "Create project"

### 1.2 Enable Authentication Methods
1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable the following providers:
   - **Email/Password**
   - **Google**
   - **Facebook** (configure after Step 3)

---

## Step 2: Android Configuration

### 2.1 Add Android App to Firebase
1. In Firebase Console, click **Add app** > **Android**
2. Enter package name: `com.towertrade.app`
3. Enter app nickname: `TowerTrade Android`
4. Get SHA-1 certificate fingerprint (see below)
5. Click **Register app**
6. Download `google-services.json`
7. Place it in: `android/app/google-services.json`

### 2.2 Get SHA-1 Certificate Fingerprint

**For Debug (development):**
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**For EAS Build:**
```bash
eas credentials
# Select Android > Select your project > Show credentials
```

**Add SHA-1 to Firebase:**
1. Go to Firebase Console > Project Settings > Your apps > Android app
2. Click "Add fingerprint"
3. Paste your SHA-1 fingerprint

### 2.3 Get Web Client ID for Google Sign-In
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your Firebase project
3. Go to **APIs & Services** > **Credentials**
4. Find the OAuth 2.0 Client ID with type "Web application"
5. Copy the Client ID (ends with `.apps.googleusercontent.com`)
6. Update in `app/_layout.tsx`:
```typescript
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  offlineAccess: true,
});
```

---

## Step 3: iOS Configuration

### 3.1 Add iOS App to Firebase
1. In Firebase Console, click **Add app** > **iOS**
2. Enter bundle ID: `com.towertrade.app`
3. Enter app nickname: `TowerTrade iOS`
4. Click **Register app**
5. Download `GoogleService-Info.plist`
6. Place it in: `ios/TowerTrade/GoogleService-Info.plist`
7. Open Xcode and add the file to the TowerTrade target

### 3.2 Update iOS URL Schemes
1. Open `GoogleService-Info.plist` and find `REVERSED_CLIENT_ID`
2. Update `ios/TowerTrade/Info.plist`:
```xml
<key>CFBundleURLSchemes</key>
<array>
  <string>YOUR_REVERSED_CLIENT_ID_FROM_GOOGLE_SERVICE_INFO</string>
</array>
```

---

## Step 4: Facebook Login Setup

### 4.1 Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com)
2. Click **My Apps** > **Create App**
3. Select **Consumer** or **Business** app type
4. Enter app name: `TowerTrade`
5. Click **Create App**

### 4.2 Configure Facebook Login
1. In your Facebook app dashboard, click **Add Product**
2. Find **Facebook Login** and click **Set Up**
3. Select **iOS** and **Android**

### 4.3 Get Facebook App ID and Client Token
1. Go to **Settings** > **Basic**
2. Copy **App ID**
3. Go to **Settings** > **Advanced** > **Security**
4. Copy **Client Token**

### 4.4 Update Android Configuration
Edit `android/app/src/main/res/values/strings.xml`:
```xml
<string name="facebook_app_id">YOUR_FACEBOOK_APP_ID</string>
<string name="facebook_client_token">YOUR_FACEBOOK_CLIENT_TOKEN</string>
<string name="fb_login_protocol_scheme">fbYOUR_FACEBOOK_APP_ID</string>
```

### 4.5 Update iOS Configuration
Edit `ios/TowerTrade/Info.plist`:
```xml
<key>FacebookAppID</key>
<string>YOUR_FACEBOOK_APP_ID</string>
<key>FacebookClientToken</key>
<string>YOUR_FACEBOOK_CLIENT_TOKEN</string>
<key>CFBundleURLSchemes</key>
<array>
  <string>fbYOUR_FACEBOOK_APP_ID</string>
</array>
```

### 4.6 Configure Facebook App Settings
1. In Facebook Developer Console, go to **Settings** > **Basic**
2. Add platform settings:

**Android:**
- Package Name: `com.towertrade.app`
- Class Name: `com.towertrade.app.MainActivity`
- Key Hashes: Generate using:
```bash
keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore | openssl sha1 -binary | openssl base64
```

**iOS:**
- Bundle ID: `com.towertrade.app`

### 4.7 Enable Facebook in Firebase
1. Go to Firebase Console > Authentication > Sign-in method
2. Enable **Facebook**
3. Enter your Facebook App ID and App Secret
4. Copy the OAuth redirect URI
5. In Facebook Developer Console, go to **Facebook Login** > **Settings**
6. Add the Firebase OAuth redirect URI to **Valid OAuth Redirect URIs**

---

## Step 5: Rebuild Native Projects

After making all configuration changes, rebuild the native projects:

```bash
# Clean and rebuild
npx expo prebuild --clean

# Run iOS
npx expo run:ios

# Run Android
npx expo run:android
```

---

## Configuration Checklist

### Android
- [ ] `android/app/google-services.json` - Firebase config
- [ ] `android/app/src/main/res/values/strings.xml` - Facebook App ID & Client Token
- [ ] SHA-1 fingerprint added to Firebase Console
- [ ] Web Client ID updated in `app/_layout.tsx`

### iOS
- [ ] `ios/TowerTrade/GoogleService-Info.plist` - Firebase config
- [ ] `ios/TowerTrade/Info.plist` - Facebook App ID, Client Token, URL Schemes
- [ ] REVERSED_CLIENT_ID URL scheme added

### Firebase Console
- [ ] Email/Password authentication enabled
- [ ] Google authentication enabled
- [ ] Facebook authentication enabled with App ID and Secret

### Facebook Developer Console
- [ ] Android platform configured with package name and key hash
- [ ] iOS platform configured with bundle ID
- [ ] OAuth redirect URI from Firebase added

---

## Testing

1. Build the app for your device/simulator
2. Verify Firebase is detected: Social login buttons should appear on the login screen
3. Test Google Sign-In: Should open Google account picker
4. Test Facebook Sign-In: Should open Facebook login prompt
5. Verify users appear in Firebase Console > Authentication > Users

---

## Troubleshooting

### Google Sign-In Issues
- Verify SHA-1 fingerprint matches your signing certificate
- Ensure webClientId is correct (from OAuth 2.0 Web Client, not Android Client)
- Check that Google is enabled in Firebase Authentication

### Facebook Sign-In Issues
- Verify App ID and Client Token are correct
- Check that URL schemes match (`fb{APP_ID}`)
- Ensure Facebook Login is properly configured in Facebook Developer Console
- Verify OAuth redirect URI is added to Facebook app settings

### Build Issues
- Run `npx expo prebuild --clean` to regenerate native projects
- For iOS: Run `cd ios && pod install --repo-update`
- Clear Metro cache: `npx expo start --clear`
