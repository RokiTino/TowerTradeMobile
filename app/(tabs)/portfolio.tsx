import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { generateText } from '@fastshot/ai';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Theme';
import TowerTradeLogo from '@/components/TowerTradeLogo';
import { Transaction } from '@/types/payment';
import { getTransactions } from '@/utils/storage';

export default function PortfolioScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState(false);

  const portfolioValue = 285000;
  const totalInvested = 250000;
  const totalReturn = 35000;
  const returnPercentage = ((totalReturn / totalInvested) * 100).toFixed(2);

  const investments = [
    { id: '1', name: 'Beachfront Villa', invested: 50000, currentValue: 57500, roi: 15, type: 'Beachfront' },
    { id: '2', name: 'Urban Loft Studio', invested: 75000, currentValue: 82500, roi: 10, type: 'Urban' },
    { id: '3', name: 'Suburban Family Home', invested: 125000, currentValue: 145000, roi: 16, type: 'Suburban' },
  ];

  useEffect(() => {
    loadTransactions();
    generateAIAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTransactions = async () => {
    try {
      const txns = await getTransactions();
      setTransactions(txns);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const generateAIAnalysis = async () => {
    setLoadingAI(true);
    try {
      // Analyze portfolio composition
      const beachfrontCount = investments.filter(i => i.type === 'Beachfront').length;
      const urbanCount = investments.filter(i => i.type === 'Urban').length;
      const suburbanCount = investments.filter(i => i.type === 'Suburban').length;

      const portfolioSummary = `Portfolio: ${investments.length} properties - ${beachfrontCount} Beachfront, ${urbanCount} Urban, ${suburbanCount} Suburban. Total value: $${portfolioValue}, Return: ${returnPercentage}%.`;

      const response = await generateText({
        prompt: `As a real estate investment advisor, analyze this portfolio and provide 2-3 concise diversification recommendations: ${portfolioSummary}. Focus on balance and risk mitigation. Keep response under 100 words.`,
        maxTokens: 150,
      });

      setAiAnalysis(response || 'Unable to generate analysis at this time.');
    } catch (error) {
      console.error('AI analysis error:', error);
      setAiAnalysis('Portfolio analysis unavailable. Please try again later.');
    } finally {
      setLoadingAI(false);
    }
  };

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
        <TowerTradeLogo width={220} />
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

        {/* AI Portfolio Counselor */}
        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <Ionicons name="sparkles" size={24} color={Colors.towerGold} />
            <Text style={styles.aiTitle}>AI Portfolio Counselor</Text>
          </View>
          {loadingAI ? (
            <View style={styles.aiLoading}>
              <ActivityIndicator color={Colors.towerGold} />
              <Text style={styles.aiLoadingText}>Analyzing your portfolio...</Text>
            </View>
          ) : (
            <Text style={styles.aiText}>{aiAnalysis}</Text>
          )}
        </View>

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {transactions.slice(0, 5).map((transaction) => (
              <View key={transaction.id} style={styles.transactionCard}>
                <View style={styles.transactionIcon}>
                  <Ionicons name="arrow-up" size={20} color={Colors.towerGold} />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionName}>{transaction.propertyName}</Text>
                  <Text style={styles.transactionDate}>
                    {new Date(transaction.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={styles.transactionAmount}>
                    {formatCurrency(transaction.amount)}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      transaction.status === 'completed' && styles.statusCompleted,
                      transaction.status === 'pending' && styles.statusPending,
                      transaction.status === 'processing' && styles.statusProcessing,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        transaction.status === 'completed' && styles.statusTextCompleted,
                        transaction.status === 'pending' && styles.statusTextPending,
                        transaction.status === 'processing' && styles.statusTextProcessing,
                      ]}
                    >
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

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
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
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
  aiCard: {
    backgroundColor: '#FFF9F0',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.towerGold,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  aiTitle: {
    fontSize: Typography.heading4,
    fontWeight: Typography.bold,
    color: Colors.ebonyBlack,
  },
  aiLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  aiLoadingText: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
  },
  aiText: {
    fontSize: Typography.body,
    color: Colors.ebonyBlack,
    lineHeight: 22,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.pureWhite,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.softSlate,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF9F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontSize: Typography.body,
    fontWeight: Typography.semiBold,
    color: Colors.ebonyBlack,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: Typography.body,
    fontWeight: Typography.semiBold,
    color: Colors.ebonyBlack,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  statusCompleted: {
    backgroundColor: '#E8F5E9',
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
  },
  statusProcessing: {
    backgroundColor: '#E3F2FD',
  },
  statusText: {
    fontSize: Typography.caption,
    fontWeight: Typography.semiBold,
  },
  statusTextCompleted: {
    color: Colors.success,
  },
  statusTextPending: {
    color: Colors.warning,
  },
  statusTextProcessing: {
    color: '#2196F3',
  },
});
