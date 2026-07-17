import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme/theme';

interface LoadingStateProps {
  label?: string;
  size?: 'small' | 'large';
}

export function LoadingState({ label = 'Loading...', size = 'large' }: LoadingStateProps) {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator color={theme.colors.primary} size={size} />
      {label && <Text style={styles.text}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  text: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
});
