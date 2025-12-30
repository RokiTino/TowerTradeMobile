import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Theme';

const { width } = Dimensions.get('window');
const BUTTON_WIDTH = width - Spacing.lg * 2;
const SLIDER_SIZE = 60;
const SLIDE_THRESHOLD = BUTTON_WIDTH - SLIDER_SIZE - 16;

interface SlideToPayButtonProps {
  onSlideComplete: () => void;
  disabled?: boolean;
}

export default function SlideToPayButton({ onSlideComplete, disabled = false }: SlideToPayButtonProps) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: () => {
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx >= 0 && gestureState.dx <= SLIDE_THRESHOLD) {
          slideAnim.setValue(gestureState.dx);

          // Fade text as slider moves
          const opacity = Math.max(0, 1 - (gestureState.dx / SLIDE_THRESHOLD) * 2);
          textOpacity.setValue(opacity);

          // Haptic feedback at milestones
          if (Platform.OS === 'ios' && gestureState.dx > SLIDE_THRESHOLD * 0.8) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx >= SLIDE_THRESHOLD) {
          // Success - slide completed
          Animated.spring(slideAnim, {
            toValue: SLIDE_THRESHOLD,
            useNativeDriver: false,
          }).start(() => {
            if (Platform.OS === 'ios') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            onSlideComplete();
          });
        } else {
          // Reset to start
          Animated.spring(slideAnim, {
            toValue: 0,
            friction: 8,
            tension: 100,
            useNativeDriver: false,
          }).start();
          Animated.spring(textOpacity, {
            toValue: 1,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const sliderStyle = {
    transform: [{ translateX: slideAnim }],
  };

  const progressWidth = slideAnim.interpolate({
    inputRange: [0, SLIDE_THRESHOLD],
    outputRange: [0, BUTTON_WIDTH - 16],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, disabled && styles.containerDisabled]}>
      {/* Progress Background */}
      <Animated.View style={[styles.progressBackground, { width: progressWidth }]} />

      {/* Text */}
      <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
        <Text style={styles.text}>Confirm Investment</Text>
        <Ionicons name="chevron-forward" size={20} color={Colors.pureWhite} />
      </Animated.View>

      {/* Slider */}
      <Animated.View
        style={[styles.slider, sliderStyle]}
        {...panResponder.panHandlers}
      >
        <View style={styles.sliderInner}>
          <Ionicons name="chevron-forward" size={28} color={Colors.towerGold} />
        </View>
      </Animated.View>

      {/* End Icon */}
      <View style={styles.endIcon}>
        <Ionicons name="checkmark" size={24} color={Colors.towerGold} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    height: 70,
    backgroundColor: Colors.towerGold,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  containerDisabled: {
    opacity: 0.5,
  },
  progressBackground: {
    position: 'absolute',
    left: 8,
    top: 8,
    bottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BorderRadius.lg,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  text: {
    fontSize: Typography.heading4,
    fontWeight: Typography.bold,
    color: Colors.pureWhite,
    letterSpacing: 1,
  },
  slider: {
    position: 'absolute',
    left: 8,
    width: SLIDER_SIZE,
    height: SLIDER_SIZE,
    borderRadius: SLIDER_SIZE / 2,
  },
  sliderInner: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.pureWhite,
    borderRadius: SLIDER_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  endIcon: {
    position: 'absolute',
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.pureWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
