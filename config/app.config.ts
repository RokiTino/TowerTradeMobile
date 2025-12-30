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
  // Start with local storage, switch to Firebase when configured
  backendType: 'local',
  firebaseEnabled: false,
  supabaseEnabled: false,

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
 * Check if Firebase is available and configured
 */
export function isFirebaseConfigured(): boolean {
  // In a real app, this would check if Firebase credentials exist
  // For now, return false until user adds google-services files
  return false;
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
