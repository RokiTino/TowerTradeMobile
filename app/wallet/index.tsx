import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/Theme';
import TowerTradeLogo from '@/components/TowerTradeLogo';
import { CreditCard, BankAccount } from '@/types/payment';
import { getCreditCards, getBankAccounts, deleteCreditCard, deleteBankAccount } from '@/utils/storage';

export default function WalletScreen() {
  const router = useRouter();
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const [cards, accounts] = await Promise.all([getCreditCards(), getBankAccounts()]);
      setCreditCards(cards);
      setBankAccounts(accounts);
    } catch (error) {
      Alert.alert('Error', 'Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = (cardId: string) => {
    Alert.alert(
      'Delete Card',
      'Are you sure you want to remove this card?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCreditCard(cardId);
              await loadPaymentMethods();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete card');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = (accountId: string) => {
    Alert.alert(
      'Delete Bank Account',
      'Are you sure you want to remove this bank account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBankAccount(accountId);
              await loadPaymentMethods();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account');
            }
          },
        },
      ]
    );
  };

  const getCardIcon = (brand: string): 'card-outline' => {
    // All cards use the same icon for now
    return 'card-outline';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.ebonyBlack} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <TowerTradeLogo width={180} />
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Payment Methods</Text>
        <Text style={styles.pageSubtitle}>Manage your funding sources securely</Text>

        {/* Credit Cards Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Credit & Debit Cards</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/wallet/add-card')}
            >
              <Ionicons name="add-circle" size={24} color={Colors.towerGold} />
            </TouchableOpacity>
          </View>

          {creditCards.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="card-outline" size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyStateText}>No cards added yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Add a credit or debit card for instant investments
              </Text>
            </View>
          ) : (
            creditCards.map((card) => (
              <View key={card.id} style={styles.paymentCard}>
                <View style={styles.cardIconContainer}>
                  <Ionicons name={getCardIcon(card.brand)} size={28} color={Colors.towerGold} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{card.cardholderName}</Text>
                  <Text style={styles.cardNumber}>•••• {card.cardNumber}</Text>
                  <Text style={styles.cardExpiry}>
                    Expires {card.expiryMonth}/{card.expiryYear}
                  </Text>
                </View>
                {card.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteCard(card.id)}
                >
                  <Ionicons name="trash-outline" size={20} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Bank Accounts Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bank Accounts</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/wallet/add-bank')}
            >
              <Ionicons name="add-circle" size={24} color={Colors.towerGold} />
            </TouchableOpacity>
          </View>

          {bankAccounts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="business-outline" size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyStateText}>No bank accounts added</Text>
              <Text style={styles.emptyStateSubtext}>
                Link your bank for ACH transfers and larger investments
              </Text>
            </View>
          ) : (
            bankAccounts.map((account) => (
              <View key={account.id} style={styles.paymentCard}>
                <View style={styles.cardIconContainer}>
                  <Ionicons name="business" size={28} color={Colors.towerGold} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{account.accountName}</Text>
                  <Text style={styles.cardNumber}>
                    {account.accountType} •••• {account.accountNumberLast4}
                  </Text>
                  <View style={styles.verificationBadge}>
                    <Ionicons
                      name={
                        account.verificationStatus === 'verified'
                          ? 'checkmark-circle'
                          : 'time-outline'
                      }
                      size={14}
                      color={
                        account.verificationStatus === 'verified'
                          ? Colors.success
                          : Colors.warning
                      }
                    />
                    <Text
                      style={[
                        styles.verificationText,
                        {
                          color:
                            account.verificationStatus === 'verified'
                              ? Colors.success
                              : Colors.warning,
                        },
                      ]}
                    >
                      {account.verificationStatus === 'verified' ? 'Verified' : 'Pending Verification'}
                    </Text>
                  </View>
                </View>
                {account.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteAccount(account.id)}
                >
                  <Ionicons name="trash-outline" size={20} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Ionicons name="shield-checkmark" size={24} color={Colors.towerGold} />
          <View style={styles.securityTextContainer}>
            <Text style={styles.securityTitle}>Bank-Level Security</Text>
            <Text style={styles.securityText}>
              Your payment information is encrypted and securely stored. We never share your
              financial data.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.pureWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softSlate,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  pageTitle: {
    fontSize: Typography.heading2,
    fontWeight: Typography.bold,
    color: Colors.ebonyBlack,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  pageSubtitle: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.heading4,
    fontWeight: Typography.semiBold,
    color: Colors.ebonyBlack,
  },
  addButton: {
    padding: Spacing.xs,
  },
  emptyState: {
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: Typography.body,
    fontWeight: Typography.semiBold,
    color: Colors.ebonyBlack,
    marginTop: Spacing.md,
  },
  emptyStateSubtext: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.pureWhite,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.softSlate,
    ...Shadows.card,
  },
  cardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FFF9F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: Typography.body,
    fontWeight: Typography.semiBold,
    color: Colors.ebonyBlack,
    marginBottom: 4,
  },
  cardNumber: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  cardExpiry: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
  },
  defaultBadge: {
    backgroundColor: Colors.towerGold,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
  },
  defaultText: {
    fontSize: Typography.caption,
    fontWeight: Typography.semiBold,
    color: Colors.pureWhite,
  },
  deleteButton: {
    padding: Spacing.xs,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  verificationText: {
    fontSize: Typography.caption,
    fontWeight: Typography.medium,
    marginLeft: 4,
  },
  securityNotice: {
    flexDirection: 'row',
    backgroundColor: '#FFF9F0',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.towerGold,
    opacity: 0.8,
  },
  securityTextContainer: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  securityTitle: {
    fontSize: Typography.body,
    fontWeight: Typography.semiBold,
    color: Colors.ebonyBlack,
    marginBottom: 4,
  },
  securityText: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
