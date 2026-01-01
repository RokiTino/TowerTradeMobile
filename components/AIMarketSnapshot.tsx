/**
 * AI Market Snapshot Component
 * Generates a professional market overview using Newell AI
 * Displays after successful login with Tower Gold premium styling
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTextGeneration } from '@fastshot/ai';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Theme';
import { Property } from '@/types/property';
import { PropertyService } from '@/services/PropertyService';

interface AIMarketSnapshotProps {
  visible: boolean;
  onClose: () => void;
  userName?: string;
}

export default function AIMarketSnapshot({ visible, onClose, userName }: AIMarketSnapshotProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const { generateText, data, isLoading, error } = useTextGeneration();
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Load properties and generate snapshot
      loadMarketSnapshot();
    }
  }, [visible]);

  const loadMarketSnapshot = async () => {
    try {
      // Fetch current property data
      const props = await PropertyService.getProperties();
      setProperties(props);

      // Generate AI market snapshot
      const topProperties = props
        .sort((a, b) => b.expectedROI - a.expectedROI)
        .slice(0, 5);

      const marketData = topProperties.map((p) => ({
        name: p.name,
        location: p.location,
        type: p.type,
        expectedROI: p.expectedROI,
        funded: p.raisedAmount,
        goal: p.goalAmount,
        fundingProgress: Math.round((p.raisedAmount / p.goalAmount) * 100),
      }));

      const prompt = `You are a luxury real estate investment advisor for TowerTrade. Create a professional, concise market snapshot greeting for ${userName || 'our investor'}.

Current top-performing properties:
${JSON.stringify(marketData, null, 2)}

Write a 2-3 sentence professional greeting that:
1. Welcomes the investor warmly
2. Highlights 1-2 standout investment opportunities with specific numbers
3. Creates excitement about current market conditions
4. Uses a sophisticated, premium tone

Keep it concise and actionable. Focus on the best opportunities.`;

      await generateText(prompt);
    } catch (err) {
      console.error('Error loading market snapshot:', err);
    }
  };

  const handleClose = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="trending-up" size={32} color={Colors.towerGold} />
            </View>
            <Text style={styles.title}>Market Snapshot</Text>
            <Text style={styles.subtitle}>AI-Powered Investment Insights</Text>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.towerGold} />
                <Text style={styles.loadingText}>
                  Analyzing market trends...
                </Text>
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={24} color="#E74C3C" />
                <Text style={styles.errorText}>
                  Unable to generate market snapshot. Please try again.
                </Text>
              </View>
            )}

            {data && !isLoading && (
              <View style={styles.snapshotContainer}>
                <Text style={styles.snapshotText}>{data}</Text>

                {/* Live Indicator */}
                <View style={styles.liveIndicator}>
                  <View style={styles.livePulse} />
                  <Text style={styles.liveText}>Live Market Data</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.8}
          >
            <Text style={styles.closeButtonText}>
              Explore Opportunities
            </Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.pureWhite} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  container: {
    backgroundColor: Colors.pureWhite,
    borderRadius: BorderRadius.xl,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    shadowColor: Colors.towerGold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF9F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: Typography.bold,
    color: Colors.ebonyBlack,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
  },
  contentScroll: {
    maxHeight: 400,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.body,
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  errorText: {
    marginTop: Spacing.sm,
    fontSize: Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  snapshotContainer: {
    backgroundColor: '#FAFAFA',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  snapshotText: {
    fontSize: Typography.body,
    lineHeight: 24,
    color: Colors.ebonyBlack,
    fontWeight: Typography.medium,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  livePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2ECC71',
    marginRight: Spacing.xs,
  },
  liveText: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    fontWeight: Typography.semiBold,
  },
  closeButton: {
    flexDirection: 'row',
    backgroundColor: Colors.towerGold,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.lg,
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.towerGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  closeButtonText: {
    color: Colors.pureWhite,
    fontSize: Typography.body,
    fontWeight: Typography.bold,
    marginRight: Spacing.xs,
    letterSpacing: 0.5,
  },
});
