/**
 * Universal Firebase Wrapper
 * Supports both Web (Firebase JS SDK) and Native (React Native Firebase)
 * Provides a unified interface for Firebase services across all platforms
 */

import { Platform } from 'react-native';
import { firebaseWebConfig, googleWebClientId } from '@/config/firebase.web.config';

// Type definitions for universal Firebase interface
export interface UniversalAuth {
  currentUser: any;
  signInWithEmailAndPassword: (email: string, password: string) => Promise<any>;
  createUserWithEmailAndPassword: (email: string, password: string) => Promise<any>;
  signInWithPopup?: (provider: any) => Promise<any>;
  signInWithRedirect?: (provider: any) => Promise<any>;
  signInWithCredential: (credential: any) => Promise<any>;
  signOut: () => Promise<void>;
  onAuthStateChanged: (callback: (user: any) => void) => () => void;
}

export interface UniversalFirestore {
  collection: (path: string) => any;
  doc: (path: string) => any;
  FieldValue: any;
}

// Cache for Firebase instances
let webFirebaseApp: any = null;
let webAuth: any = null;
let webFirestore: any = null;
let webGoogleProvider: any = null;

let nativeFirebaseApp: any = null;
let nativeAuth: any = null;
let nativeFirestore: any = null;

export class UniversalFirebaseWrapper {
  private static initialized = false;
  private static isWeb = Platform.OS === 'web';

  /**
   * Initialize Firebase for the current platform
   */
  static async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }

    try {
      if (this.isWeb) {
        return await this.initializeWeb();
      } else {
        return await this.initializeNative();
      }
    } catch (error) {
      console.error('Firebase initialization failed:', error);
      return false;
    }
  }

  /**
   * Initialize Firebase Web (JS SDK)
   */
  private static async initializeWeb(): Promise<boolean> {
    try {
      console.info('🌐 Initializing Firebase for Web...');

      const { initializeApp, getApps } = require('firebase/app');
      const { getAuth: getWebAuth, GoogleAuthProvider } = require('firebase/auth');
      const { getFirestore: getWebFirestore } = require('firebase/firestore');

      // Initialize Firebase app if not already initialized
      if (getApps().length === 0) {
        webFirebaseApp = initializeApp(firebaseWebConfig);
        console.info('✅ Firebase Web App initialized');
      } else {
        webFirebaseApp = getApps()[0];
        console.info('✅ Firebase Web App already initialized');
      }

      // Initialize services
      webAuth = getWebAuth(webFirebaseApp);
      webFirestore = getWebFirestore(webFirebaseApp);
      webGoogleProvider = new GoogleAuthProvider();

      this.initialized = true;
      console.info('☁️  Firebase Web Mode: All services enabled');
      return true;
    } catch (error) {
      console.error('Failed to initialize Firebase Web:', error);
      return false;
    }
  }

  /**
   * Initialize Firebase Native (React Native Firebase)
   */
  private static async initializeNative(): Promise<boolean> {
    try {
      console.info('📱 Initializing Firebase for Native...');

      // Load native Firebase modules
      nativeFirebaseApp = require('@react-native-firebase/app').default;
      nativeAuth = require('@react-native-firebase/auth').default;
      nativeFirestore = require('@react-native-firebase/firestore').default;

      // Check if Firebase is configured
      const apps = nativeFirebaseApp.apps;
      if (apps.length === 0) {
        console.warn('Firebase not configured. Please add google-services.json (Android) or GoogleService-Info.plist (iOS)');
        return false;
      }

      this.initialized = true;
      console.info('☁️  Firebase Native Mode: All services enabled');
      return true;
    } catch (error) {
      console.error('Failed to initialize Firebase Native:', error);
      return false;
    }
  }

  /**
   * Check if Firebase is available and initialized
   */
  static isAvailable(): boolean {
    return this.initialized;
  }

  /**
   * Get Auth instance (universal)
   */
  static getAuth(): UniversalAuth {
    if (!this.initialized) {
      throw new Error('Firebase not initialized. Call initialize() first.');
    }

    if (this.isWeb) {
      return webAuth;
    } else {
      return nativeAuth();
    }
  }

  /**
   * Get Firestore instance (universal)
   */
  static getFirestore(): UniversalFirestore {
    if (!this.initialized) {
      throw new Error('Firebase not initialized. Call initialize() first.');
    }

    if (this.isWeb) {
      return webFirestore;
    } else {
      return nativeFirestore();
    }
  }

  /**
   * Get Google Auth Provider (web only)
   */
  static getGoogleProvider(): any {
    if (!this.isWeb) {
      throw new Error('Google Provider is only available on web. Use native Google Sign-In on mobile.');
    }

    if (!webGoogleProvider) {
      const { GoogleAuthProvider } = require('firebase/auth');
      webGoogleProvider = new GoogleAuthProvider();
    }

    return webGoogleProvider;
  }

  /**
   * Sign in with Google (universal)
   */
  static async signInWithGoogle(): Promise<any> {
    if (!this.initialized) {
      throw new Error('Firebase not initialized. Call initialize() first.');
    }

    if (this.isWeb) {
      // Web: Use popup authentication
      const { signInWithPopup } = require('firebase/auth');
      const auth = this.getAuth();
      const provider = this.getGoogleProvider();

      try {
        const result = await signInWithPopup(auth, provider);
        console.info('✅ Google Sign-In successful (Web)');
        return result.user;
      } catch (error: any) {
        if (error.code === 'auth/popup-blocked') {
          console.warn('Popup blocked, trying redirect...');
          const { signInWithRedirect } = require('firebase/auth');
          await signInWithRedirect(auth, provider);
          return null; // Will complete after redirect
        }
        throw error;
      }
    } else {
      // Native: Use React Native Google Sign-In
      const { GoogleSignin } = require('@react-native-google-signin/google-signin');

      // Ensure Google Sign-In is configured
      GoogleSignin.configure({
        webClientId: googleWebClientId,
        offlineAccess: true,
      });

      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (response.type === 'cancelled') {
        throw new Error('Google Sign-In cancelled');
      }

      const idToken = response.data.idToken;
      if (!idToken) {
        throw new Error('Failed to get Google ID token');
      }

      // Sign in with Firebase using the ID token
      const auth = this.getAuth();
      const { GoogleAuthProvider } = require('@react-native-firebase/auth');
      const googleCredential = GoogleAuthProvider.credential(idToken);
      const userCredential = await auth.signInWithCredential(googleCredential);

      console.info('✅ Google Sign-In successful (Native)');
      return userCredential.user;
    }
  }

  /**
   * Get Firestore collection reference (universal)
   */
  static collection(path: string): any {
    const firestore = this.getFirestore();

    if (this.isWeb) {
      const { collection } = require('firebase/firestore');
      return collection(firestore, path);
    } else {
      return firestore.collection(path);
    }
  }

  /**
   * Get Firestore document reference (universal)
   */
  static doc(collectionPath: string, docId: string): any {
    const firestore = this.getFirestore();

    if (this.isWeb) {
      const { doc } = require('firebase/firestore');
      return doc(firestore, collectionPath, docId);
    } else {
      return firestore.collection(collectionPath).doc(docId);
    }
  }

  /**
   * Get FieldValue for server timestamps (universal)
   */
  static getFieldValue(): any {
    if (this.isWeb) {
      const { serverTimestamp, increment, arrayUnion, arrayRemove } = require('firebase/firestore');
      return {
        serverTimestamp,
        increment,
        arrayUnion,
        arrayRemove,
      };
    } else {
      const firestore = this.getFirestore();
      return firestore.FieldValue;
    }
  }

  /**
   * Subscribe to real-time updates (universal)
   */
  static onSnapshot(ref: any, callback: (snapshot: any) => void, errorCallback?: (error: any) => void): () => void {
    if (this.isWeb) {
      const { onSnapshot } = require('firebase/firestore');
      return onSnapshot(ref, callback, errorCallback);
    } else {
      return ref.onSnapshot(callback, errorCallback);
    }
  }

  /**
   * Reset Firebase (for testing or logout)
   */
  static reset() {
    this.initialized = false;
    webFirebaseApp = null;
    webAuth = null;
    webFirestore = null;
    webGoogleProvider = null;
    nativeFirebaseApp = null;
    nativeAuth = null;
    nativeFirestore = null;
  }
}
