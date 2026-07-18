import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { GlassCard } from '../components/GlassCard';
import { useTheme } from '../../theme/ThemeProvider';

interface SettingItemProps {
  title: string;
  description?: string;
  onPress: () => void;
  showArrow?: boolean;
}

export function SettingsScreen() {
  const { theme, appearance, setAppearance } = useTheme();
  const styles = makeStyles(theme);

  function toggleDark() {
    setAppearance(appearance === 'dark' ? 'light' : 'dark');
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
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>
      
      <GlassCard variant="elevated">
        <Text style={styles.sectionTitle}>Appearance</Text>
        <SettingItem
          title={appearance === 'dark' ? 'Dark Mode' : 'Light Mode'}
          description={appearance === 'dark' ? 'Currently enabled' : 'Currently disabled'}
          onPress={toggleDark}
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

function makeStyles(themeObj: any) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: themeObj.colors.background },
    content: { padding: themeObj.spacing.lg, gap: themeObj.spacing.lg },
    title: { ...themeObj.typography.h2, color: themeObj.colors.text, marginBottom: themeObj.spacing.sm },
    sectionTitle: { ...themeObj.typography.overline, color: themeObj.colors.primary, marginBottom: themeObj.spacing.md },
    settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: themeObj.spacing.md },
    settingContent: { flex: 1 },
    settingTitle: { ...themeObj.typography.body1, color: themeObj.colors.text, fontWeight: '500' },
    settingDescription: { ...themeObj.typography.body2, color: themeObj.colors.textSecondary, marginTop: 2 },
    arrow: { ...themeObj.typography.h3, color: themeObj.colors.textSecondary, marginLeft: themeObj.spacing.md },
    divider: { height: 1, backgroundColor: themeObj.colors.divider, marginVertical: themeObj.spacing.sm },
  });
}
