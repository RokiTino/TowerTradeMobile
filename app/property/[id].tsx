import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { mockProperties } from '@/data/mockProperties';
import { Property } from '@/types/property';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/Theme';

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [progressAnim] = useState(new Animated.Value(0));

  const animateProgress = useCallback((percentage: number) => {
    Animated.timing(progressAnim, {
      toValue: percentage,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progressAnim]);

  useEffect(() => {
    const foundProperty = mockProperties.find((p) => p.id === id);
    if (foundProperty) {
      setProperty(foundProperty);
      animateProgress(foundProperty.raisedAmount / foundProperty.goalAmount);
    }
  }, [id, animateProgress]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const handleInvest = async () => {
    if (!investmentAmount || parseFloat(investmentAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid investment amount');
      return;
    }

    const amount = parseFloat(investmentAmount);

    if (property && amount < property.minimumInvestment) {
      Alert.alert(
        'Minimum Investment',
        `The minimum investment for this property is ${formatCurrency(property.minimumInvestment)}`
      );
      return;
    }

    // Haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Alert.alert(
      'Confirm Investment',
      `You are about to invest ${formatCurrency(amount)} in ${property?.name}. This is a demo app, so no actual transaction will occur.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            Alert.alert('Success', 'Investment recorded successfully!', [
              {
                text: 'OK',
                onPress: () => router.back(),
              },
            ]);
          },
        },
      ]
    );
  };

  if (!property) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading property...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const progressPercentage = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.ebonyBlack} />
          </TouchableOpacity>
          <View style={styles.headerBranding}>
            <Text style={styles.headerTitle}>
              <Text style={styles.headerTitleGold}>Tower</Text>
              <Text style={styles.headerTitleBlack}>Trade</Text>
            </Text>
            <Text style={styles.headerSubtitle}>invest from home.</Text>
          </View>
        </View>

        {/* Property Image */}
        <Image
          source={{ uri: property.imageUrl }}
          style={styles.propertyImage}
          resizeMode="cover"
        />

        {/* Investment Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <Text style={styles.raisedAmount}>{formatCurrency(property.raisedAmount)}</Text>
            <Text style={styles.goalAmount}>{formatCurrency(property.goalAmount)}</Text>
          </View>

          {/* Animated Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <Animated.View
                style={[
                  styles.progressFill,
                  { width: progressPercentage },
                ]}
              />
            </View>
          </View>

          <View style={styles.labelsRow}>
            <Text style={styles.label}>Raised</Text>
            <Text style={styles.label}>Goal</Text>
          </View>
        </View>

        {/* Property Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.propertyName}>{property.name}</Text>
          <Text style={styles.propertyLocation}>{property.location}</Text>
          <Text style={styles.propertyDescription}>{property.description}</Text>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Expected ROI</Text>
              <Text style={styles.detailValue}>{property.expectedROI}%</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Property Type</Text>
              <Text style={styles.detailValue}>{property.type}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Min. Investment</Text>
              <Text style={styles.detailValue}>{formatCurrency(property.minimumInvestment)}</Text>
            </View>
          </View>
        </View>

        {/* Investment Input */}
        <View style={styles.investmentContainer}>
          <Text style={styles.investmentLabel}>Enter amount</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.input}
              value={investmentAmount}
              onChangeText={setInvestmentAmount}
              placeholder="Enter amount"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity
            style={styles.investButton}
            onPress={handleInvest}
            activeOpacity={0.8}
          >
            <Text style={styles.investButtonText}>INVEST</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Branding */}
        <View style={styles.footer}>
          <Ionicons name="business" size={32} color={Colors.ebonyBlack} />
          <Text style={styles.footerUrl}>www.towertrade.com</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    marginRight: Spacing.md,
  },
  headerBranding: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.heading3,
  },
  headerTitleGold: {
    color: Colors.towerGold,
    fontWeight: Typography.bold,
  },
  headerTitleBlack: {
    color: Colors.ebonyBlack,
    fontWeight: Typography.bold,
  },
  headerSubtitle: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
  },
  propertyImage: {
    width: '100%',
    height: 280,
    backgroundColor: Colors.softSlate,
  },
  statsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: Spacing.md,
  },
  raisedAmount: {
    fontSize: Typography.heading1,
    fontWeight: Typography.bold,
    color: Colors.ebonyBlack,
  },
  goalAmount: {
    fontSize: Typography.heading4,
    fontWeight: Typography.semiBold,
    color: Colors.textSecondary,
  },
  progressContainer: {
    marginBottom: Spacing.sm,
  },
  progressBackground: {
    height: 12,
    backgroundColor: Colors.softSlate,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.towerGold,
    borderRadius: BorderRadius.md,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
  },
  detailsContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  propertyName: {
    fontSize: Typography.heading2,
    fontWeight: Typography.bold,
    color: Colors.ebonyBlack,
    marginBottom: Spacing.xs,
  },
  propertyLocation: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  propertyDescription: {
    fontSize: Typography.body,
    color: Colors.ebonyBlack,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  detailItem: {
    width: '48%',
    backgroundColor: Colors.inputBackground,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  detailLabel: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  detailValue: {
    fontSize: Typography.heading4,
    fontWeight: Typography.semiBold,
    color: Colors.ebonyBlack,
  },
  investmentContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  investmentLabel: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.softSlate,
  },
  currencySymbol: {
    fontSize: Typography.heading3,
    fontWeight: Typography.semiBold,
    color: Colors.ebonyBlack,
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Typography.heading4,
    color: Colors.ebonyBlack,
    paddingVertical: Spacing.md,
  },
  investButton: {
    backgroundColor: Colors.softSlate,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md + 4,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.button,
  },
  investButtonText: {
    color: Colors.ebonyBlack,
    fontSize: Typography.heading4,
    fontWeight: Typography.bold,
    letterSpacing: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  footerUrl: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
});
