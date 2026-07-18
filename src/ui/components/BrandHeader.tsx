import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme/theme';

export function BrandHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.logoCircle}>
        <Text style={styles.logoLetter}>D</Text>
      </View>
      <View style={styles.textGroup}>
        <Text style={styles.title}>Dissectra</Text>
        <Text style={styles.subtitle}>AI-Powered 3D Anatomy Analysis</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 6,
  },
  logoLetter: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.onPrimary,
  },
  textGroup: {
    flex: 1,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    ...theme.typography.body1,
    color: theme.colors.textSecondary,
  },
});
