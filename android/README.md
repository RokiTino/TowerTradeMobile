# Android Configuration

## Google Services Setup

### 1. Place your `google-services.json` file here

This file is required for Firebase integration on Android.

**How to obtain this file:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click on the Android icon to add an Android app
4. Register your app with your package name (e.g., `com.towertrade.app`)
5. Download the `google-services.json` file
6. Place it in this `/android/` directory

### 2. File Location

```
/workspace/android/google-services.json
```

### 3. What this file contains

The `google-services.json` file includes:
- Firebase project configuration
- API keys
- Project IDs
- OAuth client information
- Database URLs

### 4. Security Note

**IMPORTANT:** This file contains sensitive configuration data. Make sure it's added to `.gitignore` if you're using version control.

### 5. Example Structure (DO NOT use these values)

```json
{
  "project_info": {
    "project_number": "YOUR_PROJECT_NUMBER",
    "project_id": "your-project-id",
    "storage_bucket": "your-project-id.appspot.com"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "YOUR_APP_ID",
        "android_client_info": {
          "package_name": "com.towertrade.app"
        }
      }
    }
  ]
}
```

### 6. Required Expo Configuration

After placing the file here, the `app.config.js` will automatically reference it for Android builds.
