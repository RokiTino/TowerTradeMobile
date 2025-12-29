import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/Theme';
import { InvestorAgreement } from '@/types/payment';
import { saveInvestorAgreement } from '@/utils/storage';

interface InvestorAgreementModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const AGREEMENT_CONTENT = `
INVESTOR AGREEMENT

This Investor Agreement ("Agreement") is entered into between TowerTrade Platform LLC ("TowerTrade") and you, the investor ("Investor").

1. INVESTMENT RISKS
Real estate investments involve substantial risk. You may lose some or all of your investment. Past performance does not guarantee future results. Property values can fluctuate based on market conditions, economic factors, and other variables beyond our control.

2. ELIGIBILITY REQUIREMENTS
By accepting this agreement, you confirm that:
• You are at least 18 years of age
• You have the legal capacity to enter into this agreement
• You understand the risks associated with real estate investment
• You are not relying solely on TowerTrade for investment advice

3. INVESTMENT PROCESS
• All investments are subject to availability
• Minimum investment amounts apply per property
• Funds will be held in escrow until the funding goal is reached
• If funding goals are not met, investments will be returned

4. RETURNS AND DISTRIBUTIONS
• Expected ROI percentages are projections, not guarantees
• Actual returns may vary significantly
• Distributions are typically made quarterly
• Returns depend on property performance and market conditions

5. FEES AND CHARGES
• Platform fees are disclosed prior to investment
• Property management fees may apply
• Transaction fees for certain payment methods
• Early withdrawal may incur penalties

6. REGULATORY COMPLIANCE
All investments are made in accordance with applicable securities laws and regulations. This platform is not a registered broker-dealer or investment advisor.

7. DATA AND PRIVACY
Your personal and financial information is encrypted and protected. We do not sell your data to third parties. Please review our Privacy Policy for detailed information.

8. MODIFICATION OF TERMS
TowerTrade reserves the right to modify this agreement with notice to investors. Continued use of the platform after modifications constitutes acceptance.

By accepting below, you acknowledge that you have read, understood, and agree to be bound by the terms of this Investor Agreement.
`;

export default function InvestorAgreementModal({
  visible,
  onAccept,
  onDecline,
}: InvestorAgreementModalProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    if (isCloseToBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAccept = async () => {
    try {
      const agreement: InvestorAgreement = {
        id: `agreement_${Date.now()}`,
        version: '1.0',
        content: AGREEMENT_CONTENT,
        acceptedAt: new Date(),
        accepted: true,
      };
      await saveInvestorAgreement(agreement);
      onAccept();
    } catch (error) {
      console.error('Error saving agreement:', error);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <BlurView intensity={40} tint="dark" style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="document-text" size={32} color={Colors.towerGold} />
              </View>
              <Text style={styles.title}>Investor Agreement</Text>
              <Text style={styles.subtitle}>
                Please read and accept the terms before making your first investment
              </Text>
            </View>

            {/* Agreement Content */}
            <ScrollView
              style={styles.contentScroll}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              showsVerticalScrollIndicator={true}
            >
              <Text style={styles.agreementText}>{AGREEMENT_CONTENT}</Text>
            </ScrollView>

            {/* Scroll Indicator */}
            {!hasScrolledToBottom && (
              <View style={styles.scrollIndicator}>
                <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
                <Text style={styles.scrollIndicatorText}>Scroll to read full agreement</Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.acceptButton, !hasScrolledToBottom && styles.buttonDisabled]}
                onPress={handleAccept}
                disabled={!hasScrolledToBottom}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-circle" size={20} color={Colors.pureWhite} />
                <Text style={styles.acceptButtonText}>Accept Agreement</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.declineButton}
                onPress={onDecline}
                activeOpacity={0.8}
              >
                <Text style={styles.declineButtonText}>Decline</Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <Text style={styles.footer}>
              By accepting, you confirm that you have read and understood the terms
            </Text>
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
  header: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softSlate,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF9F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.heading2,
    fontWeight: Typography.bold,
    color: Colors.ebonyBlack,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  contentScroll: {
    maxHeight: 400,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  agreementText: {
    fontSize: Typography.bodySmall,
    color: Colors.ebonyBlack,
    lineHeight: 22,
  },
  scrollIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    backgroundColor: '#FFF9F0',
    gap: Spacing.xs,
  },
  scrollIndicatorText: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
  },
  actions: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  acceptButton: {
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
  buttonDisabled: {
    opacity: 0.5,
  },
  acceptButtonText: {
    fontSize: Typography.heading4,
    fontWeight: Typography.bold,
    color: Colors.pureWhite,
  },
  declineButton: {
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md + 4,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.softSlate,
  },
  declineButtonText: {
    fontSize: Typography.body,
    fontWeight: Typography.semiBold,
    color: Colors.ebonyBlack,
    textAlign: 'center',
  },
  footer: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
});
