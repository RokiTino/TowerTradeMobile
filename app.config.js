/**
 * Expo App Configuration with Supabase Support
 *
 * TowerTrade - Premium real estate investment platform
 */

module.exports = {
  expo: {
    name: 'TowerTrade',
    slug: 'towertrade',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/logo.png',
    scheme: 'towertrade',
    userInterfaceStyle: 'light',
    newArchEnabled: true,

    // iOS Configuration
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.towertrade.app',
      infoPlist: {
        NSFaceIDUsageDescription: 'TowerTrade uses Face ID to secure your investment transactions',
        NSCameraUsageDescription: 'TowerTrade needs camera access for document verification',
        NSPhotoLibraryUsageDescription: 'TowerTrade needs access to your photo library for document uploads',
        CFBundleURLTypes: [
          {
            CFBundleURLSchemes: [
              'towertrade',
              'com.towertrade.app',
            ],
          },
        ],
      },
    },

    // Android Configuration
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/logo.png',
        backgroundColor: '#B08D57',
      },
      package: 'com.towertrade.app',
      permissions: [
        'USE_BIOMETRIC',
        'USE_FINGERPRINT',
        'CAMERA',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
      ],
    },

    // Web Configuration
    web: {
      bundler: 'metro',
      output: 'single',
      favicon: './assets/images/favicon.png',
    },

    // Plugins
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/logo.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#B08D57',
        },
      ],
      // Biometric authentication
      'expo-local-authentication',
    ],

    // Experiments
    experiments: {
      typedRoutes: true,
    },

    // Extra configuration
    // Note: projectId removed to allow EAS to link to fresh "towertrade" project
    // Run 'eas project:init' or 'eas build' to create/link the project
    extra: {
      eas: {
        // projectId will be auto-generated on first EAS build
      },
    },
  },
};
