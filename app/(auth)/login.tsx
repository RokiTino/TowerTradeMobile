import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Theme';
import { useAuth } from '@/contexts/AuthContext';
import SocialLoginButton from '@/components/SocialLoginButton';
import DividerWithText from '@/components/DividerWithText';
import PremiumLoadingOverlay from '@/components/PremiumLoadingOverlay';
import AIMarketSnapshot from '@/components/AIMarketSnapshot';
import ElegantAlert from '@/components/ElegantAlert';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signInWithGoogle, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Authenticating...');
  const [showMarketSnapshot, setShowMarketSnapshot] = useState(false);

  // Elegant error alert state
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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email, password);
      // Show AI Market Snapshot after successful login
      setShowMarketSnapshot(true);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    console.info('🚀 Login Screen: Starting Google Sign-In flow...');
    setSocialLoading('google');
    setLoadingMessage('Signing in with Google...');

    try {
      console.info('📞 Login Screen: Calling AuthContext.signInWithGoogle()...');

      // Universal Google Sign-In (works on all platforms)
      await signInWithGoogle();

      console.info('✅ Login Screen: signInWithGoogle() completed successfully');

      // Show AI Market Snapshot after successful login
      setShowMarketSnapshot(true);
    } catch (error: any) {
      console.error('❌ Login Screen: Google Sign-In Error caught');
      console.error('📋 Error type:', typeof error);
      console.error('📋 Error message:', error?.message);
      console.error('📋 Error code:', error?.code);
      console.error('📋 Error name:', error?.name);
      console.error('📋 Error stack:', error?.stack);
      console.error('📋 Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));

      // Handle OAuth flow initiated (expected behavior - don't show error)
      if (error.message?.includes('OAuth flow initiated') || error.message?.includes('wait for redirect')) {
        console.info('✅ OAuth flow initiated successfully, waiting for redirect');
        // Keep loading state while redirect happens
        return;
      }

      // Handle user cancellation gracefully (don't show any alert)
      if (error.message?.includes('cancelled') || error.message?.includes('canceled') || error.code === '-5') {
        console.info('ℹ️  User cancelled OAuth flow');
        setSocialLoading(null);
        return;
      }

      // Determine alert type and message based on error details
      let alertType: 'error' | 'warning' | 'info' = 'error';
      let alertTitle = 'Google Sign-In Failed';
      let alertMessage = error.message || 'Failed to sign in with Google. Please try again.';

      // Handle Supabase configuration error with warning style
      if (error.message?.includes('configuration') || error.message?.includes('not initialized')) {
        alertType = 'warning';
        alertTitle = 'Configuration Required';
        alertMessage = 'Google Sign-In requires Supabase configuration. Please contact support.';
      }

      // Handle network errors
      if (error.message?.includes('network') || error.message?.includes('Network')) {
        alertType = 'warning';
        alertTitle = 'Network Error';
        alertMessage = 'Unable to connect. Please check your internet connection and try again.';
      }

      // Handle authentication page errors
      if (error.message?.includes('Unable to open authentication page')) {
        alertType = 'error';
        alertTitle = 'Cannot Open Browser';
        alertMessage = 'Unable to open the authentication page. Please check your device settings.';
      }

      // Handle OAuth URL generation errors
      if (error.message?.includes('Failed to generate') || error.message?.includes('No OAuth URL')) {
        alertType = 'error';
        alertTitle = 'OAuth Configuration Error';
        alertMessage = 'Failed to generate authentication URL. Please check Google Cloud Console configuration.';
      }

      // Handle generic authentication failures
      if (error.message?.includes('Failed to initiate') || error.message?.includes('Failed to sign in')) {
        alertType = 'error';
        alertTitle = 'Authentication Failed';
        alertMessage = `${error.message}\n\nPlease ensure:\n• Google OAuth is configured in Google Cloud Console\n• Authorized redirect URIs are set correctly\n• Supabase is properly initialized`;
      }

      console.error('💬 Displaying error alert:', { alertTitle, alertMessage, alertType });

      // Show elegant Tower Gold themed alert
      setErrorAlert({
        visible: true,
        title: alertTitle,
        message: alertMessage,
        type: alertType,
      });

      // Clear loading state
      setSocialLoading(null);
    }
  };

  const dismissErrorAlert = () => {
    setErrorAlert({
      visible: false,
      title: '',
      message: '',
      type: 'error',
    });
  };

  const handleCloseMarketSnapshot = () => {
    setShowMarketSnapshot(false);
    // Navigate to main app after closing market snapshot
    router.replace('/(tabs)');
  };


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo and Branding */}
        <View style={styles.header}>
          <Image source={require('@/assets/images/logo.png')} style={{ width: 200, height: 80, resizeMode: 'contain' }} />
        </View>

        {/* Sign In Header */}
        <Text style={styles.title}>Sign In</Text>

        {/* Form */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder=""
              placeholderTextColor={Colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder=""
              placeholderTextColor={Colors.textSecondary}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
            />
          </View>

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => Alert.alert('Forgot Password', 'Password reset functionality coming soon')}
          >
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'LOGGING IN...' : 'LOG IN'}
            </Text>
          </TouchableOpacity>

          {/* Social Login Section */}
          <>
            <DividerWithText text="or continue with" />

            <SocialLoginButton
              provider="google"
              onPress={handleGoogleSignIn}
              loading={socialLoading === 'google'}
              disabled={socialLoading !== null}
            />
          </>
        </View>

        {/* Sign Up Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don&apos;t have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text style={styles.signUpLink}> Sign up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Premium Loading Overlay */}
      <PremiumLoadingOverlay visible={socialLoading !== null} message={loadingMessage} />

      {/* AI Market Snapshot Modal */}
      <AIMarketSnapshot
        visible={showMarketSnapshot}
        onClose={handleCloseMarketSnapshot}
        userName={user?.displayName || user?.email?.split('@')[0]}
      />

      {/* Elegant Error Alert */}
      <ElegantAlert
        visible={errorAlert.visible}
        title={errorAlert.title}
        message={errorAlert.message}
        type={errorAlert.type}
        onDismiss={dismissErrorAlert}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.pureWhite,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: Typography.bold,
    color: Colors.ebonyBlack,
    marginBottom: Spacing.xl,
  },
  formContainer: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.body,
    color: Colors.ebonyBlack,
    marginBottom: Spacing.sm,
    fontWeight: Typography.medium,
  },
  input: {
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.body,
    color: Colors.ebonyBlack,
    borderWidth: 1,
    borderColor: Colors.softSlate,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.xl,
  },
  forgotPasswordText: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
  },
  loginButton: {
    backgroundColor: Colors.towerGold,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: Colors.pureWhite,
    fontSize: Typography.body,
    fontWeight: Typography.bold,
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: Typography.body,
    color: Colors.ebonyBlack,
  },
  signUpLink: {
    fontSize: Typography.body,
    color: Colors.towerGold,
    fontWeight: Typography.semiBold,
  },
  socialButtonSpacing: {
    height: Spacing.md,
  },
});
