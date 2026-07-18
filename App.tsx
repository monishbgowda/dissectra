import React from 'react';
import { StatusBar, useWindowDimensions } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
// Ensure icon fonts are loaded on startup for release builds
if (Icon && typeof Icon.loadFont === 'function') {
  Icon.loadFont();
}
import { HomeScreen } from './src/ui/screens/HomeScreen';
import { CaptureScreen } from './src/ui/screens/CaptureScreen';
import { HistoryScreen } from './src/ui/screens/HistoryScreen';
import { SettingsScreen } from './src/ui/screens/SettingsScreen';
import { theme } from './src/theme/theme';
import ThemeProvider, { useTheme } from './src/theme/ThemeProvider';
import type { RootTabParamList } from './src/types/navigation';

const Tab = createBottomTabNavigator<RootTabParamList>();
function makeNavTheme(t: typeof theme) {
  return {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: t.colors.background,
      card: t.colors.surface,
      text: t.colors.text,
      border: t.colors.border,
      primary: t.colors.primary,
    },
  };
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppInner />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function AppInner() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { theme: activeTheme } = useTheme() || { theme };
  const base = Math.min(width, height);
  const responsiveIconSize = Math.max(20, Math.round(base * 0.06));
  const tabBarHeight = 56 + (insets.bottom || 8);

  return (
    <NavigationContainer theme={makeNavTheme(activeTheme)}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: activeTheme.colors.surface,
            borderTopColor: activeTheme.colors.border,
            borderTopWidth: 1,
            height: tabBarHeight,
            paddingBottom: insets.bottom || 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: activeTheme.colors.primary,
          tabBarInactiveTintColor: activeTheme.colors.textSecondary,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Viewer',
            tabBarIcon: ({ color }) => <Icon name="home-outline" size={responsiveIconSize} color={color} />,
          }}
        />
        <Tab.Screen
          name="Scan"
          component={CaptureScreen}
          options={{
            tabBarLabel: 'Scan',
            tabBarIcon: ({ color }) => <Icon name="camera-outline" size={responsiveIconSize} color={color} />,
          }}
        />
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{
            tabBarLabel: 'History',
            tabBarIcon: ({ color }) => <Icon name="time-outline" size={responsiveIconSize} color={color} />,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarLabel: 'Settings',
            tabBarIcon: ({ color }) => <Icon name="settings-outline" size={responsiveIconSize} color={color} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
