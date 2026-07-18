import React from 'react';
import { StatusBar, useWindowDimensions } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { HomeScreen } from './src/ui/screens/HomeScreen';
import { CaptureScreen } from './src/ui/screens/CaptureScreen';
import { HistoryScreen } from './src/ui/screens/HistoryScreen';
import { SettingsScreen } from './src/ui/screens/SettingsScreen';
import { theme } from './src/theme/theme';
import type { RootTabParamList } from './src/types/navigation';

const Tab = createBottomTabNavigator<RootTabParamList>();
const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: theme.colors.background,
    card: theme.colors.surface,
    text: theme.colors.text,
    border: theme.colors.border,
    primary: theme.colors.primary,
  },
};

export default function App() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const base = Math.min(width, height);
  const responsiveIconSize = Math.max(20, Math.round(base * 0.06));
  const tabBarHeight = 56 + (insets.bottom || 8);
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <NavigationContainer theme={navTheme}>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: theme.colors.surface,
              borderTopColor: theme.colors.border,
              borderTopWidth: 1,
              height: tabBarHeight,
              paddingBottom: insets.bottom || 8,
              paddingTop: 8,
            },
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: theme.colors.textSecondary,
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
    </SafeAreaProvider>
  );
}
