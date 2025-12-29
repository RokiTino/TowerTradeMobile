import React from 'react';
import { StyleSheet, View, ViewStyle, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '@/constants/Theme';

interface TowerTradeLogoProps {
  width?: number;
  height?: number;
  style?: ViewStyle;
}

/**
 * TowerTrade Logo Component
 *
 * IMPORTANT: To use the official logo, save the logo image as:
 * /workspace/assets/images/towertrade-logo.png
 *
 * Until then, this component displays a styled text-based fallback.
 * See LOGO_SETUP.md for detailed instructions.
 */
export default function TowerTradeLogo({
  width = 250,
  style
}: TowerTradeLogoProps) {
  // Styled text-based logo matching official branding
  // Once towertrade-logo.png is added, update this component to use: <Image source={require('@/assets/images/towertrade-logo.png')} />
  const fontSize = width / 10; // Scale font size based on width
  const iconSize = width / 7;

  return (
    <View style={[styles.container, styles.fallbackContainer, style]}>
      <Ionicons name="business" size={iconSize} color={Colors.ebonyBlack} />
      <View style={styles.fallbackTextContainer}>
        <Text style={[styles.fallbackText, { fontSize }]}>
          <Text style={styles.fallbackTower}>Tower</Text>
          <Text style={styles.fallbackTrade}>Trade</Text>
        </Text>
        <Text style={[styles.fallbackTagline, { fontSize: fontSize * 0.4 }]}>
          invest from home.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackContainer: {
    flexDirection: 'column',
  },
  fallbackTextContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  fallbackText: {
    fontWeight: Typography.bold,
  },
  fallbackTower: {
    color: Colors.ebonyBlack,
  },
  fallbackTrade: {
    color: Colors.towerGold,
  },
  fallbackTagline: {
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
