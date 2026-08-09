import React from 'react';

import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Icon from
  'react-native-vector-icons/Ionicons';

import {
  AppScreen,
} from '../components/AppScreen';

import {
  useTheme,
} from '../../theme/ThemeProvider';

interface Step {
  title: string;

  subtitle?: string;

  state:
    | 'complete'
    | 'active'
    | 'waiting';
}

export function AnalyzingScreen() {
  const { theme } = useTheme();

  const styles =
    createStyles(theme);

  const steps: Step[] = [
    {
      title:
        'Preparing image',

      state: 'complete',
    },

    {
      title:
        'Identifying object',

      state: 'complete',
    },

    {
      title:
        'Understanding components',

      subtitle:
        'Detecting and analyzing parts',

      state: 'active',
    },

    {
      title:
        'Finding 3D model',

      state: 'waiting',
    },

    {
      title:
        'Preparing dissection',

      state: 'waiting',
    },
  ];

  return (
    <AppScreen>
      <View style={styles.header}>
        <Icon
          name="chevron-back"
          size={26}
          color={theme.colors.text}
        />

        <Text style={styles.headerTitle}>
          Analyzing
        </Text>

        <View style={{ width: 26 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          Analyzing your object
        </Text>

        <Text style={styles.subtitle}>
          This may take a few moments
        </Text>

        <View style={styles.timeline}>
          {steps.map(
            (step, index) => (
              <View
                key={step.title}
                style={styles.stepRow}
              >
                <View
                  style={
                    styles.indicatorColumn
                  }
                >
                  <View
                    style={[
                      styles.indicator,

                      step.state ===
                        'complete' &&
                        styles.completeIndicator,
                    ]}
                  >
                    {step.state ===
                      'complete' && (
                      <Icon
                        name="checkmark"
                        size={15}
                        color={
                          theme.colors
                            .background
                        }
                      />
                    )}

                    {step.state ===
                      'active' && (
                      <View
                        style={
                          styles.activeDot
                        }
                      />
                    )}
                  </View>

                  {index <
                    steps.length - 1 && (
                    <View
                      style={
                        styles.timelineLine
                      }
                    />
                  )}
                </View>

                <View
                  style={
                    styles.stepContent
                  }
                >
                  <Text
                    style={
                      styles.stepTitle
                    }
                  >
                    {step.title}
                  </Text>

                  {step.subtitle && (
                    <Text
                      style={
                        styles.stepSubtitle
                      }
                    >
                      {step.subtitle}
                    </Text>
                  )}
                </View>
              </View>
            ),
          )}
        </View>

        <View style={styles.result}>
          <View>
            <Text
              style={
                styles.resultLabel
              }
            >
              Identified as
            </Text>

            <Text
              style={
                styles.resultValue
              }
            >
              Cordless Drill
            </Text>
          </View>

          <View
            style={{
              alignItems: 'flex-end',
            }}
          >
            <Text
              style={
                styles.resultLabel
              }
            >
              Confidence
            </Text>

            <Text
              style={
                styles.resultValue
              }
            >
              92%
            </Text>
          </View>
        </View>

        <View style={styles.info}>
          <Icon
            name="information-circle-outline"
            size={21}
            color={theme.colors.text}
          />

          <Text style={styles.infoText}>
            You will be able to review and
            edit details before continuing.
          </Text>
        </View>
      </View>
    </AppScreen>
  );
}

function createStyles(
  theme: any,
) {
  return StyleSheet.create({
    header: {
      height: 58,

      paddingHorizontal: 18,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        theme.colors.divider,
    },

    headerTitle: {
      color: theme.colors.text,

      fontSize: 16,

      fontWeight: '700',
    },

    content: {
      flex: 1,

      padding: 24,
    },

    title: {
      color: theme.colors.text,

      fontSize: 23,

      fontWeight: '700',

      marginTop: 12,
    },

    subtitle: {
      color:
        theme.colors.textSecondary,

      fontSize: 13,

      marginTop: 6,
    },

    timeline: {
      marginTop: 40,
    },

    stepRow: {
      minHeight: 68,

      flexDirection: 'row',
    },

    indicatorColumn: {
      width: 36,

      alignItems: 'center',
    },

    indicator: {
      width: 24,

      height: 24,

      borderRadius: 12,

      borderWidth: 1.5,

      borderColor:
        theme.colors.textSecondary,

      alignItems: 'center',

      justifyContent: 'center',
    },

    completeIndicator: {
      borderColor:
        theme.colors.text,

      backgroundColor:
        theme.colors.text,
    },

    activeDot: {
      width: 7,

      height: 7,

      borderRadius: 4,

      backgroundColor:
        theme.colors.text,
    },

    timelineLine: {
      flex: 1,

      width: 1,

      backgroundColor:
        theme.colors.border,
    },

    stepContent: {
      flex: 1,

      paddingLeft: 10,

      paddingTop: 2,
    },

    stepTitle: {
      color: theme.colors.text,

      fontSize: 15,

      fontWeight: '500',
    },

    stepSubtitle: {
      color:
        theme.colors.textSecondary,

      fontSize: 12,

      marginTop: 5,
    },

    result: {
      borderTopWidth: 1,

      borderTopColor:
        theme.colors.divider,

      paddingTop: 22,

      marginTop: 10,

      flexDirection: 'row',

      justifyContent:
        'space-between',
    },

    resultLabel: {
      color:
        theme.colors.textSecondary,

      fontSize: 11,
    },

    resultValue: {
      color: theme.colors.text,

      fontSize: 17,

      fontWeight: '700',

      marginTop: 5,
    },

    info: {
      marginTop: 30,

      padding: 17,

      borderRadius: 14,

      backgroundColor:
        theme.colors.surfaceVariant,

      flexDirection: 'row',

      alignItems: 'center',

      gap: 12,
    },

    infoText: {
      flex: 1,

      color:
        theme.colors.textSecondary,

      fontSize: 12,

      lineHeight: 18,
    },
  });
}