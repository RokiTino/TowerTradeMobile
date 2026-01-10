import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import PropertyCard from '@/components/PropertyCard';
import { Property } from '@/types/property';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Theme';
import { generateBatchInsights } from '@/services/aiInsightService';
import { PropertyService } from '@/services/PropertyService';

const mergePropertiesWithInsights = (
  updatedProperties: Property[],
  currentProperties: Property[]
): Property[] => {
  return updatedProperties.map((prop) => {
    const existing = currentProperties.find((p) => p.id === prop.id);
    return {
      ...prop,
      aiInsight: existing?.aiInsight || prop.aiInsight || 'Investment analysis pending.',
    };
  });
};

export default function DiscoveryScreen() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [aiInsightsLoading, setAiInsightsLoading] = useState(true);

  useEffect(() => {
    loadProperties();

    // Subscribe to real-time property updates
    const unsubscribe = PropertyService.subscribeToProperties((updatedProperties) => {
      setProperties((currentProperties) =>
        mergePropertiesWithInsights(updatedProperties, currentProperties)
      );
    });

    return () => unsubscribe();
  }, []);

  const loadProperties = async () => {
    // First, load properties from service
    const loadedProperties = await PropertyService.getProperties();
    setProperties(loadedProperties);
    setIsLoading(false);

    // Then generate AI insights in the background
    setAiInsightsLoading(true);
    try {
      const insights = await generateBatchInsights(loadedProperties);

      // Update properties with AI insights
      setProperties((currentProperties) =>
        currentProperties.map((property) => ({
          ...property,
          aiInsight: insights.get(property.id) || 'Investment analysis pending.',
        }))
      );
    } catch (error) {
      console.error('Error loading AI insights:', error);
    } finally {
      setAiInsightsLoading(false);
      setRefreshing(false);
    }
  };

  const handlePropertyPress = (property: Property) => {
    router.push({
      pathname: '/property/[id]',
      params: { id: property.id },
    });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadProperties();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.towerGold} />
          <Text style={styles.loadingText}>Loading premium properties...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        {/* Horizontal Logo Layout */}
        <View style={styles.logoContainer}>
          <Image source={require('@/assets/images/logo.png')} style={styles.logoImage} />
        </View>

        {/* Large Header Text */}
        <Text style={styles.headerTitle}>Find your next investment</Text>

        {aiInsightsLoading && (
          <View style={styles.aiLoadingBanner}>
            <ActivityIndicator size="small" color={Colors.towerGold} />
            <Text style={styles.aiLoadingText}>Generating AI insights...</Text>
          </View>
        )}
      </View>

      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PropertyCard property={item} onPress={handlePropertyPress} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.towerGold}
            colors={[Colors.towerGold]}
          />
        }
      />
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  logoImage: {
    width: 180,
    height: 60,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: Typography.bold,
    color: Colors.ebonyBlack,
    marginBottom: Spacing.sm,
  },
  aiLoadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    backgroundColor: '#FFF9F0',
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  aiLoadingText: {
    fontSize: Typography.caption,
    color: Colors.towerGold,
    marginLeft: Spacing.xs,
    fontWeight: Typography.medium,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.body,
    color: Colors.textSecondary,
  },
});
