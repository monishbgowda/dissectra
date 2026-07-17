import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { GlassCard } from '../components/GlassCard';
import { theme } from '../../theme/theme';

interface SettingItemProps {
  title: string;
  description?: string;
  onPress: () => void;
  showArrow?: boolean;
}

function SettingItem({ title, description, onPress, showArrow = true }: SettingItemProps) {
  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
      </View>
      {showArrow && <Text style={styles.arrow}>›</Text>}
    </TouchableOpacity>
  );
}

export function SettingsScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>
      
      <GlassCard variant="elevated">
        <Text style={styles.sectionTitle}>Appearance</Text>
        <SettingItem
          title="Dark Mode"
          description="Currently enabled"
          onPress={() => {}}
        />
        <View style={styles.divider} />
        <SettingItem
          title="Theme Color"
          description="Cyan Blue"
          onPress={() => {}}
        />
      </GlassCard>

      <GlassCard variant="elevated">
        <Text style={styles.sectionTitle}>Storage</Text>
        <SettingItem
          title="Clear Cache"
          description="Free up storage space"
          onPress={() => {}}
        />
        <View style={styles.divider} />
        <SettingItem
          title="Manage Downloads"
          description="View offline models"
          onPress={() => {}}
        />
      </GlassCard>

      <GlassCard variant="elevated">
        <Text style={styles.sectionTitle}>About</Text>
        <SettingItem
          title="Version"
          description="1.0.0"
          onPress={() => {}}
          showArrow={false}
        />
        <View style={styles.divider} />
        <SettingItem
          title="Privacy Policy"
          onPress={() => {}}
        />
        <View style={styles.divider} />
        <SettingItem
          title="Terms of Service"
          onPress={() => {}}
        />
      </GlassCard>

      <GlassCard variant="elevated">
        <SettingItem
          title="Rate App"
          description="Leave a review on Play Store"
          onPress={() => {}}
        />
        <View style={styles.divider} />
        <SettingItem
          title="Send Feedback"
          description="Report bugs or suggest features"
          onPress={() => {}}
        />
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    ...theme.typography.overline,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    ...theme.typography.body1,
    color: theme.colors.text,
    fontWeight: '500',
  },
  settingDescription: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  arrow: {
    ...theme.typography.h3,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: theme.spacing.sm,
  },
});
