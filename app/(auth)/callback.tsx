/**
 * OAuth Callback Handler
 * Handles the redirect after Google OAuth authentication
 * Shows AI Market Snapshot greeting before navigating to main app
 * Premium Tower Gold aesthetic with comprehensive error handling
 */

import { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Typography, Spacing } from '@/constants/Theme';
import { useAuth } from '@/contexts/AuthContext';
import AIMarketSnapshot from '@/components/AIMarketSnapshot';
import ElegantAlert from '@/components/ElegantAlert';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, isLoading } = useAuth();
  const [showMarketSnapshot, setShowMarketSnapshot] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Completing authentication...');
  const [errorAlert, setErrorAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'error' | 'warning' | 'info';
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'error',
  });

  useEffect(() => {
    console.info('🔄 Callback Screen: Mounted');
    console.info('📋 Platform:', Platform.OS);
    console.info('📋 URL Params:', JSON.stringify(params, null, 2));
    console.info('📋 User:', user ? 'authenticated' : 'not authenticated');
    console.info('📋 isLoading:', isLoading);

    // Check for OAuth errors in URL parameters
    if (params.error) {
      console.error('❌ OAuth error in URL:', params.error);
      console.error('📋 Error description:', params.error_description);

      setErrorAlert({
        visible: true,
        title: 'Authentication Error',
        message: `OAuth error: ${params.error_description || params.error}`,
        type: 'error',
      });

      // Redirect to login after showing error
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 3000);

      return;
    }

    // Wait for auth state to be determined
    if (!isLoading) {
      if (user) {
        // User is authenticated, show market snapshot greeting
        console.info('✅ OAuth callback: User authenticated');
        console.info('📋 User ID:', user.uid);
        console.info('📋 User email:', user.email);

        setLoadingMessage('Authentication successful!');

        setTimeout(() => {
          setShowMarketSnapshot(true);
        }, 500);
      } else {
        // No user found after OAuth flow completed
        console.warn('⚠️  OAuth callback: No user found after auth flow');

        // Give Supabase a moment to establish the session
        const timeout = setTimeout(() => {
          if (!user) {
            console.error('❌ OAuth callback: Session not established, redirecting to login');

            setErrorAlert({
              visible: true,
              title: 'Session Error',
              message: 'Failed to establish authentication session. Please try again.',
              type: 'warning',
            });

            setTimeout(() => {
              router.replace('/(auth)/login');
            }, 2000);
          }
        }, 2000);

        return () => clearTimeout(timeout);
      }
    }
  }, [user, isLoading, params, router]);

  const handleCloseMarketSnapshot = () => {
    console.info('✅ Closing market snapshot, navigating to main app');
    setShowMarketSnapshot(false);
    // Navigate to main app after closing market snapshot
    router.replace('/(tabs)');
  };

  const dismissErrorAlert = () => {
    setErrorAlert({
      visible: false,
      title: '',
      message: '',
      type: 'error',
    });
    router.replace('/(auth)/login');
  };

  return (
    <>
      <View style={styles.container}>
        {/* Premium Tower Gold loading indicator */}
        <ActivityIndicator size="large" color={Colors.towerGold} />

        <Text style={styles.message}>{loadingMessage}</Text>
        <Text style={styles.subMessage}>
          {isLoading ? 'Please wait...' : 'Preparing your experience...'}
        </Text>
      </View>

      {/* AI Market Snapshot Modal - Premium greeting */}
      <AIMarketSnapshot
        visible={showMarketSnapshot}
        onClose={handleCloseMarketSnapshot}
        userName={user?.displayName || user?.email?.split('@')[0]}
      />

      {/* Elegant Error Alert - Tower Gold branding */}
      <ElegantAlert
        visible={errorAlert.visible}
        title={errorAlert.title}
        message={errorAlert.message}
        type={errorAlert.type}
        onDismiss={dismissErrorAlert}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.pureWhite,
    paddingHorizontal: Spacing.xl,
  },
  message: {
    marginTop: Spacing.xl,
    fontSize: Typography.heading3,
    fontWeight: Typography.semiBold,
    color: Colors.ebonyBlack,
    textAlign: 'center',
  },
  subMessage: {
    marginTop: Spacing.sm,
    fontSize: Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
