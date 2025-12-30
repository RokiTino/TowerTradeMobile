/**
 * Expo App Configuration with Firebase Support
 * This file extends app.json and adds platform-specific Firebase configurations
 */

const fs = require('fs');
const path = require('path');

// Check if Firebase configuration files exist
const hasAndroidConfig = fs.existsSync(path.join(__dirname, 'android', 'google-services.json'));
const hasIosConfig = fs.existsSync(path.join(__dirname, 'ios', 'GoogleService-Info.plist'));

module.exports = {
  expo: {
    name: 'TowerTrade',
    slug: 'towertrade',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'towertrade',
    userInterfaceStyle: 'light', // Premium feel with consistent theme
    newArchEnabled: true,

    // iOS Configuration
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.towertrade.app',
      // Add GoogleService-Info.plist if it exists
      ...(hasIosConfig && {
        googleServicesFile: './ios/GoogleService-Info.plist',
      }),
      infoPlist: {
        NSFaceIDUsageDescription: 'TowerTrade uses Face ID to secure your investment transactions',
        NSCameraUsageDescription: 'TowerTrade needs camera access for document verification',
        NSPhotoLibraryUsageDescription: 'TowerTrade needs access to your photo library for document uploads',
      },
    },

    // Android Configuration
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#B08D57', // Tower Gold
      },
      package: 'com.towertrade.app',
      // Add google-services.json if it exists
      ...(hasAndroidConfig && {
        googleServicesFile: './android/google-services.json',
      }),
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
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#B08D57', // Tower Gold
        },
      ],
      // Firebase plugins (only if config files exist)
      ...(hasAndroidConfig || hasIosConfig
        ? [
            '@react-native-firebase/app',
            '@react-native-firebase/auth',
            '@react-native-firebase/firestore',
          ]
        : []),
      // Biometric authentication
      'expo-local-authentication',
    ],

    // Experiments
    experiments: {
      typedRoutes: true,
    },

    // Extra configuration
    extra: {
      firebaseEnabled: hasAndroidConfig || hasIosConfig,
      backendType: hasAndroidConfig || hasIosConfig ? 'firebase' : 'local',
      eas: {
        projectId: 'your-eas-project-id', // Update this when you have an EAS project
      },
    },
  },
};
