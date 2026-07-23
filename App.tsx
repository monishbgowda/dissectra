import React from 'react';

import {
  useWindowDimensions,
} from 'react-native';

import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  NavigationContainer,
  DefaultTheme,
} from '@react-navigation/native';

import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import Icon from
  'react-native-vector-icons/Ionicons';

import {
  HomeScreen,
} from './src/ui/screens/HomeScreen';

import {
  CaptureScreen,
} from './src/ui/screens/CaptureScreen';

import {
  HistoryScreen,
} from './src/ui/screens/HistoryScreen';

import {
  SettingsScreen,
} from './src/ui/screens/SettingsScreen';

import {
  Demo3DScreen,
} from './src/ui/screens/Demo3DScreen';

import {
  theme,
} from './src/theme/theme';

import {
  ThemeProvider,
  useTheme,
} from './src/theme/ThemeProvider';

import type {
  RootTabParamList,
  RootStackParamList,
} from './src/types/navigation';


if (
  Icon &&
  typeof Icon.loadFont ===
    'function'
) {
  Icon.loadFont();
}


const Tab =
  createBottomTabNavigator<
    RootTabParamList
  >();

const Stack =
  createNativeStackNavigator<
    RootStackParamList
  >();


function makeNavTheme(
  t: typeof theme,
) {
  return {
    ...DefaultTheme,

    colors: {
      ...DefaultTheme.colors,

      background:
        t.colors.background,

      card:
        t.colors.surface,

      text:
        t.colors.text,

      border:
        t.colors.border,

      primary:
        t.colors.primary,
    },
  };
}


/* ---------------------------------------------
   MAIN BOTTOM NAVIGATION
--------------------------------------------- */

function MainTabs() {
  const {
    width,
    height,
  } = useWindowDimensions();

  const insets =
    useSafeAreaInsets();

  const {
    theme: activeTheme,
  } = useTheme();

  const base =
    Math.min(
      width,
      height,
    );

  const responsiveIconSize =
    Math.max(
      20,
      Math.round(
        base * 0.06,
      ),
    );

  const tabBarHeight =
    56 +
    (insets.bottom || 8);


  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          backgroundColor:
            activeTheme
              .colors
              .surface,

          borderTopColor:
            activeTheme
              .colors
              .border,

          borderTopWidth: 1,

          height:
            tabBarHeight,

          paddingBottom:
            insets.bottom ||
            8,

          paddingTop: 8,
        },

        tabBarActiveTintColor:
          activeTheme
            .colors
            .primary,

        tabBarInactiveTintColor:
          activeTheme
            .colors
            .textSecondary,

        tabBarLabelStyle: {
          fontSize: 12,

          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"

        component={
          HomeScreen
        }

        options={{
          tabBarLabel:
            'Viewer',

          tabBarIcon: ({
            color,
          }) => (
            <Icon
              name="home-outline"

              size={
                responsiveIconSize
              }

              color={color}
            />
          ),
        }}
      />


      <Tab.Screen
        name="Scan"

        component={
          CaptureScreen
        }

        options={{
          tabBarLabel:
            'Scan',

          tabBarIcon: ({
            color,
          }) => (
            <Icon
              name="camera-outline"

              size={
                responsiveIconSize
              }

              color={color}
            />
          ),
        }}
      />


      <Tab.Screen
        name="History"

        component={
          HistoryScreen
        }

        options={{
          tabBarLabel:
            'History',

          tabBarIcon: ({
            color,
          }) => (
            <Icon
              name="time-outline"

              size={
                responsiveIconSize
              }

              color={color}
            />
          ),
        }}
      />


      <Tab.Screen
        name="Settings"

        component={
          SettingsScreen
        }

        options={{
          tabBarLabel:
            'Settings',

          tabBarIcon: ({
            color,
          }) => (
            <Icon
              name="settings-outline"

              size={
                responsiveIconSize
              }

              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}


/* ---------------------------------------------
   APP
--------------------------------------------- */

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
  const {
    theme: activeTheme,
  } = useTheme();

  return (
    <NavigationContainer
      theme={
        makeNavTheme(
          activeTheme,
        )
      }
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,

          contentStyle: {
            backgroundColor:
              activeTheme
                .colors
                .background,
          },
        }}
      >
        <Stack.Screen
          name="MainTabs"

          component={
            MainTabs
          }
        />

        <Stack.Screen
          name="Demo3D"

          component={
            Demo3DScreen
          }

          options={{
            animation:
              'slide_from_right',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}