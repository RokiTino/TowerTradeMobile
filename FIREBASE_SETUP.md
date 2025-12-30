# TowerTrade Firebase Integration Guide

## Overview

TowerTrade has been restructured to support **platform-specific Firebase configuration** while maintaining a **flexible, repository-based architecture** that allows for easy backend switching (Firebase, Local Storage, or future Supabase integration).

---

## 🏗️ Architecture

### Repository Pattern

The application now uses the **Repository Pattern** to abstract data access:

```
┌─────────────────────────────────────────┐
│         App Components                  │
│  (Screens, Modals, Checkout Flow)      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Storage Utils (storage.ts)         │
│    (Backward Compatibility Layer)       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│       Service Factory                    │
│   (Switches between backends)           │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴───────┐
       ▼               ▼
┌─────────────┐  ┌─────────────┐
│   Local     │  │   Firebase  │
│ Repository  │  │ Repository  │
│(AsyncStorage│  │ (Firestore) │
└─────────────┘  └─────────────┘
```

### Key Benefits

✅ **Offline-First**: Works without internet using Local Storage
✅ **Flexible Backend**: Easy to switch between Firebase, Supabase, or local
✅ **Backward Compatible**: All existing code works without changes
✅ **Type-Safe**: Full TypeScript support with interfaces
✅ **Testable**: Repository interfaces make testing easier

---

## 📁 Project Structure

```
/workspace/
├── android/
│   ├── google-services.json          ← Place your Android Firebase config HERE
│   └── README.md                      ← Android setup instructions
│
├── ios/
│   ├── GoogleService-Info.plist      ← Place your iOS Firebase config HERE
│   └── README.md                      ← iOS setup instructions
│
├── config/
│   └── app.config.ts                  ← App-wide configuration
│
├── services/
│   ├── ServiceFactory.ts              ← Backend switching logic
│   ├── repositories/
│   │   ├── IPaymentRepository.ts      ← Payment interface
│   │   ├── IPropertyRepository.ts     ← Property interface
│   │   ├── IUserRepository.ts         ← User interface
│   │   ├── LocalPaymentRepository.ts  ← Local storage implementation
│   │   └── FirebasePaymentRepository.ts ← Firebase implementation
│   └── firebase/
│       └── FirebaseService.ts         ← Firebase auth & initialization
│
├── utils/
│   └── storage.ts                     ← Backward compatibility layer
│
└── app.config.js                      ← Expo configuration with Firebase support
```

---

## 🚀 Quick Start Guide

### Step 1: Get Firebase Configuration Files

#### For Android:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click the **⚙️ Settings** icon → **Project settings**
4. Under "Your apps", click the **Android** icon
5. Register your app:
   - **Package name**: `com.towertrade.app`
   - **App nickname**: TowerTrade (optional)
6. Download `google-services.json`
7. Place it in `/workspace/android/google-services.json`

#### For iOS:

1. In the same Firebase Console
2. Click the **iOS** icon under "Your apps"
3. Register your app:
   - **Bundle ID**: `com.towertrade.app`
   - **App nickname**: TowerTrade (optional)
4. Download `GoogleService-Info.plist`
5. Place it in `/workspace/ios/GoogleService-Info.plist`

### Step 2: Install Dependencies (Already Done)

```bash
npm install firebase @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore
```

### Step 3: Configure Firebase in Console

1. **Enable Authentication**:
   - Go to **Authentication** → **Sign-in method**
   - Enable **Email/Password**

2. **Set up Firestore Database**:
   - Go to **Firestore Database** → **Create database**
   - Start in **Production mode** (add security rules later)
   - Choose a location close to your users

3. **Firestore Security Rules** (Important):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can only access their own data
       match /users/{userId}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

### Step 4: Verify Setup

After placing the configuration files, run:

```bash
npx expo start
```

The app will automatically detect Firebase configuration and switch to Firebase backend.

---

## 🔄 Switching Between Backends

### Method 1: Automatic (Recommended)

The app automatically detects Firebase configuration:
- **Firebase config found** → Uses Firebase
- **No Firebase config** → Uses Local Storage

### Method 2: Manual Override

Update `/workspace/config/app.config.ts`:

```typescript
export const defaultConfig: AppConfig = {
  backendType: 'firebase', // or 'local' or 'supabase'
  // ...
};
```

### Method 3: Runtime Switching

```typescript
import { PaymentService } from '@/services/ServiceFactory';

// Switch to Firebase
PaymentService.switchToFirebase(userId);

// Switch to Local
PaymentService.switchToLocal();
```

---

## 📊 Firebase Collections Structure

When using Firebase, data is organized as follows:

```
/users/{userId}/
├── creditCards/
│   └── {cardId}
│       ├── cardholderName: string
│       ├── cardNumber: string (last 4 digits only)
│       ├── expiryMonth: string
│       ├── expiryYear: string
│       ├── brand: string
│       ├── isDefault: boolean
│       └── createdAt: timestamp
│
├── bankAccounts/
│   └── {accountId}
│       ├── accountName: string
│       ├── accountType: string
│       ├── accountNumberLast4: string
│       ├── routingNumber: string
│       ├── verificationStatus: string
│       ├── isDefault: boolean
│       └── createdAt: timestamp
│
├── transactions/
│   └── {transactionId}
│       ├── propertyId: string
│       ├── propertyName: string
│       ├── amount: number
│       ├── status: string
│       ├── paymentMethodId: string
│       ├── paymentMethodType: string
│       ├── expectedROI: number
│       └── date: timestamp
│
└── investorAgreement/
    ├── id: string
    ├── version: string
    ├── accepted: boolean
    └── acceptedAt: timestamp
```

---

## 🔐 Security Best Practices

### 1. Environment Variables

Never commit Firebase config files to git. They're already in `.gitignore`:

```gitignore
# Firebase Configuration Files (sensitive - do not commit)
android/google-services.json
ios/GoogleService-Info.plist
```

### 2. Authentication

All Firebase operations require authentication:

```typescript
import { FirebaseService } from '@/services/firebase/FirebaseService';

// Sign in
const user = await FirebaseService.signIn(email, password);

// Create account
const newUser = await FirebaseService.signUp(email, password, name);
```

### 3. Firestore Security Rules

Always implement proper security rules in Firebase Console. Example:

```javascript
// Only authenticated users can access their own data
match /users/{userId}/{document=**} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}

// Properties are read-only for all users
match /properties/{propertyId} {
  allow read: if true;
  allow write: if false; // Only admins (via Cloud Functions)
}
```

---

## 🧪 Testing

### Test Local Storage (Offline)

1. Remove Firebase config files temporarily
2. Restart app
3. All features work offline with AsyncStorage

### Test Firebase Integration

1. Add Firebase config files
2. Restart app
3. Create account and sign in
4. Add payment methods and make investments
5. Check Firebase Console → Firestore to verify data sync

---

## 🔧 Troubleshooting

### Firebase not initializing

**Problem**: App shows "Firebase not configured" warning

**Solution**:
1. Verify `google-services.json` (Android) or `GoogleService-Info.plist` (iOS) is in correct directory
2. Check file contents are valid JSON/XML
3. Restart Metro bundler: `npx expo start --clear`

### Data not syncing to Firebase

**Problem**: Data stays local, doesn't appear in Firestore

**Solution**:
1. Check if user is authenticated: `FirebaseService.getCurrentUserId()`
2. Verify Firestore security rules allow write access
3. Check network connectivity
4. Look for errors in console logs

### TypeScript errors

**Problem**: Import errors for Firebase modules

**Solution**:
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
npx tsc --noEmit
```

---

## 🎯 Features Maintained

All premium TowerTrade features remain fully functional:

✅ **AI Portfolio Counselor** - Newell AI integration
✅ **Slide-to-Pay Checkout** - Premium gesture interaction
✅ **Biometric Authentication** - FaceID/TouchID
✅ **Payment Management** - Credit cards and bank accounts
✅ **Transaction Ledger** - Complete history with status tracking
✅ **Investment Certificates** - Shareable receipts
✅ **Property Discovery** - Browse and filter properties
✅ **Offline Mode** - Full functionality without internet

---

## 📱 Building for Production

### Android

```bash
# Development build
eas build --platform android --profile development

# Production build
eas build --platform android --profile production
```

### iOS

```bash
# Development build
eas build --platform ios --profile development

# Production build
eas build --platform ios --profile production
```

**Note**: EAS Build automatically handles Firebase configuration files during the build process.

---

## 🔮 Future: Adding Supabase Support

The repository pattern makes it easy to add Supabase:

1. Create `SupabasePaymentRepository.ts` implementing `IPaymentRepository`
2. Update `ServiceFactory.ts` to handle `backendType: 'supabase'`
3. Add Supabase configuration to `app.config.js`

---

## 📞 Support

For Firebase-specific issues:
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Native Firebase](https://rnfirebase.io/)

For TowerTrade app issues:
- Check the repository interfaces in `/services/repositories/`
- Review service factory implementation
- Enable debug logging in Firebase Console

---

## ✅ Checklist

- [ ] Firebase project created
- [ ] `google-services.json` placed in `/android/`
- [ ] `GoogleService-Info.plist` placed in `/ios/`
- [ ] Email/Password authentication enabled in Firebase
- [ ] Firestore database created
- [ ] Security rules configured
- [ ] App tested with Firebase backend
- [ ] All premium features verified working
- [ ] Production build successful

---

**🎉 Congratulations!** Your TowerTrade app is now configured for Firebase integration with a flexible, production-ready architecture.
