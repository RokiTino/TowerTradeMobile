# iOS Configuration

## Google Services Setup

### 1. Place your `GoogleService-Info.plist` file here

This file is required for Firebase integration on iOS.

**How to obtain this file:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click on the iOS icon to add an iOS app
4. Register your app with your bundle ID (e.g., `com.towertrade.app`)
5. Download the `GoogleService-Info.plist` file
6. Place it in this `/ios/` directory

### 2. File Location

```
/workspace/ios/GoogleService-Info.plist
```

### 3. What this file contains

The `GoogleService-Info.plist` file includes:
- Firebase project configuration
- API keys
- Project IDs
- OAuth client information
- Database URLs
- Google App ID

### 4. Security Note

**IMPORTANT:** This file contains sensitive configuration data. Make sure it's added to `.gitignore` if you're using version control.

### 5. Example Structure (DO NOT use these values)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>API_KEY</key>
    <string>YOUR_API_KEY_HERE</string>
    <key>GCM_SENDER_ID</key>
    <string>YOUR_SENDER_ID</string>
    <key>PLIST_VERSION</key>
    <string>1</string>
    <key>BUNDLE_ID</key>
    <string>com.towertrade.app</string>
    <key>PROJECT_ID</key>
    <string>your-project-id</string>
    <key>STORAGE_BUCKET</key>
    <string>your-project-id.appspot.com</string>
    <key>IS_ADS_ENABLED</key>
    <false/>
    <key>IS_ANALYTICS_ENABLED</key>
    <false/>
    <key>IS_APPINVITE_ENABLED</key>
    <true/>
    <key>IS_GCM_ENABLED</key>
    <true/>
    <key>IS_SIGNIN_ENABLED</key>
    <true/>
    <key>GOOGLE_APP_ID</key>
    <string>YOUR_GOOGLE_APP_ID</string>
</dict>
</plist>
```

### 6. Required Expo Configuration

After placing the file here, the `app.config.js` will automatically reference it for iOS builds.
