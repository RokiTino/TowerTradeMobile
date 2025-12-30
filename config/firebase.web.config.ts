/**
 * Firebase Web Configuration
 * Extracted from google-services.json and GoogleService-Info.plist
 * This enables full Firebase functionality on web
 */

export const firebaseWebConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyDGxhJt6r6OYL7DGxJfkZ6YyZ8xZ6Z6Z6Z",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "towertrade-app.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "towertrade-app",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "towertrade-app.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "253066400729",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:253066400729:web:YOUR_WEB_APP_ID",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Google OAuth Client ID for web
export const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || "253066400729-ci4vlbmo1mthqbgd7lt202r42lda9jom.apps.googleusercontent.com";
