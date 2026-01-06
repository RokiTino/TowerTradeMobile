/**
 * Firebase Authentication Service
 * Handles email/password and Google Sign-In authentication
 * Gracefully falls back to Local Mode when Firebase is unavailable
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseWrapper } from '../firebase/FirebaseWrapper';
import { UniversalFirebaseWrapper } from '../firebase/UniversalFirebaseWrapper';

const AUTH_TOKEN_KEY = '@towertrade_auth_token';
const USER_DATA_KEY = '@towertrade_user_data';
const LOCAL_AUTH_KEY = '@towertrade_local_auth';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface LocalAuthData {
  email: string;
  password: string; // In production, this should be hashed
  uid: string;
  displayName: string | null;
}

/**
 * Firebase Authentication Service with Local Mode fallback
 */
export class AuthService {
  /**
   * Check if Firebase is available
   */
  static isFirebaseAvailable(): boolean {
    return FirebaseWrapper.isAvailable();
  }

  /**
   * Sign in with email and password
   */
  static async signInWithEmail(email: string, password: string): Promise<AuthUser> {
    // Try Firebase if available
    if (this.isFirebaseAvailable()) {
      try {
        const auth = FirebaseWrapper.getAuth();
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const authUser = this.mapFirebaseUser(userCredential.user);
        await this.saveUserSession(authUser);
        return authUser;
      } catch (error: any) {
        console.error('Firebase sign-in error:', error);
        throw new Error(this.getAuthErrorMessage(error.code));
      }
    }

    // Fallback to Local Mode authentication
    return await this.localSignIn(email, password);
  }

  /**
   * Sign up with email and password
   */
  static async signUpWithEmail(email: string, password: string, displayName?: string): Promise<AuthUser> {
    // Try Firebase if available
    if (this.isFirebaseAvailable()) {
      try {
        const auth = FirebaseWrapper.getAuth();
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);

        // Update profile with display name if provided
        if (displayName) {
          await userCredential.user.updateProfile({ displayName });
        }

        const authUser = this.mapFirebaseUser(userCredential.user);
        await this.saveUserSession(authUser);
        return authUser;
      } catch (error: any) {
        console.error('Firebase sign-up error:', error);
        throw new Error(this.getAuthErrorMessage(error.code));
      }
    }

    // Fallback to Local Mode registration
    return await this.localSignUp(email, password, displayName);
  }

  /**
   * Sign in with Google (universal - works on web and native)
   */
  static async signInWithGoogle(idToken?: string): Promise<AuthUser> {
    console.info('🔐 AuthService: Starting Google Sign-In...');

    // Check if Firebase is available
    if (!UniversalFirebaseWrapper.isAvailable()) {
      const errorMsg = 'Firebase is not initialized. Google Sign-In requires Firebase configuration.';
      console.error('❌ AuthService Error:', errorMsg);
      console.error('💡 This usually means:');
      console.error('   1. Running in Expo Go without proper Firebase JS SDK fallback');
      console.error('   2. Missing Firebase configuration files');
      console.error('   3. Firebase initialization failed at app startup');
      throw new Error('Google Sign-In requires Firebase configuration');
    }

    try {
      console.info('🔄 AuthService: Delegating to UniversalFirebaseWrapper...');

      // Universal Firebase wrapper handles both web and native
      const user = await UniversalFirebaseWrapper.signInWithGoogle();

      if (!user) {
        // Redirect case (web) - user will be returned after redirect completes
        console.info('ℹ️  AuthService: Authentication redirect initiated');
        throw new Error('Authentication in progress. Please wait...');
      }

      const authUser = this.mapFirebaseUser(user);
      await this.saveUserSession(authUser);

      console.info('✅ AuthService: Google Sign-In completed successfully');
      console.info(`👤 Authenticated user: ${authUser.email}`);
      return authUser;
    } catch (error: any) {
      // Enhanced error logging
      console.error('❌ AuthService: Google Sign-In failed');
      console.error('📋 Error details:', {
        message: error.message,
        code: error.code,
        name: error.name,
        stack: error.stack?.split('\n').slice(0, 3).join('\n')
      });

      // Map error to user-friendly message
      const userMessage = this.getGoogleSignInErrorMessage(error);
      console.error('💬 User-facing message:', userMessage);

      throw new Error(userMessage);
    }
  }

  /**
   * Sign out current user
   */
  static async signOutUser(): Promise<void> {
    try {
      if (this.isFirebaseAvailable()) {
        const auth = FirebaseWrapper.getAuth();
        await auth.signOut();
      }
      await this.clearUserSession();
      await AsyncStorage.removeItem(LOCAL_AUTH_KEY);
    } catch (error) {
      console.error('Sign-out error:', error);
      throw new Error('Failed to sign out. Please try again.');
    }
  }

  /**
   * Get current authenticated user
   */
  static getCurrentUser(): any {
    if (!this.isFirebaseAvailable()) {
      return null;
    }

    try {
      const auth = FirebaseWrapper.getAuth();
      return auth.currentUser;
    } catch {
      return null;
    }
  }

  /**
   * Get current user as AuthUser format
   */
  static async getCurrentAuthUser(): Promise<AuthUser | null> {
    const user = this.getCurrentUser();
    if (user) {
      return this.mapFirebaseUser(user);
    }

    // Try to restore from session
    return await this.restoreUserSession();
  }

  /**
   * Listen to authentication state changes
   */
  static onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    // If Firebase is not available, just check local session once
    if (!this.isFirebaseAvailable()) {
      this.restoreUserSession().then((user) => {
        callback(user);
      });
      return () => {}; // No-op unsubscribe
    }

    try {
      const auth = FirebaseWrapper.getAuth();
      return auth.onAuthStateChanged((firebaseUser: any) => {
        if (firebaseUser) {
          const authUser = this.mapFirebaseUser(firebaseUser);
          this.saveUserSession(authUser); // Update session
          callback(authUser);
        } else {
          this.clearUserSession();
          callback(null);
        }
      });
    } catch (error) {
      console.error('Error setting up auth state listener:', error);
      // Fallback to local session check
      this.restoreUserSession().then((user) => {
        callback(user);
      });
      return () => {};
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentAuthUser();
    return user !== null;
  }

  /**
   * Local Mode: Sign in with email/password
   */
  private static async localSignIn(email: string, password: string): Promise<AuthUser> {
    try {
      const storedData = await AsyncStorage.getItem(LOCAL_AUTH_KEY);
      if (!storedData) {
        throw new Error('No account found. Please sign up first.');
      }

      const localAuth: LocalAuthData = JSON.parse(storedData);

      // Simple validation (in production, use proper password hashing)
      if (localAuth.email === email && localAuth.password === password) {
        const authUser: AuthUser = {
          uid: localAuth.uid,
          email: localAuth.email,
          displayName: localAuth.displayName,
          photoURL: null,
        };
        await this.saveUserSession(authUser);
        return authUser;
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Local sign-in failed');
    }
  }

  /**
   * Local Mode: Sign up with email/password
   */
  private static async localSignUp(
    email: string,
    password: string,
    displayName?: string
  ): Promise<AuthUser> {
    try {
      // Check if account already exists
      const existing = await AsyncStorage.getItem(LOCAL_AUTH_KEY);
      if (existing) {
        throw new Error('An account already exists. Please sign in.');
      }

      // Create local account
      const uid = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const localAuth: LocalAuthData = {
        email,
        password, // In production, hash this!
        uid,
        displayName: displayName || null,
      };

      await AsyncStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(localAuth));

      const authUser: AuthUser = {
        uid,
        email,
        displayName: displayName || null,
        photoURL: null,
      };

      await this.saveUserSession(authUser);
      return authUser;
    } catch (error: any) {
      throw new Error(error.message || 'Local sign-up failed');
    }
  }

  /**
   * Save user session to AsyncStorage for persistence
   */
  private static async saveUserSession(user: AuthUser): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, 'authenticated');
    } catch (error) {
      console.error('Error saving user session:', error);
    }
  }

  /**
   * Restore user session from AsyncStorage
   */
  private static async restoreUserSession(): Promise<AuthUser | null> {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      if (userData) {
        return JSON.parse(userData);
      }
    } catch (error) {
      console.error('Error restoring user session:', error);
    }
    return null;
  }

  /**
   * Clear user session from AsyncStorage
   */
  private static async clearUserSession(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([USER_DATA_KEY, AUTH_TOKEN_KEY]);
    } catch (error) {
      console.error('Error clearing user session:', error);
    }
  }

  /**
   * Map Firebase User to AuthUser
   */
  private static mapFirebaseUser(user: any): AuthUser {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };
  }

  /**
   * Get user-friendly error messages for Google Sign-In
   */
  private static getGoogleSignInErrorMessage(error: any): string {
    const errorMessage = error.message?.toLowerCase() || '';
    const errorCode = error.code || '';

    // Handle common Google Sign-In errors
    if (errorMessage.includes('cancelled') || errorMessage.includes('canceled') || errorCode === '-5') {
      return 'Sign-in cancelled';
    }

    if (errorMessage.includes('network') || errorCode === 'auth/network-request-failed') {
      return 'Network error. Please check your connection and try again.';
    }

    if (errorMessage.includes('popup-closed-by-user') || errorCode === 'auth/popup-closed-by-user') {
      return 'Sign-in window was closed. Please try again.';
    }

    if (errorMessage.includes('popup-blocked') || errorCode === 'auth/popup-blocked') {
      return 'Pop-up was blocked. Please allow pop-ups and try again.';
    }

    if (errorMessage.includes('configuration') || errorMessage.includes('not initialized')) {
      return 'Google Sign-In is not properly configured. Please contact support.';
    }

    if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/invalid-api-key') {
      return 'Invalid Google credentials. Please contact support.';
    }

    if (errorMessage.includes('developer') || errorCode === '10') {
      return 'Google Sign-In configuration error. Please contact support.';
    }

    // Return the original message if it's user-friendly, otherwise generic message
    if (errorMessage && errorMessage.length < 100 && !errorMessage.includes('undefined')) {
      return error.message;
    }

    return 'Failed to sign in with Google. Please try again.';
  }

  /**
   * Get user-friendly error messages
   */
  private static getAuthErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
      'auth/invalid-email': 'Invalid email address format.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'auth/operation-not-allowed': 'This sign-in method is not enabled.',
      'auth/invalid-credential': 'Invalid credentials. Please try again.',
    };

    return errorMessages[errorCode] || 'Authentication failed. Please try again.';
  }
}
