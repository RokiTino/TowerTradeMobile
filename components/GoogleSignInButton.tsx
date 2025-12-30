/**
 * Google Sign-In Button Component
 * Premium styled button for Google authentication
 * Platform-guarded to prevent loading native modules on web
 */

import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Theme';
import { useAuth } from '@/contexts/AuthContext';
import { FirebaseWrapper } from '@/services/firebase/FirebaseWrapper';

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  divider?: boolean;
}

export default function GoogleSignInButton({ onSuccess, onError, divider = false }: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const { signInWithGoogle } = useAuth();

  useEffect(() => {
    // Google Sign-In is only available on native platforms with Firebase
    setIsAvailable(Platform.OS !== 'web' && FirebaseWrapper.isAvailable());
  }, []);

  const handleGoogleSignIn = async () => {
    if (!isAvailable) {
      Alert.alert(
        'Firebase Required',
        'Google Sign-In requires Firebase configuration. Please add google-services.json (Android) or GoogleService-Info.plist (iOS) to enable this feature.'
      );
      return;
    }

    try {
      setIsLoading(true);

      // Dynamically import Google Sign-In SDK (only available on native platforms)
      const { GoogleSignin } = require('@react-native-google-signin/google-signin');

      // Configure Google Sign-In (this should ideally be done once at app startup)
      await GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
        offlineAccess: true,
      });

      // Check if Google Play Services are available (Android)
      await GoogleSignin.hasPlayServices();

      // Sign in with Google
      const userInfo = await GoogleSignin.signIn();

      // Get ID token
      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        throw new Error('No ID token received from Google Sign-In');
      }

      // Authenticate with Firebase using the Google ID token
      await signInWithGoogle(idToken);

      onSuccess?.();
    } catch (error: any) {
      console.error('Google Sign-In error:', error);

      let errorMessage = 'Failed to sign in with Google. Please try again.';

      if (error.code === 'SIGN_IN_CANCELLED') {
        errorMessage = 'Sign-in was cancelled.';
      } else if (error.code === 'IN_PROGRESS') {
        errorMessage = 'Sign-in is already in progress.';
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        errorMessage = 'Google Play Services not available.';
      }

      Alert.alert('Sign-In Error', errorMessage);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if Firebase is not available
  if (!isAvailable) {
    return null;
  }

  return (
    <>
      {/* Divider */}
      {divider && (
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleGoogleSignIn}
        disabled={isLoading}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.ebonyBlack} />
        ) : (
          <View style={styles.buttonContent}>
            <Ionicons name="logo-google" size={20} color={Colors.ebonyBlack} />
            <Text style={styles.buttonText}>Continue with Google</Text>
          </View>
        )}
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.pureWhite,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.softSlate,
    shadowColor: Colors.ebonyBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  buttonText: {
    color: Colors.ebonyBlack,
    fontSize: Typography.body,
    fontWeight: Typography.semiBold,
    letterSpacing: 0.3,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.softSlate,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
  },
});
