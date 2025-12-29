import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Theme';

export default function PortfolioScreen() {
  const portfolioValue = 285000;
  const totalInvested = 250000;
  const totalReturn = 35000;
  const returnPercentage = ((totalReturn / totalInvested) * 100).toFixed(2);

  const investments = [
    { id: '1', name: 'Beachfront Villa', invested: 50000, currentValue: 57500, roi: 15 },
    { id: '2', name: 'Urban Loft Studio', invested: 75000, currentValue: 82500, roi: 10 },
    { id: '3', name: 'Suburban Family Home', invested: 125000, currentValue: 145000, roi: 16 },
  ];

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          <Text style={styles.headerTitleGold}>My </Text>
          <Text style={styles.headerTitleBlack}>Portfolio</Text>
        </Text>
        <Text style={styles.headerSubtitle}>Track Your Investments</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Portfolio Overview */}
        <View style={styles.overviewCard}>
          <Text style={styles.overviewLabel}>Total Portfolio Value</Text>
          <Text style={styles.overviewValue}>{formatCurrency(portfolioValue)}</Text>

          <View style={styles.overviewStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Invested</Text>
              <Text style={styles.statValue}>{formatCurrency(totalInvested)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Return</Text>
              <Text style={[styles.statValue, styles.positiveReturn]}>
                +{formatCurrency(totalReturn)}
              </Text>
              <Text style={[styles.statPercentage, styles.positiveReturn]}>
                +{returnPercentage}%
              </Text>
            </View>
          </View>
        </View>

        {/* Active Investments */}
        <Text style={styles.sectionTitle}>Active Investments</Text>

        {investments.map((investment) => (
          <View key={investment.id} style={styles.investmentCard}>
            <View style={styles.investmentHeader}>
              <Text style={styles.investmentName}>{investment.name}</Text>
              <View style={styles.roiBadge}>
                <Ionicons name="trending-up" size={14} color={Colors.success} />
                <Text style={styles.roiText}>+{investment.roi}%</Text>
              </View>
            </View>

            <View style={styles.investmentStats}>
              <View style={styles.investmentStat}>
                <Text style={styles.investmentStatLabel}>Invested</Text>
                <Text style={styles.investmentStatValue}>
                  {formatCurrency(investment.invested)}
                </Text>
              </View>
              <View style={styles.investmentStat}>
                <Text style={styles.investmentStatLabel}>Current Value</Text>
                <Text style={[styles.investmentStatValue, styles.positiveReturn]}>
                  {formatCurrency(investment.currentValue)}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {/* Empty State Message */}
        <View style={styles.emptyState}>
          <Ionicons name="information-circle-outline" size={24} color={Colors.textSecondary} />
          <Text style={styles.emptyStateText}>
            This is a demo portfolio. Start investing to see your real investments here.
          </Text>
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: Typography.heading1,
    marginBottom: Spacing.xs,
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
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  overviewCard: {
    backgroundColor: Colors.towerGold,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  overviewLabel: {
    fontSize: Typography.bodySmall,
    color: Colors.pureWhite,
    opacity: 0.9,
    marginBottom: Spacing.xs,
  },
  overviewValue: {
    fontSize: Typography.heading1,
    fontWeight: Typography.bold,
    color: Colors.pureWhite,
    marginBottom: Spacing.lg,
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.pureWhite,
    opacity: 0.3,
    marginHorizontal: Spacing.md,
  },
  statLabel: {
    fontSize: Typography.bodySmall,
    color: Colors.pureWhite,
    opacity: 0.9,
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: Typography.heading4,
    fontWeight: Typography.semiBold,
    color: Colors.pureWhite,
  },
  statPercentage: {
    fontSize: Typography.bodySmall,
    fontWeight: Typography.semiBold,
    marginTop: 2,
  },
  positiveReturn: {
    color: Colors.success,
  },
  sectionTitle: {
    fontSize: Typography.heading3,
    fontWeight: Typography.bold,
    color: Colors.ebonyBlack,
    marginBottom: Spacing.md,
  },
  investmentCard: {
    backgroundColor: Colors.pureWhite,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.softSlate,
  },
  investmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  investmentName: {
    fontSize: Typography.heading4,
    fontWeight: Typography.semiBold,
    color: Colors.ebonyBlack,
    flex: 1,
  },
  roiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  roiText: {
    fontSize: Typography.bodySmall,
    fontWeight: Typography.semiBold,
    color: Colors.success,
    marginLeft: 4,
  },
  investmentStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  investmentStat: {
    flex: 1,
  },
  investmentStatLabel: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  investmentStatValue: {
    fontSize: Typography.body,
    fontWeight: Typography.semiBold,
    color: Colors.ebonyBlack,
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
  },
  emptyStateText: {
    flex: 1,
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
    lineHeight: 20,
  },
});
