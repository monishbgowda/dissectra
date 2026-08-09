import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react';

import {
  useColorScheme,
} from 'react-native';

import {
  AccentName,
  AppearanceMode,
  AppTheme,
  createTheme,
} from './theme';

import AsyncStorage from "@react-native-async-storage/async-storage";

interface ThemeContextValue {
  theme: AppTheme;

  appearance: AppearanceMode;

  accent: AccentName;

  setAppearance: (
    mode: AppearanceMode,
  ) => void;

  setAccent: (
    accent: AccentName,
  ) => void;
}

const ThemeContext =
  createContext<ThemeContextValue | null>(
    null,
  );
const APPEARANCE_KEY =
  "theme_appearance";

const ACCENT_KEY =
  "theme_accent";
export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const systemScheme = useColorScheme();

const [appearance, setAppearance] =
  useState<AppearanceMode>("system");

const [accent, setAccent] =
  useState<AccentName>(
    "monochrome",
  );

useEffect(() => {
  async function loadSettings() {
    const savedAppearance =
      await AsyncStorage.getItem(
        APPEARANCE_KEY,
      );

    const savedAccent =
      await AsyncStorage.getItem(
        ACCENT_KEY,
      );

    if (savedAppearance) {
      setAppearance(
        savedAppearance as AppearanceMode,
      );
    }

    if (savedAccent) {
      setAccent(
        savedAccent as AccentName,
      );
    }
  }

  loadSettings();
}, []);

  const resolvedMode: 'dark' | 'light' =
    appearance === 'system'
      ? systemScheme === 'light'
        ? 'light'
        : 'dark'
      : appearance;

  const theme = useMemo(
    () =>
      createTheme(
        resolvedMode,
        accent,
      ),
    [
      resolvedMode,
      accent,
    ],
  );

 const value = useMemo(
  () => ({
    theme,
    appearance,
    accent,

    setAppearance: async (
      mode: AppearanceMode,
    ) => {
      setAppearance(mode);

      await AsyncStorage.setItem(
        APPEARANCE_KEY,
        mode,
      );
    },

    setAccent: async (
      value: AccentName,
    ) => {
      setAccent(value);

      await AsyncStorage.setItem(
        ACCENT_KEY,
        value,
      );
    },
  }),
  [
    theme,
    appearance,
    accent,
  ],
);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      'useTheme must be used inside ThemeProvider',
    );
  }

  return context;
}