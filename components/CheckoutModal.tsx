import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/Theme';
import SlideToPayButton from './SlideToPayButton';
import { Property } from '@/types/property';
import { CreditCard, BankAccount, Transaction } from '@/types/payment';
import { getCreditCards, getBankAccounts, saveTransaction, getInvestorAgreement } from '@/utils/storage';

interface CheckoutModalProps {
  visible: boolean;
  property: Property | null;
  amount: number;
  onClose: () => void;
  onSuccess: (transaction: Transaction) => void;
}

type CheckoutStep = 'confirmation' | 'payment' | 'auth' | 'processing';

export default function CheckoutModal({ visible, property, amount, onClose, onSuccess }: CheckoutModalProps) {
  const [step, setStep] = useState<CheckoutStep>('confirmation');
  const [paymentMethods, setPaymentMethods] = useState<(CreditCard | BankAccount)[]>([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadPaymentMethods();
      checkFirstTimeInvestor();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const loadPaymentMethods = async () => {
    try {
      const [cards, accounts] = await Promise.all([getCreditCards(), getBankAccounts()]);
      const allMethods = [...cards, ...accounts];
      setPaymentMethods(allMethods);

      // Auto-select default payment method
      const defaultMethod = allMethods.find((m) => m.isDefault);
      if (defaultMethod) {
        setSelectedPaymentId(defaultMethod.id);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const checkFirstTimeInvestor = async () => {
    const agreement = await getInvestorAgreement();
    if (!agreement || !agreement.accepted) {
      // Show investor agreement first
      Alert.alert(
        'Investor Agreement Required',
        'Before making your first investment, you must review and accept our Investor Agreement.',
        [
          { text: 'Cancel', style: 'cancel', onPress: onClose },
          { text: 'Review Agreement', onPress: () => {
            // In a real app, this would open the agreement modal
            // For now, we'll just proceed
          }},
        ]
      );
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const handleConfirm = () => {
    if (!selectedPaymentId) {
      Alert.alert('Payment Method Required', 'Please select a payment method to continue.');
      return;
    }
    setStep('payment');
  };

  const handleBiometricAuth = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        // Skip biometric if not available
        processPayment();
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to confirm investment',
        fallbackLabel: 'Use passcode',
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        processPayment();
      } else {
        Alert.alert('Authentication Failed', 'Please try again.');
      }
    } catch (error) {
      console.error('Biometric auth error:', error);
      // Proceed anyway in case of error
      processPayment();
    }
  };

  const processPayment = async () => {
    if (!property || !selectedPaymentId) return;

    setStep('processing');

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const selectedMethod = paymentMethods.find((m) => m.id === selectedPaymentId);
      const paymentType = selectedMethod?.id.startsWith('card') ? 'card' : 'bank';

      const transaction: Transaction = {
        id: `txn_${Date.now()}`,
        propertyId: property.id,
        propertyName: property.name,
        amount,
        status: paymentType === 'card' ? 'completed' : 'pending',
        paymentMethodId: selectedPaymentId,
        paymentMethodType: paymentType,
        date: new Date(),
        expectedROI: property.expectedROI,
      };

      await saveTransaction(transaction);

      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      onSuccess(transaction);
    } catch {
      Alert.alert('Transaction Failed', 'Please try again later.');
      setStep('payment');
    }
  };

  const renderConfirmation = () => (
    <View style={styles.stepContainer}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Confirm Investment</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={Colors.ebonyBlack} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Property Info */}
        <View style={styles.propertyInfo}>
          <Ionicons name="business" size={48} color={Colors.towerGold} />
          <Text style={styles.propertyName}>{property?.name}</Text>
          <Text style={styles.propertyLocation}>{property?.location}</Text>
        </View>

        {/* Investment Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Investment Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Investment Amount</Text>
            <Text style={styles.summaryValue}>{formatCurrency(amount)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Expected Annual ROI</Text>
            <Text style={[styles.summaryValue, styles.roiValue]}>
              {property?.expectedROI}%
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabelBold}>Projected Returns (Year 1)</Text>
            <Text style={styles.summaryValueBold}>
              {formatCurrency(amount * ((property?.expectedROI || 0) / 100))}
            </Text>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleConfirm}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Select Payment Method</Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.pureWhite} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderPaymentSelection = () => (
    <View style={styles.stepContainer}>
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={() => setStep('confirmation')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.ebonyBlack} />
        </TouchableOpacity>
        <Text style={styles.modalTitle}>Payment Method</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={Colors.ebonyBlack} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionSubtitle}>
          Select a payment method for this investment
        </Text>

        {paymentMethods.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyStateText}>No payment methods found</Text>
            <Text style={styles.emptyStateSubtext}>
              Please add a payment method in your profile settings
            </Text>
          </View>
        ) : (
          paymentMethods.map((method) => {
            const isCard = 'cardNumber' in method;
            const isSelected = method.id === selectedPaymentId;

            return (
              <TouchableOpacity
                key={method.id}
                style={[styles.paymentMethodCard, isSelected && styles.paymentMethodCardSelected]}
                onPress={() => setSelectedPaymentId(method.id)}
              >
                <View style={styles.paymentMethodIcon}>
                  <Ionicons
                    name={isCard ? 'card' : 'business'}
                    size={24}
                    color={isSelected ? Colors.towerGold : Colors.textSecondary}
                  />
                </View>
                <View style={styles.paymentMethodInfo}>
                  <Text style={styles.paymentMethodName}>
                    {isCard
                      ? (method as CreditCard).cardholderName
                      : (method as BankAccount).accountName}
                  </Text>
                  <Text style={styles.paymentMethodDetails}>
                    {isCard
                      ? `•••• ${(method as CreditCard).cardNumber}`
                      : `${(method as BankAccount).accountType} •••• ${(method as BankAccount).accountNumberLast4}`}
                  </Text>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={24} color={Colors.towerGold} />
                )}
              </TouchableOpacity>
            );
          })
        )}

        {/* Slide to Pay */}
        <View style={styles.slideContainer}>
          <Text style={styles.slideInfo}>
            Slide to confirm your investment of <Text style={styles.amountText}>{formatCurrency(amount)}</Text>
          </Text>
          <SlideToPayButton
            onSlideComplete={handleBiometricAuth}
            disabled={!selectedPaymentId}
          />
        </View>
      </ScrollView>
    </View>
  );

  const renderProcessing = () => (
    <View style={styles.stepContainer}>
      <View style={styles.processingContainer}>
        <View style={styles.loadingSpinner}>
          <Ionicons name="hourglass" size={64} color={Colors.towerGold} />
        </View>
        <Text style={styles.processingTitle}>Processing Investment...</Text>
        <Text style={styles.processingText}>
          Please wait while we confirm your transaction
        </Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <BlurView intensity={40} tint="dark" style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {step === 'confirmation' && renderConfirmation()}
            {step === 'payment' && renderPaymentSelection()}
            {step === 'processing' && renderProcessing()}
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.pureWhite,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '90%',
    ...Shadows.card,
  },
  stepContainer: {
    paddingBottom: Spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softSlate,
  },
  modalTitle: {
    fontSize: Typography.heading3,
    fontWeight: Typography.bold,
    color: Colors.ebonyBlack,
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: Spacing.xs,
    marginRight: Spacing.md,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  propertyInfo: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  propertyName: {
    fontSize: Typography.heading2,
    fontWeight: Typography.bold,
    color: Colors.ebonyBlack,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  propertyLocation: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  summaryCard: {
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  summaryTitle: {
    fontSize: Typography.heading4,
    fontWeight: Typography.semiBold,
    color: Colors.ebonyBlack,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: Typography.body,
    fontWeight: Typography.semiBold,
    color: Colors.ebonyBlack,
  },
  summaryLabelBold: {
    fontSize: Typography.body,
    fontWeight: Typography.semiBold,
    color: Colors.ebonyBlack,
  },
  summaryValueBold: {
    fontSize: Typography.heading4,
    fontWeight: Typography.bold,
    color: Colors.towerGold,
  },
  roiValue: {
    color: Colors.success,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.softSlate,
    marginVertical: Spacing.md,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.towerGold,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md + 4,
    marginHorizontal: Spacing.lg,
    gap: Spacing.sm,
    ...Shadows.button,
  },
  continueButtonText: {
    fontSize: Typography.heading4,
    fontWeight: Typography.bold,
    color: Colors.pureWhite,
  },
  sectionSubtitle: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentMethodCardSelected: {
    borderColor: Colors.towerGold,
    backgroundColor: '#FFF9F0',
  },
  paymentMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.pureWhite,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: Typography.body,
    fontWeight: Typography.semiBold,
    color: Colors.ebonyBlack,
    marginBottom: 4,
  },
  paymentMethodDetails: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  emptyStateText: {
    fontSize: Typography.heading4,
    fontWeight: Typography.semiBold,
    color: Colors.ebonyBlack,
    marginTop: Spacing.md,
  },
  emptyStateSubtext: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  slideContainer: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
  },
  slideInfo: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  amountText: {
    fontWeight: Typography.bold,
    color: Colors.towerGold,
  },
  processingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
    paddingHorizontal: Spacing.lg,
  },
  loadingSpinner: {
    marginBottom: Spacing.xl,
  },
  processingTitle: {
    fontSize: Typography.heading2,
    fontWeight: Typography.bold,
    color: Colors.ebonyBlack,
    marginBottom: Spacing.sm,
  },
  processingText: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
