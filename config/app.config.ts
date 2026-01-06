/**
 * TowerTrade Application Configuration
 * Central configuration for backend services and features
 */

export type BackendType = 'local' | 'firebase' | 'supabase';

export interface AppConfig {
  // Backend Configuration
  backendType: BackendType;
  firebaseEnabled: boolean;
  supabaseEnabled: boolean;

  // Feature Flags
  features: {
    aiPortfolioCounselor: boolean;
    biometricAuth: boolean;
    slideToPayEnabled: boolean;
    offlineMode: boolean;
  };

  // Environment
  environment: 'development' | 'staging' | 'production';
}

/**
 * Default Configuration
 * Can be overridden by environment variables
 */
export const defaultConfig: AppConfig = {
  // Use Supabase as default backend
  backendType: 'supabase',
  firebaseEnabled: false,
  supabaseEnabled: true,

  features: {
    aiPortfolioCounselor: true,
    biometricAuth: true,
    slideToPayEnabled: true,
    offlineMode: true,
  },

  environment: __DEV__ ? 'development' : 'production',
};

/**
 * Get current configuration
 * This can be extended to read from environment variables
 */
export function getAppConfig(): AppConfig {
  return {
    ...defaultConfig,
    // Override with environment variables if needed
    // backendType: process.env.EXPO_PUBLIC_BACKEND_TYPE as BackendType || defaultConfig.backendType,
  };
}

/**
 * Check if Supabase is available and configured
 */
export function isSupabaseConfigured(): boolean {
  // Check if Supabase environment variables are set
  return !!(
    process.env.EXPO_PUBLIC_SUPABASE_URL &&
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Update configuration dynamically (for settings screen)
 */
let currentConfig = getAppConfig();

export function updateAppConfig(updates: Partial<AppConfig>): void {
  currentConfig = {
    ...currentConfig,
    ...updates,
  };
}

export function getCurrentConfig(): AppConfig {
  return currentConfig;
}
