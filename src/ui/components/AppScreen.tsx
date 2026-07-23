import React from 'react';

import {
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  useTheme,
} from '../../theme/ThemeProvider';

interface Props {
  children: React.ReactNode;

  scroll?: boolean;

  style?: ViewStyle;

  contentStyle?: ViewStyle;
}

export function AppScreen({
  children,
  scroll = false,
  style,
  contentStyle,
}: Props) {
  const { theme } = useTheme();

  if (scroll) {
    return (
      <SafeAreaView
        edges={['top']}
        style={[
          styles.safe,
          {
            backgroundColor:
              theme.colors.background,
          },
          style,
        ]}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            contentStyle,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['top']}
      style={[
        styles.safe,
        {
          backgroundColor:
            theme.colors.background,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.content,
          contentStyle,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  content: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },
});