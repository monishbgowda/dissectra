import React, {
  useMemo,
  useEffect,
} from "react";

import {
  useWindowDimensions,
} from "react-native";

import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  NavigationContainer,
  DefaultTheme,
} from "@react-navigation/native";

import {
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import Icon from "react-native-vector-icons/Ionicons";

import {
  ThemeProvider,
  useTheme,
} from "./src/theme/ThemeProvider";

import {
  theme,
} from "./src/theme/theme";

import {
  HomeScreen,
} from "./src/ui/screens/HomeScreen";

import {
  CaptureScreen,
} from "./src/ui/screens/CaptureScreen";

import {
  HistoryScreen,
} from "./src/ui/screens/HistoryScreen";

import {
  SettingsScreen,
} from "./src/ui/screens/SettingsScreen";

import {
  Demo3DScreen,
} from "./src/ui/screens/Demo3DScreen";

import InspectionDetailsScreen from "./src/ui/screens/InspectionDetailsScreen";

import type {
  RootTabParamList,
  RootStackParamList,
} from "./src/types/navigation";

const Tab =
  createBottomTabNavigator<RootTabParamList>();

const Stack =
  createNativeStackNavigator<RootStackParamList>();

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

function renderIcon(
  name: string,
) {

  return ({
    color,
    size,
  }: {
    color: string;
    size: number;
  }) => (

    <Icon
      name={name}
      color={color}
      size={size}
    />

  );

}

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

  const {

    responsiveIconSize,

    tabBarHeight,

  } = useMemo(() => {

    const base =
      Math.min(
        width,
        height,
      );

    return {

      responsiveIconSize:

        Math.max(
          20,
          Math.round(
            base * 0.06,
          ),
        ),

      tabBarHeight:
        56 +
        (insets.bottom || 8),

    };

  }, [

    width,

    height,

    insets.bottom,

  ]);

  const screenOptions =
    useMemo(() => ({

      headerShown: false,

      tabBarStyle: {

        backgroundColor:
          activeTheme.colors.surface,

        borderTopColor:
          activeTheme.colors.border,

        borderTopWidth: 1,

        height:
          tabBarHeight,

        paddingBottom:
          insets.bottom || 8,

        paddingTop: 8,

      },

      tabBarActiveTintColor:
        activeTheme.colors.primary,

      tabBarInactiveTintColor:
        activeTheme.colors.textSecondary,

      tabBarLabelStyle: {

        fontSize: 12,

        fontWeight: "600",

      },

    }), [

      activeTheme,

      tabBarHeight,

      insets.bottom,

    ]);

  return (

    <Tab.Navigator
    screenOptions={{
        headerShown: false,

        tabBarStyle: {
            backgroundColor:
                activeTheme.colors.surface,

            borderTopColor:
                activeTheme.colors.border,

            borderTopWidth: 1,

            height:
                tabBarHeight,

            paddingBottom:
                insets.bottom || 8,

            paddingTop: 8,
        },

        tabBarActiveTintColor:
            activeTheme.colors.primary,

        tabBarInactiveTintColor:
            activeTheme.colors.textSecondary,

        tabBarLabelStyle: {

            fontSize: 12,

            fontWeight: "600",

        },

    }}
>

      <Tab.Screen

        name="Home"

        component={HomeScreen}

        options={{

          tabBarLabel:
            "Viewer",

          tabBarIcon:
            ({ color }) => (

              <Icon

                name="home-outline"

                color={color}

                size={responsiveIconSize}

              />

            ),

        }}

      />

      <Tab.Screen

        name="Scan"

        component={CaptureScreen}

        options={{

          tabBarLabel:
            "Scan",

          tabBarIcon:
            ({ color }) => (

              <Icon

                name="camera-outline"

                color={color}

                size={responsiveIconSize}

              />

            ),

        }}

      />

      <Tab.Screen

        name="History"

        component={HistoryScreen}

        options={{

          tabBarLabel:
            "History",

          tabBarIcon:
            ({ color }) => (

              <Icon

                name="time-outline"

                color={color}

                size={responsiveIconSize}

              />

            ),

        }}

      />

      <Tab.Screen

        name="Settings"

        component={SettingsScreen}

        options={{

          tabBarLabel:
            "Settings",

          tabBarIcon:
            ({ color }) => (

              <Icon

                name="settings-outline"

                color={color}

                size={responsiveIconSize}

              />

            ),

        }}

      />

    </Tab.Navigator>

  );

}

function AppInner() {

  const {

    theme: activeTheme,

  } = useTheme();

  const navigationTheme =
    useMemo(

      () =>

        makeNavTheme(
          activeTheme,
        ),

      [

        activeTheme,

      ],

    );

  return (

    <NavigationContainer
      theme={navigationTheme}
    >

      <Stack.Navigator

        screenOptions={{

          headerShown: false,

          contentStyle: {

            backgroundColor:
              activeTheme.colors.background,

          },

        }}

      >

        <Stack.Screen

          name="MainTabs"

          component={MainTabs}

        />

        <Stack.Screen

          name="Demo3D"

          component={Demo3DScreen}

          options={{

            animation:
              "slide_from_right",

          }}

        />

        <Stack.Screen

          name="InspectionDetails"

          component={
            InspectionDetailsScreen
          }

          options={{

            animation:
              "slide_from_right",

          }}

        />

      </Stack.Navigator>

    </NavigationContainer>

  );

}

export default function App() {

  useEffect(() => {

    Icon.loadFont?.();

  }, []);

  return (

    <SafeAreaProvider>

      <ThemeProvider>

        <AppInner />

      </ThemeProvider>

    </SafeAreaProvider>

  );

}