import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { GlassCard } from '../components/GlassCard';
import { ModelCanvas } from '../components/ModelCanvas';
import { BrandHeader } from '../components/BrandHeader';
import { theme } from '../../theme/theme';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
}

function FeatureCard({ icon, title, description, onPress }: FeatureCardProps) {
  return (
    <TouchableOpacity style={styles.featureCard} onPress={onPress}>
      <View style={styles.featureIcon}>
        <Text style={styles.featureIconText}>{icon}</Text>
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
}

export function HomeScreen({ route, navigation }: any) {
  const scan = route?.params?.scan;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <BrandHeader />

      {/* Feature Cards */}
      <View style={styles.featureRow}>
        <FeatureCard
          icon="📷"
          title="Scan Object"
          description="Capture images for analysis"
          onPress={() => navigation.navigate('Scan')}
        />
        <FeatureCard
          icon="📊"
          title="View History"
          description="Browse past scans"
          onPress={() => navigation.navigate('History')}
        />
      </View>

      {/* Current Model Section */}
      {scan ? (
        <GlassCard variant="elevated">
          <Text style={styles.sectionTitle}>Current Model</Text>
          <ModelCanvas uri={scan.localModelPath || scan.modelUri} />
          <View style={styles.modelInfo}>
            <Text style={styles.modelName}>{scan.analysis.object}</Text>
            <Text style={styles.modelStatus}>
              Status: {scan.status === 'complete' ? '✓ Ready' : scan.status}
            </Text>
          </View>
        </GlassCard>
      ) : (
        <GlassCard variant="elevated">
          <Text style={styles.sectionTitle}>Quick Start</Text>
          <Text style={styles.emptyState}>
            No model loaded. Start by scanning an object to generate a 3D model.
          </Text>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Scan')}
          >
            <Text style={styles.primaryButtonText}>Start Scanning</Text>
          </TouchableOpacity>
        </GlassCard>
      )}

      {/* Recent Activity */}
      <GlassCard variant="elevated">
        <Text style={styles.sectionTitle}>Features</Text>
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Text style={styles.featureItemIcon}>🧠</Text>
            <View style={styles.featureItemContent}>
              <Text style={styles.featureItemTitle}>AI Analysis</Text>
              <Text style={styles.featureItemDesc}>Advanced object recognition</Text>
            </View>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureItemIcon}>🎨</Text>
            <View style={styles.featureItemContent}>
              <Text style={styles.featureItemTitle}>3D Generation</Text>
              <Text style={styles.featureItemDesc}>Interactive model viewing</Text>
            </View>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureItemIcon}>💾</Text>
            <View style={styles.featureItemContent}>
              <Text style={styles.featureItemTitle}>Offline Storage</Text>
              <Text style={styles.featureItemDesc}>Save scans locally</Text>
            </View>
          </View>
        </View>
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, gap: theme.spacing.lg },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body1,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  featureCard: {
    flex: 1,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  featureIconText: {
    fontSize: 20,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...theme.typography.subtitle1,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  featureDescription: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  sectionTitle: {
    ...theme.typography.h5,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  emptyState: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...theme.typography.subtitle1,
    color: theme.colors.onPrimary,
    fontWeight: '600',
  },
  modelInfo: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  modelName: {
    ...theme.typography.h6,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  modelStatus: {
    ...theme.typography.body2,
    color: theme.colors.success,
  },
  featureList: {
    gap: theme.spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  featureItemIcon: {
    fontSize: 24,
  },
  featureItemContent: {
    flex: 1,
  },
  featureItemTitle: {
    ...theme.typography.subtitle1,
    color: theme.colors.text,
    fontWeight: '500',
  },
  featureItemDesc: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
});
