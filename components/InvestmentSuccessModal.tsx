import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/Theme';
import { Transaction } from '@/types/payment';
import TowerTradeLogo from '@/components/TowerTradeLogo';

interface InvestmentSuccessModalProps {
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onViewCertificate: () => void;
}

export default function InvestmentSuccessModal({
  visible,
  transaction,
  onClose,
  onViewCertificate,
}: InvestmentSuccessModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Trigger success haptic
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Animate entrance
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(checkmarkScale, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      // Reset animations
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      checkmarkScale.setValue(0);
    }
  }, [visible]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  if (!transaction) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <BlurView intensity={50} tint="dark" style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Success Checkmark */}
          <Animated.View
            style={[
              styles.checkmarkContainer,
              {
                transform: [{ scale: checkmarkScale }],
              },
            ]}
          >
            <View style={styles.checkmarkCircle}>
              <Ionicons name="checkmark" size={60} color={Colors.pureWhite} />
            </View>
          </Animated.View>

          {/* Success Message */}
          <Text style={styles.successTitle}>Investment Confirmed!</Text>
          <Text style={styles.successSubtitle}>
            Welcome to {transaction.propertyName}
          </Text>

          {/* Investment Certificate */}
          <View style={styles.certificate}>
            {/* Logo */}
            <View style={styles.certificateHeader}>
              <TowerTradeLogo width={200} />
            </View>

            <View style={styles.divider} />

            {/* Certificate Details */}
            <View style={styles.certificateDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Transaction ID</Text>
                <Text style={styles.detailValue}>{transaction.id.slice(-8).toUpperCase()}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Investment Amount</Text>
                <Text style={[styles.detailValue, styles.amountValue]}>
                  {formatCurrency(transaction.amount)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Property</Text>
                <Text style={styles.detailValue} numberOfLines={1}>
                  {transaction.propertyName}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Expected ROI</Text>
                <Text style={[styles.detailValue, styles.roiValue]}>
                  {transaction.expectedROI}% annually
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>{formatDate(transaction.date)}</Text>
              </View>
            </View>

            {/* Status Badge */}
            <View style={styles.statusBadge}>
              <Ionicons
                name={transaction.status === 'completed' ? 'checkmark-circle' : 'time'}
                size={16}
                color={transaction.status === 'completed' ? Colors.success : Colors.warning}
              />
              <Text
                style={[
                  styles.statusText,
                  {
                    color: transaction.status === 'completed' ? Colors.success : Colors.warning,
                  },
                ]}
              >
                {transaction.status === 'completed' ? 'Completed' : 'Pending Confirmation'}
              </Text>
            </View>

            {transaction.status === 'pending' && (
              <Text style={styles.pendingNote}>
                Bank transfers typically take 3-5 business days to process
              </Text>
            )}
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onViewCertificate}
            activeOpacity={0.8}
          >
            <Ionicons name="document-text" size={20} color={Colors.pureWhite} />
            <Text style={styles.primaryButtonText}>View Certificate</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Back to Portfolio</Text>
          </TouchableOpacity>

          {/* Footer */}
          <Text style={styles.footer}>
            A copy has been sent to your email
          </Text>
        </Animated.View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContainer: {
    backgroundColor: Colors.pureWhite,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
    ...Shadows.card,
  },
  checkmarkContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  checkmarkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.towerGold,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.towerGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  successTitle: {
    fontSize: Typography.heading1,
    fontWeight: Typography.bold,
    color: Colors.ebonyBlack,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  successSubtitle: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  certificate: {
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.softSlate,
  },
  certificateHeader: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.softSlate,
    marginVertical: Spacing.md,
  },
  certificateDetails: {
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  detailLabel: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: Typography.bodySmall,
    fontWeight: Typography.semiBold,
    color: Colors.ebonyBlack,
    flex: 1,
    textAlign: 'right',
  },
  amountValue: {
    fontSize: Typography.heading4,
    color: Colors.towerGold,
  },
  roiValue: {
    color: Colors.success,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.pureWhite,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },
  statusText: {
    fontSize: Typography.bodySmall,
    fontWeight: Typography.semiBold,
  },
  pendingNote: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.towerGold,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md + 4,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    ...Shadows.button,
  },
  primaryButtonText: {
    fontSize: Typography.heading4,
    fontWeight: Typography.bold,
    color: Colors.pureWhite,
  },
  secondaryButton: {
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md + 4,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.softSlate,
  },
  secondaryButtonText: {
    fontSize: Typography.body,
    fontWeight: Typography.semiBold,
    color: Colors.ebonyBlack,
    textAlign: 'center',
  },
  footer: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
