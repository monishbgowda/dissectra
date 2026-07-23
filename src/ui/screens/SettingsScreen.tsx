import React from 'react';

import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  accents,
  AccentName,
  AppearanceMode,
} from '../../theme/theme';

import {
  useTheme,
} from '../../theme/ThemeProvider';

const modes: {
  key: AppearanceMode;
  label: string;
}[] = [
  {
    key: 'light',
    label: 'Light',
  },
  {
    key: 'dark',
    label: 'Dark',
  },
  {
    key: 'system',
    label: 'System',
  },
];

const accentOptions: AccentName[] = [
  'monochrome',
  'blue',
  'violet',
  'green',
  'orange',
];

export function SettingsScreen() {
  const {
    theme,
    appearance,
    accent,
    setAppearance,
    setAccent,
  } = useTheme();

  const styles = makeStyles(theme);

  return (
    <SafeAreaView
      edges={[
        'top',
        'left',
        'right',
      ]}
      style={styles.safe}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            Settings
          </Text>
        </View>

        <Text style={styles.sectionLabel}>
          APPEARANCE
        </Text>

        <View style={styles.card}>
          <View style={styles.settingBlock}>
            <Text style={styles.settingLabel}>
              Mode
            </Text>

            <View style={styles.segment}>
              {modes.map(mode => {
                const selected =
                  appearance === mode.key;

                return (
                  <TouchableOpacity
                    key={mode.key}
                    style={[
                      styles.segmentButton,
                      selected &&
                        styles.segmentSelected,
                    ]}
                    onPress={() =>
                      setAppearance(mode.key)
                    }
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        selected &&
                          styles.segmentTextSelected,
                      ]}
                    >
                      {mode.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.settingBlock}>
            <Text style={styles.settingLabel}>
              Theme Color
            </Text>

            <View style={styles.colorRow}>
              {accentOptions.map(name => {
                const selected =
                  accent === name;

                const swatch =
                  name === 'monochrome'
                    ? theme.mode === 'dark'
                      ? '#FFFFFF'
                      : '#111111'
                    : accents[name];

                return (
                  <TouchableOpacity
                    key={name}
                    accessibilityLabel={`${name} theme`}
                    style={[
                      styles.colorOuter,
                      selected &&
                        styles.colorOuterSelected,
                    ]}
                    onPress={() =>
                      setAccent(name)
                    }
                  >
                    <View
                      style={[
                        styles.colorCircle,
                        {
                          backgroundColor:
                            swatch,
                        },
                      ]}
                    />

                    {selected && (
                      <Text
                        style={[
                          styles.check,
                          {
                            color:
                              name ===
                              'monochrome'
                                ? theme.mode ===
                                  'dark'
                                  ? '#000'
                                  : '#FFF'
                                : '#FFF',
                          },
                        ]}
                      >
                        ✓
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>
          GENERAL
        </Text>

        <View style={styles.card}>
          <SettingToggle
            label="Haptic Feedback"
            theme={theme}
            styles={styles}
          />

          <View style={styles.divider} />

          <SettingToggle
            label="Animations"
            theme={theme}
            styles={styles}
          />
        </View>

        <Text style={styles.sectionLabel}>
          DATA
        </Text>

        <View style={styles.card}>
          <SettingRow
            label="Manage Scan History"
            styles={styles}
          />

          <View style={styles.divider} />

          <SettingRow
            label="Clear Cached Models"
            styles={styles}
          />
        </View>

        <Text style={styles.sectionLabel}>
          ABOUT
        </Text>

        <View style={styles.card}>
          <SettingRow
            label="About Dissectra"
            styles={styles}
          />

          <View style={styles.divider} />

          <SettingRow
            label="Privacy Policy"
            styles={styles}
          />

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.rowText}>
              Version
            </Text>

            <Text style={styles.value}>
              1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingToggle({
  label,
  theme,
  styles,
}: any) {
  const [enabled, setEnabled] =
    React.useState(true);

  return (
    <View style={styles.row}>
      <Text style={styles.rowText}>
        {label}
      </Text>

      <Switch
        value={enabled}
        onValueChange={setEnabled}
        trackColor={{
          false:
            theme.colors.surfaceVariant,
          true:
            theme.colors.inverseBackground,
        }}
        thumbColor={
          theme.colors.inverseText
        }
      />
    </View>
  );
}

function SettingRow({
  label,
  styles,
}: any) {
  return (
    <TouchableOpacity style={styles.row}>
      <Text style={styles.rowText}>
        {label}
      </Text>

      <Text style={styles.arrow}>
        ›
      </Text>
    </TouchableOpacity>
  );
}

function makeStyles(theme: any) {
  return StyleSheet.create({
    safe: {
      flex: 1,

      backgroundColor:
        theme.colors.background,
    },

    content: {
      width: '100%',
      maxWidth: 720,

      alignSelf: 'center',

      paddingHorizontal: 20,
      paddingBottom: 40,
    },

    header: {
      minHeight: 64,

      justifyContent: 'center',

      borderBottomWidth: 1,
      borderBottomColor:
        theme.colors.divider,

      marginBottom: 24,
    },

    title: {
      color: theme.colors.text,

      fontSize: 21,
      fontWeight: '700',
    },

    sectionLabel: {
      color:
        theme.colors.textSecondary,

      fontSize: 10,
      fontWeight: '700',

      letterSpacing: 0.7,

      marginBottom: 9,
      marginTop: 4,
    },

    card: {
      backgroundColor:
        theme.colors.card,

      borderRadius: 15,

      borderWidth: 1,
      borderColor: theme.colors.border,

      paddingHorizontal: 16,

      marginBottom: 26,

      overflow: 'hidden',
    },

    settingBlock: {
      paddingVertical: 16,
    },

    settingLabel: {
      color: theme.colors.text,

      fontSize: 13,
      fontWeight: '500',

      marginBottom: 12,
    },

    segment: {
      flexDirection: 'row',

      backgroundColor:
        theme.colors.surfaceVariant,

      padding: 4,

      borderRadius: 12,
    },

    segmentButton: {
      flex: 1,

      minHeight: 40,

      alignItems: 'center',
      justifyContent: 'center',

      borderRadius: 9,
    },

    segmentSelected: {
      backgroundColor:
        theme.colors.background,

      ...theme.shadows.sm,
    },

    segmentText: {
      color:
        theme.colors.textSecondary,

      fontSize: 12,
      fontWeight: '500',
    },

    segmentTextSelected: {
      color: theme.colors.text,

      fontWeight: '700',
    },

    colorRow: {
      flexDirection: 'row',

      alignItems: 'center',

      gap: 13,
    },

    colorOuter: {
      width: 34,
      height: 34,

      borderRadius: 17,

      alignItems: 'center',
      justifyContent: 'center',

      borderWidth: 2,
      borderColor: 'transparent',
    },

    colorOuterSelected: {
      borderColor:
        theme.colors.text,
    },

    colorCircle: {
      width: 24,
      height: 24,

      borderRadius: 12,
    },

    check: {
      position: 'absolute',

      fontSize: 13,
      fontWeight: '900',
    },

    divider: {
      height: 1,

      backgroundColor:
        theme.colors.divider,
    },

    row: {
      minHeight: 56,

      flexDirection: 'row',

      alignItems: 'center',
      justifyContent: 'space-between',
    },

    rowText: {
      color: theme.colors.text,

      fontSize: 14,
    },

    arrow: {
      color:
        theme.colors.textSecondary,

      fontSize: 24,
      fontWeight: '300',
    },

    value: {
      color:
        theme.colors.textSecondary,

      fontSize: 13,
    },
  });
}