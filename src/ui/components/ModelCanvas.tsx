import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../theme/theme';

interface ModelCanvasProps {
  uri?: string;
  onLoad3D?: () => void;
}

export function ModelCanvas({ uri, onLoad3D }: ModelCanvasProps) {
  if (!uri) {
    return (
      <View style={styles.empty}>
        <Text style={styles.text}>No model selected</Text>
        <Text style={styles.subtext}>Scan an object to generate a 3D model</Text>
      </View>
    );
  }

  return (
    <View style={styles.canvas}>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderTitle}>3D Model Viewer</Text>
        <Text style={styles.placeholderText}>
          {uri ? 'Model available for viewing' : 'No model loaded'}
        </Text>
        <TouchableOpacity 
          style={styles.loadButton}
          onPress={onLoad3D}
        >
          <Text style={styles.loadButtonText}>Load 3D Viewer</Text>
        </TouchableOpacity>
        <Text style={styles.comingSoon}>3D rendering coming soon</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: { 
    height: 360, 
    borderRadius: 24, 
    overflow: 'hidden', 
    backgroundColor: theme.colors.surfaceVariant,
  },
  empty: { 
    height: 260, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: theme.colors.surface, 
    borderRadius: 24,
    padding: theme.spacing.lg,
  },
  text: { 
    ...theme.typography.h6,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtext: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  placeholderTitle: {
    ...theme.typography.h4,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  placeholderText: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  loadButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
  },
  loadButtonText: {
    ...theme.typography.subtitle1,
    color: theme.colors.onPrimary,
    fontWeight: '600',
  },
  comingSoon: {
    ...theme.typography.caption,
    color: theme.colors.textDisabled,
  },
});
