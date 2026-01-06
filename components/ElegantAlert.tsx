/**
 * Elegant Alert Component
 * Premium Tower Gold themed alert/modal for displaying errors and messages
 * Replaces standard Alert.alert with a more refined UI
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Theme';

interface ElegantAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onDismiss: () => void;
  type?: 'error' | 'warning' | 'info' | 'success';
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onSecondaryPress?: () => void;
}

const { width } = Dimensions.get('window');

export default function ElegantAlert({
  visible,
  title,
  message,
  onDismiss,
  type = 'error',
  primaryButtonText = 'OK',
  secondaryButtonText,
  onSecondaryPress,
}: ElegantAlertProps) {
  // Color scheme based on alert type
  const getColors = () => {
    switch (type) {
      case 'error':
        return {
          icon: '⚠️',
          titleColor: '#D32F2F',
          accentColor: Colors.towerGold,
        };
      case 'warning':
        return {
          icon: '⚡',
          titleColor: Colors.towerGold,
          accentColor: Colors.towerGold,
        };
      case 'success':
        return {
          icon: '✓',
          titleColor: '#2E7D32',
          accentColor: Colors.towerGold,
        };
      case 'info':
        return {
          icon: 'ℹ️',
          titleColor: Colors.ebonyBlack,
          accentColor: Colors.towerGold,
        };
      default:
        return {
          icon: '•',
          titleColor: Colors.ebonyBlack,
          accentColor: Colors.towerGold,
        };
    }
  };

  const colors = getColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
        ) : (
          <View style={styles.androidBlur} />
        )}

        <View style={styles.alertContainer}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{colors.icon}</Text>
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            <Text style={[styles.title, { color: colors.titleColor }]}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {secondaryButtonText && onSecondaryPress && (
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={onSecondaryPress}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>{secondaryButtonText}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.button,
                styles.primaryButton,
                { backgroundColor: colors.accentColor },
              ]}
              onPress={onDismiss}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>{primaryButtonText}</Text>
            </TouchableOpacity>
          </View>

          {/* Decorative Gold Bar */}
          <View style={styles.goldBar} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  androidBlur: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  alertContainer: {
    width: width * 0.85,
    maxWidth: 400,
    backgroundColor: Colors.pureWhite,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    shadowColor: Colors.ebonyBlack,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  icon: {
    fontSize: 48,
  },
  contentContainer: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: Typography.bold,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  message: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.towerGold,
  },
  primaryButtonText: {
    color: Colors.pureWhite,
    fontSize: Typography.body,
    fontWeight: Typography.bold,
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: Colors.softSlate,
    borderWidth: 1,
    borderColor: Colors.softSlate,
  },
  secondaryButtonText: {
    color: Colors.ebonyBlack,
    fontSize: Typography.body,
    fontWeight: Typography.semiBold,
  },
  goldBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: Colors.towerGold,
  },
});
