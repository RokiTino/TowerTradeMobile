/**
 * Firebase Wrapper
 * Provides safe access to Firebase services with availability checks
 * Platform-guarded to prevent native module loading on web
 */

import { Platform } from 'react-native';

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
      // Dynamic import to prevent loading on web
      const firebase = require('@react-native-firebase/app').default;
      const apps = firebase.apps;
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
      const auth = require('@react-native-firebase/auth').default;
      return auth();
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
      const firestore = require('@react-native-firebase/firestore').default;
      return firestore();
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
