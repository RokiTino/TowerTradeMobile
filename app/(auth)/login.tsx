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
import { FirebaseWrapper } from '@/services/firebase/FirebaseWrapper';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signInWithGoogle, signInWithFacebook } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Authenticating...');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email, password);
      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!FirebaseWrapper.isAvailable()) {
      Alert.alert('Configuration Required', 'Google Sign-In requires Firebase configuration. Please contact support.');
      return;
    }

    setSocialLoading('google');
    setLoadingMessage('Signing in with Google...');
    try {
      // Configure Google Sign-In
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      // Check if sign-in was successful
      if (response.type === 'cancelled') {
        return; // User cancelled, don't show error
      }

      // Get the ID token from the User data
      const idToken = response.data.idToken;
      if (!idToken) {
        throw new Error('Failed to get Google ID token');
      }

      // Sign in with Firebase using the ID token
      await signInWithGoogle(idToken);

      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      if (error.code !== '-5') { // -5 is user cancellation
        Alert.alert('Google Sign-In Failed', error.message || 'Failed to sign in with Google. Please try again.');
      }
    } finally {
      setSocialLoading(null);
    }
  };

  const handleFacebookSignIn = async () => {
    if (!FirebaseWrapper.isAvailable()) {
      Alert.alert('Configuration Required', 'Facebook Sign-In requires Firebase configuration. Please contact support.');
      return;
    }

    setSocialLoading('facebook');
    setLoadingMessage('Signing in with Facebook...');
    try {
      // Request Facebook login with permissions
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);

      if (result.isCancelled) {
        throw new Error('User cancelled Facebook login');
      }

      // Get the access token
      const data = await AccessToken.getCurrentAccessToken();
      if (!data) {
        throw new Error('Failed to get Facebook access token');
      }

      // Sign in with Firebase using the access token
      await signInWithFacebook(data.accessToken);

      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Facebook Sign-In Error:', error);
      if (error.message !== 'User cancelled Facebook login') {
        Alert.alert('Facebook Sign-In Failed', error.message || 'Failed to sign in with Facebook. Please try again.');
      }
    } finally {
      setSocialLoading(null);
    }
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
          <Image source={require('@/assets/images/logo.png')} style={{ marginTop: 12, width: 250, height: 220, resizeMode: 'contain' }} />
        </View>

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

          {/* Social Login Section (only shows if Firebase is available) */}
          {FirebaseWrapper.isAvailable() && (
            <>
              <DividerWithText text="or continue with" />

              <SocialLoginButton
                provider="google"
                onPress={handleGoogleSignIn}
                loading={socialLoading === 'google'}
                disabled={socialLoading !== null}
              />

              <View style={styles.socialButtonSpacing} />

              <SocialLoginButton
                provider="facebook"
                onPress={handleFacebookSignIn}
                loading={socialLoading === 'facebook'}
                disabled={socialLoading !== null}
              />
            </>
          )}
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
    marginBottom: Spacing.xxl,
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
