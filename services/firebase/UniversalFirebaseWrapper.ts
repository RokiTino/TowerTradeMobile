/**
 * Universal Firebase Wrapper
 * Supports both Web (Firebase JS SDK) and Native (React Native Firebase)
 * Provides a unified interface for Firebase services across all platforms
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { firebaseWebConfig, googleWebClientId } from '@/config/firebase.web.config';

// Import Firebase JS SDK modules (always available)
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup as webSignInWithPopup,
  GoogleAuthProvider,
  Auth as WebAuth,
  signInWithEmailAndPassword as webSignInWithEmail,
  createUserWithEmailAndPassword as webCreateUserWithEmail,
  signOut as webSignOut,
  onAuthStateChanged as webOnAuthStateChanged,
  signInWithCredential as webSignInWithCredential,
  initializeAuth
} from 'firebase/auth';
import { getFirestore, Firestore as WebFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  private static useWebSDK = false; // Flag to indicate using Web SDK on native

  /**
   * Detect if running in Expo Go
   */
  private static isExpoGo(): boolean {
    const executionEnvironment = Constants.executionEnvironment;
    // ExecutionEnvironment.StoreClient means Expo Go
    // ExecutionEnvironment.Standalone means standalone app
    return executionEnvironment === 'storeClient';
  }

  /**
   * Validate Firebase configuration before initialization
   */
  private static validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!firebaseWebConfig.apiKey) {
      errors.push('Missing Firebase API Key (EXPO_PUBLIC_FIREBASE_API_KEY)');
    }

    if (!firebaseWebConfig.authDomain) {
      errors.push('Missing Firebase Auth Domain (EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN)');
    }

    if (!firebaseWebConfig.projectId) {
      errors.push('Missing Firebase Project ID (EXPO_PUBLIC_FIREBASE_PROJECT_ID)');
    }

    if (!googleWebClientId) {
      errors.push('Missing Google Web Client ID (EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID)');
    }

    if (errors.length > 0) {
      console.error('❌ Firebase Configuration Errors:');
      errors.forEach((error) => console.error(`   - ${error}`));
      return { valid: false, errors };
    }

    console.info('✅ Firebase configuration validated successfully');
    console.info(`📋 Config details:
      - Project ID: ${firebaseWebConfig.projectId}
      - Auth Domain: ${firebaseWebConfig.authDomain}
      - Web Client ID: ${googleWebClientId?.substring(0, 25)}...`);

    return { valid: true, errors: [] };
  }

  /**
   * Initialize Firebase for the current platform
   */
  static async initialize(): Promise<boolean> {
    if (this.initialized) {
      console.info('ℹ️  Firebase already initialized');
      return true;
    }

    console.info('🚀 Initializing Firebase Universal Wrapper...');
    console.info(`📱 Platform: ${Platform.OS}`);

    const inExpoGo = this.isExpoGo();
    console.info(`🔍 Expo Go detected: ${inExpoGo}`);
    console.info(`🌐 Environment: ${this.isWeb ? 'Web' : (inExpoGo ? 'Expo Go (using Web SDK)' : 'Native')}`);

    // Validate configuration
    const validation = this.validateConfig();
    if (!validation.valid) {
      console.error('❌ Cannot initialize Firebase: Configuration validation failed');
      return false;
    }

    try {
      // Always use Web SDK on web or in Expo Go
      if (this.isWeb || inExpoGo) {
        return await this.initializeWeb();
      } else {
        return await this.initializeNative();
      }
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error);
      return false;
    }
  }

  /**
   * Initialize Firebase Web (JS SDK)
   * Works on both web and React Native (Expo Go)
   */
  private static async initializeWeb(): Promise<boolean> {
    try {
      console.info('🌐 Initializing Firebase JS SDK...');

      // Initialize Firebase app if not already initialized
      const existingApps = getApps();
      if (existingApps.length === 0) {
        webFirebaseApp = initializeApp(firebaseWebConfig);
        console.info('✅ Firebase Web App initialized');
      } else {
        webFirebaseApp = existingApps[0];
        console.info('✅ Firebase Web App already initialized');
      }

      // Initialize Auth
      // Note: In React Native, Firebase Auth JS SDK will use memory persistence by default
      // For production, consider implementing AsyncStorage persistence manually
      try {
        webAuth = getAuth(webFirebaseApp);
        console.info('✅ Auth initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize Auth:', error);
        throw error;
      }

      // Initialize Firestore
      webFirestore = getFirestore(webFirebaseApp);

      // Create Google Auth Provider
      webGoogleProvider = new GoogleAuthProvider();

      this.initialized = true;
      this.useWebSDK = true;
      console.info('☁️  Firebase JS SDK Mode: All services enabled');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Firebase Web:', error);
      return false;
    }
  }

  /**
   * Initialize Firebase Native (React Native Firebase)
   * IMPORTANT: This should only be called for standalone builds, NOT Expo Go
   */
  private static async initializeNative(): Promise<boolean> {
    try {
      console.info('📱 Initializing Native Firebase (standalone build)...');

      // Double-check we're not in Expo Go
      if (this.isExpoGo()) {
        console.warn('⚠️  Attempted to initialize native Firebase in Expo Go - falling back to Web SDK');
        return await this.initializeWeb();
      }

      // Only attempt to load native modules in standalone builds
      try {
        // Dynamic require to avoid bundling issues
        nativeFirebaseApp = require('@react-native-firebase/app').default;
        nativeAuth = require('@react-native-firebase/auth').default;
        nativeFirestore = require('@react-native-firebase/firestore').default;

        // Check if Firebase is configured
        const apps = nativeFirebaseApp.apps;
        if (apps.length === 0) {
          console.warn('⚠️  Native Firebase not configured. Falling back to Web SDK...');
          return await this.initializeWeb();
        }

        this.initialized = true;
        this.useWebSDK = false;
        console.info('☁️  Firebase Native Mode: All services enabled');
        return true;
      } catch (nativeError) {
        console.warn('⚠️  Native Firebase modules not available');
        console.info('🔄 Falling back to Firebase JS SDK...');
        return await this.initializeWeb();
      }
    } catch (error) {
      console.error('❌ Failed to initialize Firebase for Native:', error);
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
   * Auto-detects environment and uses appropriate method
   */
  static async signInWithGoogle(): Promise<any> {
    if (!this.initialized) {
      const errorMsg = 'Firebase not initialized. Call initialize() first.';
      console.error('❌ Google Sign-In Error:', errorMsg);
      throw new Error(errorMsg);
    }

    console.info('🔐 Starting Google Sign-In flow...');
    console.info(`📍 Platform: ${Platform.OS}, Using Web SDK: ${this.useWebSDK}`);
    console.info(`🔍 Expo Go: ${this.isExpoGo()}`);

    // Check if we're using Web SDK (web, Expo Go, or fallback)
    if (this.useWebSDK || this.isWeb) {
      // Use Firebase JS SDK for authentication
      console.info('🌐 Using Firebase JS SDK for Google Sign-In');

      const auth = webAuth;
      if (!auth) {
        const errorMsg = 'Firebase Auth not initialized';
        console.error('❌', errorMsg);
        throw new Error(errorMsg);
      }

      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      try {
        console.info('🔄 Opening Google Sign-In popup...');
        const result = await webSignInWithPopup(auth, provider);
        console.info('✅ Google Sign-In successful!');
        console.info(`👤 User: ${result.user.email}`);
        return result.user;
      } catch (error: any) {
        console.error('❌ Google Sign-In popup error:', {
          code: error.code,
          message: error.message,
          details: error
        });

        if (error.code === 'auth/popup-blocked') {
          console.warn('⚠️  Popup blocked');
          throw new Error('Pop-up was blocked. Please allow pop-ups and try again.');
        }

        if (error.code === 'auth/popup-closed-by-user') {
          throw new Error('Sign-in cancelled');
        }

        if (error.code === 'auth/cancelled-popup-request') {
          throw new Error('Sign-in cancelled');
        }

        throw error;
      }
    } else {
      // Native with React Native Firebase: Use native Google Sign-In
      console.info('📱 Using Native Google Sign-In (standalone build)');

      const { GoogleSignin } = require('@react-native-google-signin/google-signin');

      // Ensure Google Sign-In is configured
      console.info('⚙️  Configuring Google Sign-In with webClientId:', googleWebClientId?.substring(0, 20) + '...');
      GoogleSignin.configure({
        webClientId: googleWebClientId,
        offlineAccess: true,
      });

      console.info('📋 Checking Play Services...');
      await GoogleSignin.hasPlayServices();

      console.info('🔄 Initiating native Google Sign-In...');
      const response = await GoogleSignin.signIn();

      if (response.type === 'cancelled') {
        console.warn('⚠️  User cancelled Google Sign-In');
        throw new Error('Google Sign-In cancelled');
      }

      const idToken = response.data?.idToken;
      if (!idToken) {
        console.error('❌ Failed to get ID token from Google Sign-In response');
        throw new Error('Failed to get Google ID token');
      }

      console.info('✅ Got ID token, signing in with Firebase...');

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
