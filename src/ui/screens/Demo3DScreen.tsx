import React from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Icon from
  'react-native-vector-icons/Ionicons';

import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  useTheme,
} from '../../theme/ThemeProvider';

export function Demo3DScreen({
  navigation,
}: any) {
  const { theme } = useTheme();

  const insets =
    useSafeAreaInsets();

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor:
            theme.colors.background,

          paddingTop:
            insets.top,
        },
      ]}
    >
      <View
        style={[
          styles.header,
          {
            borderBottomColor:
              theme.colors.border,
          },
        ]}
      >
        <Pressable
          style={styles.iconButton}
          onPress={() =>
            navigation.goBack()
          }
        >
          <Icon
            name="chevron-back"
            size={26}
            color={
              theme.colors.text
            }
          />
        </Pressable>

        <View
          style={styles.headerText}
        >
          <Text
            style={[
              styles.title,
              {
                color:
                  theme.colors.text,
              },
            ]}
          >
            3D DISSECTION
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color:
                  theme.colors
                    .textSecondary,
              },
            ]}
          >
            Interactive demo
          </Text>
        </View>

        <View
          style={styles.iconButton}
        />
      </View>

      <View
        style={styles.content}
      >
        <View
          style={[
            styles.viewer,
            {
              backgroundColor:
                theme.colors.surface,
              borderColor:
                theme.colors.border,
            },
          ]}
        >
          <Icon
            name="cube-outline"
            size={72}
            color={
              theme.colors
                .textSecondary
            }
          />

          <Text
            style={[
              styles.viewerTitle,
              {
                color:
                  theme.colors.text,
              },
            ]}
          >
            3D Viewer Ready
          </Text>

          <Text
            style={[
              styles.viewerText,
              {
                color:
                  theme.colors
                    .textSecondary,
              },
            ]}
          >
            The interactive renderer
            will be mounted here.
          </Text>
        </View>

        <View
          style={styles.controls}
        >
          <View
            style={[
              styles.control,
              {
                borderColor:
                  theme.colors.border,
              },
            ]}
          >
            <Icon
              name="scan-outline"
              size={20}
              color={
                theme.colors.text
              }
            />

            <Text
              style={[
                styles.controlText,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              EXPLODE
            </Text>
          </View>

          <View
            style={[
              styles.control,
              {
                borderColor:
                  theme.colors.border,
              },
            ]}
          >
            <Icon
              name="refresh-outline"
              size={20}
              color={
                theme.colors.text
              }
            />

            <Text
              style={[
                styles.controlText,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              RESET
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.inspector,
            {
              backgroundColor:
                theme.colors.surface,
              borderColor:
                theme.colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.inspectorLabel,
              {
                color:
                  theme.colors
                    .textSecondary,
              },
            ]}
          >
            SELECTED COMPONENT
          </Text>

          <Text
            style={[
              styles.componentName,
              {
                color:
                  theme.colors.text,
              },
            ]}
          >
            No component selected
          </Text>

          <Text
            style={[
              styles.componentDescription,
              {
                color:
                  theme.colors
                    .textSecondary,
              },
            ]}
          >
            Tap a component in the
            3D model to inspect its
            function and material.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
    },

    header: {
      minHeight: 64,

      paddingHorizontal: 16,

      flexDirection: 'row',

      alignItems: 'center',

      borderBottomWidth:
        StyleSheet.hairlineWidth,
    },

    iconButton: {
      width: 44,

      height: 44,

      alignItems: 'center',

      justifyContent: 'center',
    },

    headerText: {
      flex: 1,

      alignItems: 'center',
    },

    title: {
      fontSize: 15,

      fontWeight: '800',

      letterSpacing: 1,
    },

    subtitle: {
      marginTop: 2,

      fontSize: 11,
    },

    content: {
      flex: 1,

      padding: 16,

      gap: 14,
    },

    viewer: {
      flex: 1,

      minHeight: 330,

      borderWidth: 1,

      borderRadius: 20,

      alignItems: 'center',

      justifyContent: 'center',

      padding: 30,
    },

    viewerTitle: {
      marginTop: 18,

      fontSize: 19,

      fontWeight: '700',
    },

    viewerText: {
      marginTop: 7,

      maxWidth: 250,

      fontSize: 13,

      lineHeight: 19,

      textAlign: 'center',
    },

    controls: {
      flexDirection: 'row',

      gap: 10,
    },

    control: {
      flex: 1,

      height: 52,

      borderWidth: 1,

      borderRadius: 14,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'center',

      gap: 8,
    },

    controlText: {
      fontSize: 12,

      fontWeight: '800',

      letterSpacing: 0.5,
    },

    inspector: {
      borderWidth: 1,

      borderRadius: 18,

      padding: 18,
    },

    inspectorLabel: {
      fontSize: 10,

      fontWeight: '700',

      letterSpacing: 1,
    },

    componentName: {
      marginTop: 8,

      fontSize: 18,

      fontWeight: '700',
    },

    componentDescription: {
      marginTop: 6,

      fontSize: 13,

      lineHeight: 19,
    },
  });