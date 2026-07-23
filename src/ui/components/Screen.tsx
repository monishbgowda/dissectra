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

import { useTheme } from '../../theme/ThemeProvider';

interface ScreenProps {
  children: React.ReactNode;

  scroll?: boolean;

  contentStyle?: ViewStyle;

  edges?: Array<
    'top' | 'right' | 'bottom' | 'left'
  >;
}

export function Screen({
  children,
  scroll = false,
  contentStyle,
  edges = ['top', 'left', 'right'],
}: ScreenProps) {
  const { theme } = useTheme();

  if (scroll) {
    return (
      <SafeAreaView
        edges={edges}
        style={[
          styles.safeArea,
          {
            backgroundColor:
              theme.colors.background,
          },
        ]}
      >
        <ScrollView
          style={styles.fill}
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
      edges={edges}
      style={[
        styles.safeArea,
        {
          backgroundColor:
            theme.colors.background,
        },
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
  safeArea: {
    flex: 1,
  },

  fill: {
    flex: 1,
  },

  content: {
    flex: 1,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },

  scrollContent: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingBottom: 32,
  },
});