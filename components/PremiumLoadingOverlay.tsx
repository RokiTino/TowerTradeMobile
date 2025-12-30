/**
 * Premium Loading Overlay
 * High-end loading state with shimmer effect
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Modal } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/Theme';

interface PremiumLoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export default function PremiumLoadingOverlay({
  visible,
  message = 'Authenticating...',
}: PremiumLoadingOverlayProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Shimmer animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <View style={styles.content}>
          {/* Premium Shimmer Loader */}
          <View style={styles.loaderContainer}>
            <View style={styles.loaderBar}>
              <Animated.View
                style={[
                  styles.shimmer,
                  {
                    transform: [{ translateX: shimmerTranslateX }],
                  },
                ]}
              />
            </View>
          </View>

          {/* TowerTrade Logo Accent */}
          <View style={styles.logoAccent}>
            <View style={styles.towerIcon} />
          </View>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>
          <Text style={styles.submessage}>Please wait...</Text>
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
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  loaderContainer: {
    width: 200,
    marginBottom: Spacing.xl,
  },
  loaderBar: {
    height: 4,
    backgroundColor: 'rgba(176, 141, 87, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  shimmer: {
    width: 200,
    height: '100%',
    backgroundColor: Colors.towerGold,
    opacity: 0.8,
  },
  logoAccent: {
    marginBottom: Spacing.lg,
  },
  towerIcon: {
    width: 40,
    height: 50,
    backgroundColor: Colors.towerGold,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    opacity: 0.9,
  },
  message: {
    fontSize: Typography.heading3,
    fontWeight: Typography.semiBold,
    color: Colors.pureWhite,
    marginBottom: Spacing.xs,
    letterSpacing: 0.5,
  },
  submessage: {
    fontSize: Typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 1,
  },
});
