import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Property } from '@/types/property';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/Theme';

interface PropertyCardProps {
  property: Property;
  onPress: (property: Property) => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - Spacing.lg * 2;

export default function PropertyCard({ property, onPress }: PropertyCardProps) {
  const progressPercentage = (property.raisedAmount / property.goalAmount) * 100;

  // Format currency to match design mockup (e.g., "2.000.000$")
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).replace(/,/g, '.')}$`;
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(property)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: property.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.name}>{property.name}</Text>
        <Text style={styles.goal}>{formatCurrency(property.goalAmount)}</Text>

        {/* Progress Bar with Percentage */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(progressPercentage, 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{Math.round(progressPercentage)}% funded</Text>
        </View>

        {property.aiInsight && (
          <View style={styles.aiInsightContainer}>
            <Text style={styles.aiInsightLabel}>AI Insight:</Text>
            <Text style={styles.aiInsightText}>{property.aiInsight}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.pureWhite,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    ...Shadows.card,
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.softSlate,
  },
  content: {
    padding: Spacing.md,
  },
  name: {
    fontSize: Typography.heading4,
    fontWeight: Typography.bold,
    color: Colors.ebonyBlack,
    marginBottom: Spacing.xs,
  },
  goal: {
    fontSize: Typography.body,
    fontWeight: Typography.semiBold,
    color: Colors.ebonyBlack,
    marginBottom: Spacing.md,
  },
  progressContainer: {
    marginBottom: Spacing.sm,
  },
  progressBackground: {
    height: 8,
    backgroundColor: Colors.softSlate,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.towerGold,
    borderRadius: BorderRadius.sm,
  },
  progressText: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
  },
  aiInsightContainer: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: '#FFF9F0',
    borderRadius: BorderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.towerGold,
  },
  aiInsightLabel: {
    fontSize: Typography.caption,
    fontWeight: Typography.semiBold,
    color: Colors.towerGold,
    marginBottom: 2,
  },
  aiInsightText: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
