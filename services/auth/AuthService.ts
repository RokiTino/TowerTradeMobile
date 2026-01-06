/**
 * Supabase Authentication Service
 * Handles email/password and Google Sign-In authentication using Supabase
 * Universal support for Web, iOS, and Android platforms
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { SupabaseService } from '../supabase/SupabaseClient';
import { User, Session } from '@supabase/supabase-js';

const AUTH_TOKEN_KEY = '@towertrade_auth_token';
const USER_DATA_KEY = '@towertrade_user_data';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

/**
 * Supabase Authentication Service
 */
export class AuthService {
  /**
   * Check if Supabase is available
   */
  static isSupabaseAvailable(): boolean {
    return SupabaseService.isInitialized();
  }

  /**
   * Sign in with email and password
   */
  static async signInWithEmail(email: string, password: string): Promise<AuthUser> {
    if (!this.isSupabaseAvailable()) {
      throw new Error('Supabase not initialized');
    }

    try {
      console.info('🔐 AuthService: Signing in with email...');
      const { user, session } = await SupabaseService.signInWithEmail(email, password);

      if (!user) {
        throw new Error('Sign-in failed: No user returned');
      }

      const authUser = this.mapSupabaseUser(user);
      await this.saveUserSession(authUser, session?.access_token);

      console.info('✅ AuthService: Email sign-in successful');
      return authUser;
    } catch (error: any) {
      console.error('❌ AuthService: Email sign-in error:', error);
      throw new Error(this.getAuthErrorMessage(error));
    }
  }

  /**
   * Sign up with email and password
   */
  static async signUpWithEmail(email: string, password: string, displayName?: string): Promise<AuthUser> {
    if (!this.isSupabaseAvailable()) {
      throw new Error('Supabase not initialized');
    }

    try {
      console.info('📝 AuthService: Signing up with email...');
      const { user, session } = await SupabaseService.signUpWithEmail(email, password, displayName);

      if (!user) {
        throw new Error('Sign-up failed: No user returned');
      }

      const authUser = this.mapSupabaseUser(user);
      await this.saveUserSession(authUser, session?.access_token);

      console.info('✅ AuthService: Email sign-up successful');
      return authUser;
    } catch (error: any) {
      console.error('❌ AuthService: Email sign-up error:', error);
      throw new Error(this.getAuthErrorMessage(error));
    }
  }

  /**
   * Sign in with Google (universal - works on web and native)
   */
  static async signInWithGoogle(): Promise<AuthUser> {
    console.info('🔐 AuthService: Starting Google Sign-In...');

    if (!this.isSupabaseAvailable()) {
      const errorMsg = 'Supabase is not initialized. Google Sign-In requires Supabase configuration.';
      console.error('❌ AuthService Error:', errorMsg);
      throw new Error('Google Sign-In requires Supabase configuration');
    }

    try {
      console.info('🔄 AuthService: Delegating to SupabaseService...');

      // Supabase handles OAuth universally
      const { url } = await SupabaseService.signInWithGoogle();

      if (url) {
        // On web, this will redirect to Google OAuth
        // On native, we need to handle the URL differently
        console.info('🌐 Google OAuth URL generated:', url);

        // For web, open the OAuth URL
        if (typeof window !== 'undefined') {
          window.location.href = url;
        }
      }

      // The actual user data will come through the auth state change listener
      // For now, we throw an error to indicate the flow is in progress
      throw new Error('OAuth flow initiated. Please wait for redirect...');
    } catch (error: any) {
      // Enhanced error logging
      console.error('❌ AuthService: Google Sign-In failed');
      console.error('📋 Error details:', {
        message: error.message,
        code: error.code,
        name: error.name,
      });

      // If this is the "flow initiated" message, re-throw it
      if (error.message?.includes('OAuth flow initiated')) {
        throw error;
      }

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
      console.info('🚪 AuthService: Signing out...');

      if (this.isSupabaseAvailable()) {
        await SupabaseService.signOut();
      }

      await this.clearUserSession();
      console.info('✅ AuthService: Sign-out complete');
    } catch (error) {
      console.error('❌ AuthService: Sign-out error:', error);
      throw new Error('Failed to sign out. Please try again.');
    }
  }

  /**
   * Get current authenticated user
   */
  static async getCurrentUser(): Promise<User | null> {
    if (!this.isSupabaseAvailable()) {
      return null;
    }

    try {
      return await SupabaseService.getUser();
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Get current user as AuthUser format
   */
  static async getCurrentAuthUser(): Promise<AuthUser | null> {
    const user = await this.getCurrentUser();
    if (user) {
      return this.mapSupabaseUser(user);
    }

    // Try to restore from session
    return await this.restoreUserSession();
  }

  /**
   * Listen to authentication state changes
   */
  static onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    if (!this.isSupabaseAvailable()) {
      console.warn('⚠️  Supabase not available for auth state listener');
      this.restoreUserSession().then((user) => {
        callback(user);
      });
      return () => {}; // No-op unsubscribe
    }

    try {
      const { data } = SupabaseService.onAuthStateChange((session, user) => {
        if (user && session) {
          const authUser = this.mapSupabaseUser(user);
          this.saveUserSession(authUser, session.access_token); // Update session
          callback(authUser);
        } else {
          this.clearUserSession();
          callback(null);
        }
      });

      // Return unsubscribe function
      return () => {
        data.subscription.unsubscribe();
      };
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
   * Save user session to AsyncStorage for persistence
   */
  private static async saveUserSession(user: AuthUser, accessToken?: string): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
      if (accessToken) {
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, accessToken);
      }
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
   * Map Supabase User to AuthUser
   */
  private static mapSupabaseUser(user: User): AuthUser {
    return {
      uid: user.id,
      email: user.email || null,
      displayName: user.user_metadata?.display_name || user.email?.split('@')[0] || null,
      photoURL: user.user_metadata?.avatar_url || null,
    };
  }

  /**
   * Get user-friendly error messages for Google Sign-In
   */
  private static getGoogleSignInErrorMessage(error: any): string {
    const errorMessage = error.message?.toLowerCase() || '';

    // Handle common Google Sign-In errors
    if (errorMessage.includes('cancelled') || errorMessage.includes('canceled')) {
      return 'Sign-in cancelled';
    }

    if (errorMessage.includes('network')) {
      return 'Network error. Please check your connection and try again.';
    }

    if (errorMessage.includes('configuration') || errorMessage.includes('not initialized')) {
      return 'Google Sign-In is not properly configured. Please contact support.';
    }

    if (errorMessage.includes('invalid')) {
      return 'Invalid credentials. Please try again.';
    }

    // Return the original message if it's user-friendly
    if (errorMessage && errorMessage.length < 100) {
      return error.message;
    }

    return 'Failed to sign in with Google. Please try again.';
  }

  /**
   * Get user-friendly error messages for auth operations
   */
  private static getAuthErrorMessage(error: any): string {
    const errorMessage = error.message?.toLowerCase() || '';
    const errorCode = error.code || '';

    // Supabase-specific error codes
    const errorMessages: Record<string, string> = {
      'invalid_credentials': 'Invalid email or password.',
      'email_not_confirmed': 'Please verify your email before signing in.',
      'user_not_found': 'No account found with this email.',
      'email_exists': 'An account with this email already exists.',
      'weak_password': 'Password should be at least 6 characters.',
      'network_error': 'Network error. Please check your connection.',
      'too_many_requests': 'Too many attempts. Please try again later.',
    };

    // Check for specific error codes
    if (errorCode && errorMessages[errorCode]) {
      return errorMessages[errorCode];
    }

    // Check for error message patterns
    if (errorMessage.includes('invalid') && errorMessage.includes('password')) {
      return 'Invalid email or password.';
    }

    if (errorMessage.includes('email') && errorMessage.includes('exists')) {
      return 'An account with this email already exists.';
    }

    if (errorMessage.includes('weak') || errorMessage.includes('password')) {
      return 'Password should be at least 6 characters.';
    }

    if (errorMessage.includes('network')) {
      return 'Network error. Please check your connection.';
    }

    // Return original message if it seems user-friendly
    if (error.message && error.message.length < 100) {
      return error.message;
    }

    return 'Authentication failed. Please try again.';
  }
}
