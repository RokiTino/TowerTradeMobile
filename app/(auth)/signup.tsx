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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Theme';
import TowerTradeLogo from '@/components/TowerTradeLogo';
import SocialLoginButton from '@/components/SocialLoginButton';
import DividerWithText from '@/components/DividerWithText';
import PremiumLoadingOverlay from '@/components/PremiumLoadingOverlay';
import { FirebaseWrapper } from '@/services/firebase/FirebaseWrapper';
import { useAuth } from '@/contexts/AuthContext';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, signInWithGoogle, signInWithFacebook } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Creating account...');

  const handleSignUp = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await signUp(email, password);
      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // Google Sign-In is not available on web
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Google Sign-In is only available on iOS and Android.');
      return;
    }

    if (!FirebaseWrapper.isAvailable()) {
      Alert.alert('Configuration Required', 'Google Sign-In requires Firebase configuration. Please contact support.');
      return;
    }

    setSocialLoading('google');
    setLoadingMessage('Creating account with Google...');
    try {
      // Dynamically import Google Sign-In SDK (only available on native platforms)
      const { GoogleSignin } = require('@react-native-google-signin/google-signin');

      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      // Check if sign-in was successful
      if (response.type === 'cancelled') {
        return; // User cancelled, don't show error
      }

      const idToken = response.data.idToken;
      if (!idToken) {
        throw new Error('Failed to get Google ID token');
      }

      await signInWithGoogle(idToken);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      if (error.code !== '-5') {
        Alert.alert('Google Sign-In Failed', error.message || 'Failed to sign in with Google. Please try again.');
      }
    } finally {
      setSocialLoading(null);
    }
  };

  const handleFacebookSignIn = async () => {
    // Facebook SDK is not available on web
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Facebook Sign-In is only available on iOS and Android.');
      return;
    }

    if (!FirebaseWrapper.isAvailable()) {
      Alert.alert('Configuration Required', 'Facebook Sign-In requires Firebase configuration. Please contact support.');
      return;
    }

    setSocialLoading('facebook');
    setLoadingMessage('Creating account with Facebook...');
    try {
      // Dynamically import Facebook SDK (only available on native platforms)
      const { LoginManager, AccessToken } = require('react-native-fbsdk-next');

      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);

      if (result.isCancelled) {
        throw new Error('User cancelled Facebook login');
      }

      const data = await AccessToken.getCurrentAccessToken();
      if (!data) {
        throw new Error('Failed to get Facebook access token');
      }

      await signInWithFacebook(data.accessToken);
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
          <TowerTradeLogo width={260} />
        </View>

        <Text style={styles.title}>Create Account</Text>

        {/* Form */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder=""
              placeholderTextColor={Colors.textSecondary}
              autoCapitalize="words"
              autoComplete="name"
            />
          </View>

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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder=""
              placeholderTextColor={Colors.textSecondary}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
            />
          </View>

          <TouchableOpacity
            style={[styles.signUpButton, isLoading && styles.signUpButtonDisabled]}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            <Text style={styles.signUpButtonText}>
              {isLoading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
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

        {/* Login Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.loginLink}> Log in</Text>
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
    paddingVertical: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.heading3,
    fontWeight: Typography.bold,
    color: Colors.ebonyBlack,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.md,
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
  signUpButton: {
    backgroundColor: Colors.towerGold,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  signUpButtonDisabled: {
    opacity: 0.6,
  },
  signUpButtonText: {
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
  loginLink: {
    fontSize: Typography.body,
    color: Colors.towerGold,
    fontWeight: Typography.semiBold,
  },
  socialButtonSpacing: {
    height: Spacing.md,
  },
});
