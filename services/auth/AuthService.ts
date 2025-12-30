/**
 * Firebase Authentication Service
 * Handles email/password and Google Sign-In authentication
 */

import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = '@towertrade_auth_token';
const USER_DATA_KEY = '@towertrade_user_data';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

/**
 * Firebase Authentication Service
 */
export class AuthService {
  /**
   * Sign in with email and password
   */
  static async signInWithEmail(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const authUser = this.mapFirebaseUser(userCredential.user);
      await this.saveUserSession(authUser);
      return authUser;
    } catch (error: any) {
      console.error('Email sign-in error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  /**
   * Sign up with email and password
   */
  static async signUpWithEmail(email: string, password: string, displayName?: string): Promise<AuthUser> {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);

      // Update profile with display name if provided
      if (displayName) {
        await userCredential.user.updateProfile({ displayName });
      }

      const authUser = this.mapFirebaseUser(userCredential.user);
      await this.saveUserSession(authUser);
      return authUser;
    } catch (error: any) {
      console.error('Email sign-up error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  /**
   * Sign in with Google (uses Google Sign-In SDK credentials)
   */
  static async signInWithGoogle(idToken: string): Promise<AuthUser> {
    try {
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      const authUser = this.mapFirebaseUser(userCredential.user);
      await this.saveUserSession(authUser);
      return authUser;
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  /**
   * Sign out current user
   */
  static async signOutUser(): Promise<void> {
    try {
      await auth().signOut();
      await this.clearUserSession();
    } catch (error) {
      console.error('Sign-out error:', error);
      throw new Error('Failed to sign out. Please try again.');
    }
  }

  /**
   * Get current authenticated user
   */
  static getCurrentUser(): FirebaseAuthTypes.User | null {
    return auth().currentUser;
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
    return auth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        const authUser = this.mapFirebaseUser(firebaseUser);
        this.saveUserSession(authUser); // Update session
        callback(authUser);
      } else {
        this.clearUserSession();
        callback(null);
      }
    });
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentAuthUser();
    return user !== null;
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
  private static mapFirebaseUser(user: FirebaseAuthTypes.User): AuthUser {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };
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
