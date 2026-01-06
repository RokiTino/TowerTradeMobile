/**
 * Supabase Client Service
 * Universal Supabase client that works on Web, iOS, and Android
 * Provides authentication, database, and realtime functionality
 */

import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabaseUrl, supabaseAnonKey, validateSupabaseConfig } from '@/config/supabase.config';

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
          detectSessionInUrl: false,
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
   */
  static async signInWithGoogle() {
    if (!this.client) {
      throw new Error('Supabase not initialized');
    }

    console.info('🔐 Starting Google Sign-In with Supabase...');

    const { data, error } = await this.client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window?.location?.origin || 'exp://localhost:8081',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('❌ Google OAuth error:', error);
      throw error;
    }

    console.info('✅ Google OAuth initiated successfully');
    return data;
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
