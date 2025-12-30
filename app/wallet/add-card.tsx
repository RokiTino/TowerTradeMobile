import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/Theme';
import { CreditCard } from '@/types/payment';
import { saveCreditCard, getCreditCards } from '@/utils/storage';

export default function AddCardScreen() {
  const router = useRouter();
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveForFuture, setSaveForFuture] = useState(true);
  const [loading, setLoading] = useState(false);

  const detectCardBrand = (number: string): CreditCard['brand'] => {
    const cleanNumber = number.replace(/\s/g, '');
    if (cleanNumber.startsWith('4')) return 'visa';
    if (cleanNumber.startsWith('5')) return 'mastercard';
    if (cleanNumber.startsWith('3')) return 'amex';
    return 'discover';
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const handleCardNumberChange = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    if (cleaned.length <= 16 && /^\d*$/.test(cleaned)) {
      setCardNumber(formatCardNumber(cleaned));
    }
  };

  const handleExpiryMonthChange = (text: string) => {
    if (text.length <= 2 && /^\d*$/.test(text)) {
      const month = parseInt(text);
      if (text === '' || (month >= 1 && month <= 12)) {
        setExpiryMonth(text);
      }
    }
  };

  const handleExpiryYearChange = (text: string) => {
    if (text.length <= 2 && /^\d*$/.test(text)) {
      setExpiryYear(text);
    }
  };

  const handleCvvChange = (text: string) => {
    if (text.length <= 4 && /^\d*$/.test(text)) {
      setCvv(text);
    }
  };

  const validateForm = (): boolean => {
    if (!cardholderName.trim()) {
      Alert.alert('Validation Error', 'Please enter cardholder name');
      return false;
    }

    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (cleanCardNumber.length < 13 || cleanCardNumber.length > 16) {
      Alert.alert('Validation Error', 'Please enter a valid card number');
      return false;
    }

    if (!expiryMonth || !expiryYear) {
      Alert.alert('Validation Error', 'Please enter expiry date');
      return false;
    }

    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    const expYear = parseInt(expiryYear);
    const expMonth = parseInt(expiryMonth);

    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      Alert.alert('Validation Error', 'Card has expired');
      return false;
    }

    if (cvv.length < 3 || cvv.length > 4) {
      Alert.alert('Validation Error', 'Please enter a valid CVV');
      return false;
    }

    return true;
  };

  const handleSaveCard = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const cleanCardNumber = cardNumber.replace(/\s/g, '');
      const existingCards = await getCreditCards();

      const newCard: CreditCard = {
        id: `card_${Date.now()}`,
        cardholderName,
        cardNumber: cleanCardNumber.slice(-4),
        expiryMonth: expiryMonth.padStart(2, '0'),
        expiryYear: expiryYear.padStart(2, '0'),
        brand: detectCardBrand(cleanCardNumber),
        isDefault: existingCards.length === 0,
        createdAt: new Date(),
      };

      await saveCreditCard(newCard);
      Alert.alert('Success', 'Card added successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to save card. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = cardholderName.trim() && cardNumber.replace(/\s/g, '').length >= 13 &&
                      expiryMonth && expiryYear && cvv.length >= 3;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={28} color={Colors.ebonyBlack} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Card</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card Preview */}
        <View style={styles.cardPreview}>
          <BlurView intensity={20} tint="light" style={styles.cardGlass}>
            <View style={styles.cardContent}>
              <Ionicons name="card" size={40} color={Colors.towerGold} />
              <Text style={styles.cardPreviewNumber}>
                {cardNumber || '•••• •••• •••• ••••'}
              </Text>
              <View style={styles.cardPreviewFooter}>
                <View>
                  <Text style={styles.cardPreviewLabel}>CARDHOLDER</Text>
                  <Text style={styles.cardPreviewName}>
                    {cardholderName.toUpperCase() || 'YOUR NAME'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.cardPreviewLabel}>EXPIRES</Text>
                  <Text style={styles.cardPreviewExpiry}>
                    {expiryMonth && expiryYear ? `${expiryMonth}/${expiryYear}` : 'MM/YY'}
                  </Text>
                </View>
              </View>
            </View>
          </BlurView>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Card Details</Text>

          {/* Cardholder Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cardholder Name</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.input}
                value={cardholderName}
                onChangeText={setCardholderName}
                placeholder="John Doe"
                placeholderTextColor={Colors.textSecondary}
                autoCapitalize="words"
              />
              {cardholderName.trim() && (
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              )}
            </View>
          </View>

          {/* Card Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Card Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="card-outline" size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.input}
                value={cardNumber}
                onChangeText={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="number-pad"
              />
              {cardNumber.replace(/\s/g, '').length >= 13 && (
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              )}
            </View>
          </View>

          {/* Expiry and CVV */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Expiry Date</Text>
              <View style={styles.expiryContainer}>
                <View style={[styles.inputContainer, styles.expiryInput]}>
                  <TextInput
                    style={[styles.input, styles.centeredInput]}
                    value={expiryMonth}
                    onChangeText={handleExpiryMonthChange}
                    placeholder="MM"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>
                <Text style={styles.expirySlash}>/</Text>
                <View style={[styles.inputContainer, styles.expiryInput]}>
                  <TextInput
                    style={[styles.input, styles.centeredInput]}
                    value={expiryYear}
                    onChangeText={handleExpiryYearChange}
                    placeholder="YY"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>
              </View>
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>CVV</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  value={cvv}
                  onChangeText={handleCvvChange}
                  placeholder="123"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="number-pad"
                  secureTextEntry
                  maxLength={4}
                />
              </View>
            </View>
          </View>

          {/* Save for Future Toggle */}
          <View style={styles.toggleContainer}>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleLabel}>Save for future investments</Text>
              <Text style={styles.toggleSubtext}>
                Securely store this card for quick checkout
              </Text>
            </View>
            <Switch
              value={saveForFuture}
              onValueChange={setSaveForFuture}
              trackColor={{ false: Colors.softSlate, true: Colors.towerGold }}
              thumbColor={Colors.pureWhite}
            />
          </View>

          {/* Security Info */}
          <View style={styles.securityInfo}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.towerGold} />
            <Text style={styles.securityText}>
              Your card information is encrypted using bank-level security
            </Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              !isFormValid && styles.saveButtonDisabled,
              loading && styles.saveButtonDisabled,
            ]}
            onPress={handleSaveCard}
            disabled={!isFormValid || loading}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Adding Card...' : 'Add Card'}
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
  cardPreview: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  cardGlass: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: 'rgba(176, 141, 87, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(176, 141, 87, 0.3)',
  },
  cardContent: {
    padding: Spacing.lg,
    minHeight: 200,
    justifyContent: 'space-between',
  },
  cardPreviewNumber: {
    fontSize: Typography.heading2,
    fontWeight: Typography.semiBold,
    color: Colors.ebonyBlack,
    letterSpacing: 2,
    marginTop: Spacing.md,
  },
  cardPreviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardPreviewLabel: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  cardPreviewName: {
    fontSize: Typography.body,
    fontWeight: Typography.semiBold,
    color: Colors.ebonyBlack,
  },
  cardPreviewExpiry: {
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryInput: {
    flex: 1,
  },
  expirySlash: {
    fontSize: Typography.heading3,
    color: Colors.textSecondary,
    marginHorizontal: Spacing.sm,
  },
  centeredInput: {
    textAlign: 'center',
    marginLeft: 0,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  toggleTextContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  toggleLabel: {
    fontSize: Typography.body,
    fontWeight: Typography.medium,
    color: Colors.ebonyBlack,
    marginBottom: 4,
  },
  toggleSubtext: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
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
