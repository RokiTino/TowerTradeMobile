import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/Theme';
import { BankAccount } from '@/types/payment';
import { saveBankAccount, getBankAccounts } from '@/utils/storage';

export default function AddBankScreen() {
  const router = useRouter();
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<'checking' | 'savings'>('checking');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    if (!accountName.trim()) {
      Alert.alert('Validation Error', 'Please enter account name');
      return false;
    }

    if (accountNumber.length < 8 || accountNumber.length > 17) {
      Alert.alert('Validation Error', 'Please enter a valid account number');
      return false;
    }

    if (routingNumber.length !== 9) {
      Alert.alert('Validation Error', 'Routing number must be 9 digits');
      return false;
    }

    return true;
  };

  const handleSaveAccount = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const existingAccounts = await getBankAccounts();

      const newAccount: BankAccount = {
        id: `bank_${Date.now()}`,
        accountName,
        accountType,
        accountNumberLast4: accountNumber.slice(-4),
        routingNumber,
        verificationStatus: 'pending',
        isDefault: existingAccounts.length === 0,
        createdAt: new Date(),
      };

      await saveBankAccount(newAccount);
      Alert.alert(
        'Bank Account Added',
        'Your account has been added and is pending verification. This process typically takes 1-2 business days.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch {
      Alert.alert('Error', 'Failed to save bank account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = accountName.trim() && accountNumber.length >= 8 && routingNumber.length === 9;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={28} color={Colors.ebonyBlack} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Bank Account</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Bank Preview */}
        <View style={styles.bankPreview}>
          <BlurView intensity={20} tint="light" style={styles.bankGlass}>
            <View style={styles.bankContent}>
              <Ionicons name="business" size={40} color={Colors.towerGold} />
              <View style={styles.bankInfo}>
                <Text style={styles.bankPreviewLabel}>ACCOUNT NAME</Text>
                <Text style={styles.bankPreviewName}>
                  {accountName.toUpperCase() || 'YOUR BANK ACCOUNT'}
                </Text>
              </View>
              <View style={styles.bankFooter}>
                <View style={styles.bankFooterItem}>
                  <Text style={styles.bankPreviewLabel}>TYPE</Text>
                  <Text style={styles.bankPreviewValue}>
                    {accountType.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.bankFooterItem}>
                  <Text style={styles.bankPreviewLabel}>ACCOUNT</Text>
                  <Text style={styles.bankPreviewValue}>
                    {accountNumber ? `••••${accountNumber.slice(-4)}` : '••••••'}
                  </Text>
                </View>
              </View>
            </View>
          </BlurView>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Account Information</Text>

          {/* Account Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Account Name / Bank Name</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="business-outline" size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.input}
                value={accountName}
                onChangeText={setAccountName}
                placeholder="Chase Checking"
                placeholderTextColor={Colors.textSecondary}
                autoCapitalize="words"
              />
              {accountName.trim() && (
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              )}
            </View>
          </View>

          {/* Account Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Account Type</Text>
            <View style={styles.accountTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.accountTypeButton,
                  accountType === 'checking' && styles.accountTypeButtonActive,
                ]}
                onPress={() => setAccountType('checking')}
              >
                <Ionicons
                  name="wallet"
                  size={20}
                  color={accountType === 'checking' ? Colors.pureWhite : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.accountTypeText,
                    accountType === 'checking' && styles.accountTypeTextActive,
                  ]}
                >
                  Checking
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.accountTypeButton,
                  accountType === 'savings' && styles.accountTypeButtonActive,
                ]}
                onPress={() => setAccountType('savings')}
              >
                <Ionicons
                  name="trending-up"
                  size={20}
                  color={accountType === 'savings' ? Colors.pureWhite : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.accountTypeText,
                    accountType === 'savings' && styles.accountTypeTextActive,
                  ]}
                >
                  Savings
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Routing Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Routing Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="git-network-outline" size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.input}
                value={routingNumber}
                onChangeText={(text) => {
                  if (text.length <= 9 && /^\d*$/.test(text)) {
                    setRoutingNumber(text);
                  }
                }}
                placeholder="123456789"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="number-pad"
                maxLength={9}
              />
              {routingNumber.length === 9 && (
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              )}
            </View>
            <Text style={styles.helpText}>
              9-digit number found on your checks or bank statement
            </Text>
          </View>

          {/* Account Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Account Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="keypad-outline" size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.input}
                value={accountNumber}
                onChangeText={(text) => {
                  if (/^\d*$/.test(text)) {
                    setAccountNumber(text);
                  }
                }}
                placeholder="Enter account number"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="number-pad"
                secureTextEntry
              />
              {accountNumber.length >= 8 && (
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              )}
            </View>
          </View>

          {/* Verification Info */}
          <View style={styles.verificationInfo}>
            <Ionicons name="information-circle" size={20} color={Colors.towerGold} />
            <View style={styles.verificationTextContainer}>
              <Text style={styles.verificationTitle}>Manual Verification</Text>
              <Text style={styles.verificationText}>
                After adding your account, we&apos;ll initiate a verification process. This typically takes 1-2 business days. You&apos;ll receive two small deposits that you&apos;ll need to confirm.
              </Text>
            </View>
          </View>

          {/* Security Info */}
          <View style={styles.securityInfo}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.towerGold} />
            <Text style={styles.securityText}>
              Your banking information is encrypted and never shared with third parties
            </Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              !isFormValid && styles.saveButtonDisabled,
              loading && styles.saveButtonDisabled,
            ]}
            onPress={handleSaveAccount}
            disabled={!isFormValid || loading}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Adding Account...' : 'Add Bank Account'}
            </Text>
          </TouchableOpacity>
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softSlate,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: Typography.heading3,
    fontWeight: Typography.bold,
    color: Colors.ebonyBlack,
  },
  headerRight: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  bankPreview: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  bankGlass: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: 'rgba(176, 141, 87, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(176, 141, 87, 0.3)',
  },
  bankContent: {
    padding: Spacing.lg,
    minHeight: 200,
    justifyContent: 'space-between',
  },
  bankInfo: {
    marginTop: Spacing.md,
  },
  bankPreviewLabel: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  bankPreviewName: {
    fontSize: Typography.heading4,
    fontWeight: Typography.semiBold,
    color: Colors.ebonyBlack,
  },
  bankFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bankFooterItem: {
    flex: 1,
  },
  bankPreviewValue: {
    fontSize: Typography.body,
    fontWeight: Typography.semiBold,
    color: Colors.ebonyBlack,
  },
  form: {
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.heading4,
    fontWeight: Typography.semiBold,
    color: Colors.ebonyBlack,
    marginBottom: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.bodySmall,
    fontWeight: Typography.medium,
    color: Colors.ebonyBlack,
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.softSlate,
  },
  input: {
    flex: 1,
    fontSize: Typography.body,
    color: Colors.ebonyBlack,
    paddingVertical: Spacing.md,
    marginLeft: Spacing.sm,
  },
  helpText: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  accountTypeContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  accountTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.softSlate,
  },
  accountTypeButtonActive: {
    backgroundColor: Colors.towerGold,
    borderColor: Colors.towerGold,
  },
  accountTypeText: {
    fontSize: Typography.body,
    fontWeight: Typography.medium,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
  accountTypeTextActive: {
    color: Colors.pureWhite,
  },
  verificationInfo: {
    flexDirection: 'row',
    backgroundColor: '#FFF9F0',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.towerGold,
  },
  verificationTextContainer: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  verificationTitle: {
    fontSize: Typography.body,
    fontWeight: Typography.semiBold,
    color: Colors.ebonyBlack,
    marginBottom: 4,
  },
  verificationText: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9F0',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  securityText: {
    flex: 1,
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
    lineHeight: 18,
  },
  saveButton: {
    backgroundColor: Colors.towerGold,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md + 4,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.button,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.softSlate,
    opacity: 0.5,
  },
  saveButtonText: {
    color: Colors.pureWhite,
    fontSize: Typography.heading4,
    fontWeight: Typography.bold,
  },
});
