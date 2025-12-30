/**
 * Firebase Wrapper
 * Provides safe access to Firebase services with availability checks
 * Platform-guarded to prevent native module loading on web
 */

import { Platform } from 'react-native';

// Cache for native modules (only loaded on native platforms)
let firebaseApp: any = null;
let firebaseAuth: any = null;
let firebaseFirestore: any = null;

export class FirebaseWrapper {
  private static available: boolean | null = null;

  /**
   * Check if Firebase is available and configured
   */
  static isAvailable(): boolean {
    // Firebase native modules are not available on web
    if (Platform.OS === 'web') {
      if (this.available === null) {
        console.info('🌐 Running on Web: Firebase native modules not available');
        console.info('💡 Using Local Mode authentication');
        this.available = false;
      }
      return false;
    }

    if (this.available !== null) {
      return this.available;
    }

    try {
      // Load Firebase App module (only on native platforms)
      // Metro requires static strings for require()
      if (!firebaseApp) {
        try {
          firebaseApp = require('@react-native-firebase/app').default;
        } catch (e) {
          console.warn('Firebase App module not found:', e);
          this.available = false;
          return false;
        }
      }

      if (!firebaseApp) {
        this.available = false;
        return false;
      }

      const apps = firebaseApp.apps;
      this.available = apps && apps.length > 0;

      if (!this.available) {
        console.info('📱 Running in Local Mode: Firebase config files not found');
        console.info('💡 Add google-services.json (Android) or GoogleService-Info.plist (iOS) to enable Firebase');
      } else {
        console.info('☁️  Running in Firebase Mode: Cloud services enabled');
      }

      return this.available ?? false;
    } catch (error) {
      console.warn('Firebase availability check failed:', error);
      this.available = false;
      return false;
    }
  }

  /**
   * Get Firebase Auth instance (safe)
   */
  static getAuth() {
    if (!this.isAvailable()) {
      throw new Error('Firebase is not available. Running in Local Mode.');
    }

    try {
      // Load Firebase Auth module (only on native platforms)
      // Metro requires static strings for require()
      if (!firebaseAuth) {
        try {
          firebaseAuth = require('@react-native-firebase/auth').default;
        } catch (e) {
          console.warn('Firebase Auth module not found:', e);
          throw new Error('Firebase Auth module not available');
        }
      }

      if (!firebaseAuth) {
        throw new Error('Firebase Auth module not available');
      }

      return firebaseAuth();
    } catch (error) {
      console.error('Error loading Firebase Auth:', error);
      throw error;
    }
  }

  /**
   * Get Firebase Firestore instance (safe)
   */
  static getFirestore() {
    if (!this.isAvailable()) {
      throw new Error('Firebase is not available. Running in Local Mode.');
    }

    try {
      // Load Firebase Firestore module (only on native platforms)
      // Metro requires static strings for require()
      if (!firebaseFirestore) {
        try {
          firebaseFirestore = require('@react-native-firebase/firestore').default;
        } catch (e) {
          console.warn('Firebase Firestore module not found:', e);
          throw new Error('Firebase Firestore module not available');
        }
      }

      if (!firebaseFirestore) {
        throw new Error('Firebase Firestore module not available');
      }

      return firebaseFirestore();
    } catch (error) {
      console.error('Error loading Firebase Firestore:', error);
      throw error;
    }
  }

  /**
   * Reset availability check (useful for testing)
   */
  static reset() {
    this.available = null;
  }
}
