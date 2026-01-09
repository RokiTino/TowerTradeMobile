/**
 * Supabase Client Service
 * Universal Supabase client that works on Web, iOS, and Android
 * Provides authentication, database, and realtime functionality
 */

import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { supabaseUrl, supabaseAnonKey, supabaseCallbackUrl, validateSupabaseConfig } from '@/config/supabase.config';

export class SupabaseService {
  private static client: SupabaseClient | null = null;
  private static initialized = false;

  /**
   * Initialize Supabase client
   */
  static async initialize(): Promise<boolean> {
    if (this.initialized && this.client) {
      console.info('ℹ️  Supabase already initialized');
      return true;
    }

    console.info('🚀 Initializing Supabase Client...');

    // Validate configuration
    const validation = validateSupabaseConfig();
    if (!validation.valid) {
      console.error('❌ Cannot initialize Supabase: Configuration validation failed');
      return false;
    }

    try {
      // Create Supabase client with AsyncStorage for session persistence
      this.client = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: Platform.OS === 'web', // Enable for web to handle OAuth redirects
        },
      });

      this.initialized = true;
      console.info('✅ Supabase client initialized successfully');
      console.info(`📋 Project URL: ${supabaseUrl}`);

      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Supabase:', error);
      return false;
    }
  }

  /**
   * Get Supabase client instance
   */
  static getClient(): SupabaseClient {
    if (!this.client || !this.initialized) {
      throw new Error('Supabase not initialized. Call initialize() first.');
    }
    return this.client;
  }

  /**
   * Check if Supabase is initialized
   */
  static isInitialized(): boolean {
    return this.initialized && this.client !== null;
  }

  /**
   * Get current session
   */
  static async getSession(): Promise<Session | null> {
    if (!this.client) return null;

    try {
      const { data, error } = await this.client.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
        return null;
      }
      return data.session;
    } catch (error) {
      console.error('Exception getting session:', error);
      return null;
    }
  }

  /**
   * Get current user
   */
  static async getUser(): Promise<User | null> {
    if (!this.client) return null;

    try {
      const { data, error } = await this.client.auth.getUser();
      if (error) {
        console.error('Error getting user:', error);
        return null;
      }
      return data.user;
    } catch (error) {
      console.error('Exception getting user:', error);
      return null;
    }
  }

  /**
   * Sign in with email and password
   */
  static async signInWithEmail(email: string, password: string) {
    if (!this.client) {
      throw new Error('Supabase not initialized');
    }

    console.info('🔐 Signing in with email:', email);

    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Email sign-in error:', error);
      throw error;
    }

    console.info('✅ Email sign-in successful');
    return data;
  }

  /**
   * Sign up with email and password
   */
  static async signUpWithEmail(email: string, password: string, displayName?: string) {
    if (!this.client) {
      throw new Error('Supabase not initialized');
    }

    console.info('📝 Signing up with email:', email);

    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || email.split('@')[0],
        },
      },
    });

    if (error) {
      console.error('❌ Email sign-up error:', error);
      throw error;
    }

    console.info('✅ Email sign-up successful');
    return data;
  }

  /**
   * Sign in with Google OAuth
   * Universal method that works on Web, iOS, and Android
   * ALWAYS uses Supabase cloud callback URL to ensure proper OAuth flow
   */
  static async signInWithGoogle() {
    if (!this.client) {
      const initError = new Error('Supabase not initialized');
      console.error('❌ Google Sign-In Error: Supabase client not initialized');
      throw initError;
    }

    console.info('🔐 Starting Google Sign-In with Supabase...');
    console.info('📱 Platform:', Platform.OS);
    console.info('🌐 Supabase URL:', supabaseUrl);
    console.info('🔗 Forced Callback URL:', supabaseCallbackUrl);

    try {
      // CRITICAL UNDERSTANDING:
      // - redirectTo = Where the USER is redirected AFTER successful OAuth (your app's page)
      // - Supabase callback URL = Where GOOGLE sends the OAuth code (configured in Google Console)
      //
      // OAuth Flow:
      // 1. User clicks "Sign in with Google"
      // 2. App redirects to Google OAuth page
      // 3. User authenticates with Google
      // 4. Google sends OAuth code to Supabase callback URL (handled by Supabase)
      // 5. Supabase processes the code and redirects to YOUR redirectTo URL with session tokens

      let redirectTo: string;
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

      if (Platform.OS === 'web') {
        // For web: Redirect back to the callback page in YOUR app
        // This should be a page that exists in your app (like /auth/callback)
        redirectTo = `${currentOrigin}/(auth)/callback`;
        console.info('🌐 Web: User will be redirected to:', redirectTo);
        console.info('🌐 Web: Current origin:', currentOrigin);
      } else {
        // For mobile: Use deep link to return to app after OAuth
        // The app will handle this URL and navigate to the callback route
        redirectTo = 'towertrade://auth/callback';
        console.info('📱 Mobile: Deep link redirect:', redirectTo);
      }

      // Enhanced logging for debugging
      console.info('📋 OAuth Flow Configuration:');
      console.info('  → Platform:', Platform.OS);
      console.info('  → User redirectTo (where user goes after auth):', redirectTo);
      console.info('  → Supabase Project URL:', supabaseUrl);
      console.info('  → Google will send OAuth code to:', `${supabaseUrl}/auth/v1/callback`);

      const oauthOptions = {
        provider: 'google' as const,
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: Platform.OS !== 'web', // For mobile, don't auto-redirect
        },
      };

      console.info('🔧 Full OAuth options:', JSON.stringify(oauthOptions, null, 2));

      const { data, error } = await this.client.auth.signInWithOAuth(oauthOptions);

      // Comprehensive error logging
      if (error) {
        console.error('❌ Google OAuth Error - COMPREHENSIVE DETAILS:');
        console.error('📋 Error object:', JSON.stringify(error, null, 2));
        console.error('📋 Error message:', error.message);
        console.error('📋 Error name:', error.name);
        console.error('📋 Error status:', (error as any).status);
        console.error('📋 Error code:', (error as any).code);
        console.error('📋 Error description:', (error as any).description);
        console.error('📋 Error hint:', (error as any).hint);
        console.error('📋 Full error:', error);

        // Throw with enhanced error message
        const enhancedError = new Error(
          error.message || 'Failed to initiate Google Sign-In'
        );
        (enhancedError as any).originalError = error;
        (enhancedError as any).code = (error as any).code;
        (enhancedError as any).status = (error as any).status;
        throw enhancedError;
      }

      console.info('✅ Google OAuth initiated successfully');
      console.info('📋 OAuth data:', JSON.stringify(data, null, 2));
      console.info('📋 OAuth URL:', data.url);
      console.info('📋 OAuth provider:', data.provider);

      return data;
    } catch (error: any) {
      console.error('❌ Exception in signInWithGoogle:');
      console.error('📋 Exception type:', typeof error);
      console.error('📋 Exception message:', error?.message);
      console.error('📋 Exception stack:', error?.stack);
      console.error('📋 Exception object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      throw error;
    }
  }

  /**
   * Sign out current user
   */
  static async signOut() {
    if (!this.client) {
      throw new Error('Supabase not initialized');
    }

    console.info('🚪 Signing out...');

    const { error } = await this.client.auth.signOut();

    if (error) {
      console.error('❌ Sign-out error:', error);
      throw error;
    }

    console.info('✅ Signed out successfully');
  }

  /**
   * Listen to authentication state changes
   */
  static onAuthStateChange(callback: (session: Session | null, user: User | null) => void) {
    if (!this.client) {
      console.warn('Supabase not initialized for auth state listener');
      return { data: { subscription: { unsubscribe: () => {} } } };
    }

    return this.client.auth.onAuthStateChange((_event, session) => {
      callback(session, session?.user || null);
    });
  }

  /**
   * Reset Supabase client (for testing or logout)
   */
  static reset() {
    this.client = null;
    this.initialized = false;
    console.info('🔄 Supabase client reset');
  }
}
