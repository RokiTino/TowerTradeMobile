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

/**
 * Safely require a native module only on native platforms
 */
function safeRequireNative(moduleName: string): any {
  if (Platform.OS === 'web') {
    return null;
  }
  try {
    return require(moduleName);
  } catch (error) {
    console.warn(`Failed to require ${moduleName}:`, error);
    return null;
  }
}

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
      // Safe dynamic import for native platforms only
      if (!firebaseApp) {
        const module = safeRequireNative('@react-native-firebase/app');
        firebaseApp = module ? module.default : null;
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
      if (!firebaseAuth) {
        const module = safeRequireNative('@react-native-firebase/auth');
        firebaseAuth = module ? module.default : null;
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
      if (!firebaseFirestore) {
        const module = safeRequireNative('@react-native-firebase/firestore');
        firebaseFirestore = module ? module.default : null;
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
