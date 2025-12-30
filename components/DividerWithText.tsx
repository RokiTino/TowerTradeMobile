/**
 * Sophisticated Divider with Centered Text
 * Premium horizontal divider for separating authentication methods
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/Theme';

interface DividerWithTextProps {
  text?: string;
}

export default function DividerWithText({ text = 'or' }: DividerWithTextProps) {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <View style={styles.textContainer}>
        <Text style={styles.text}>{text}</Text>
      </View>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.softSlate,
  },
  textContainer: {
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.pureWhite,
  },
  text: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
});
