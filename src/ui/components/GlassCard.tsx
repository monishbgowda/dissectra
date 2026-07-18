import React, { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { theme } from '../../theme/theme';

interface GlassCardProps extends PropsWithChildren {
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
}

export function GlassCard({ children, style, variant = 'default' }: GlassCardProps) {
  return <View style={[styles.card, styles[variant], style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
  },
  default: {
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  elevated: {
    ...theme.shadows.md,
  },
  outlined: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
});
