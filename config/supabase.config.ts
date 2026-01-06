/**
 * Supabase Configuration
 * Universal configuration for Supabase client
 * Works across Web, iOS, and Android platforms
 */

// Supabase credentials
export const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ovfpvoxvciijexylyndg.supabase.co';
export const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_IlXQ-4LI8tFz17AYhiD0Zg_qK1MG4rQ';

// Google OAuth configuration
export const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '253066400729-ci4vlbmo1mthqbgd7lt202r42lda9jom.apps.googleusercontent.com';

// Supabase OAuth callback URL
export const supabaseCallbackUrl = process.env.EXPO_PUBLIC_SUPABASE_CALLBACK_URL || 'https://ovfpvoxvciijexylyndg.supabase.co/auth/v1/callback';

// Validate configuration
export const validateSupabaseConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!supabaseUrl || supabaseUrl.includes('your-project')) {
    errors.push('Invalid Supabase URL');
  }

  if (!supabaseAnonKey || supabaseAnonKey.includes('your-anon-key')) {
    errors.push('Invalid Supabase Anon Key');
  }

  if (!googleWebClientId || googleWebClientId.includes('your-client-id')) {
    errors.push('Invalid Google Web Client ID');
  }

  if (errors.length > 0) {
    console.error('❌ Supabase Configuration Errors:', errors);
    return { valid: false, errors };
  }

  console.info('✅ Supabase configuration validated successfully');
  return { valid: true, errors: [] };
};
