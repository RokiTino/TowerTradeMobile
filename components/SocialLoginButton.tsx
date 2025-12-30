/**
 * Premium Social Login Button Component
 * High-end styled buttons for Google, Facebook social authentication
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Theme';

type SocialProvider = 'google' | 'facebook';

interface SocialLoginButtonProps {
  provider: SocialProvider;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const providerConfig = {
  google: {
    icon: 'logo-google' as const,
    text: 'Continue with Google',
    backgroundColor: Colors.pureWhite,
    textColor: Colors.ebonyBlack,
    iconColor: '#4285F4', // Google Blue
    borderColor: Colors.softSlate,
  },
  facebook: {
    icon: 'logo-facebook' as const,
    text: 'Continue with Facebook',
    backgroundColor: '#1877F2', // Facebook Blue
    textColor: Colors.pureWhite,
    iconColor: Colors.pureWhite,
    borderColor: '#1877F2',
  },
};

export default function SocialLoginButton({
  provider,
  onPress,
  loading = false,
  disabled = false,
}: SocialLoginButtonProps) {
  const config = providerConfig[provider];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
        },
        (loading || disabled) && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={config.textColor}
          style={styles.loader}
        />
      ) : (
        <>
          <View style={styles.iconContainer}>
            <Ionicons name={config.icon} size={20} color={config.iconColor} />
          </View>
          <Text style={[styles.buttonText, { color: config.textColor }]}>
            {config.text}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    shadowColor: Colors.ebonyBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 52,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  iconContainer: {
    marginRight: Spacing.sm,
  },
  buttonText: {
    fontSize: Typography.body,
    fontWeight: Typography.semiBold,
    letterSpacing: 0.3,
  },
  loader: {
    marginRight: 0,
  },
});
