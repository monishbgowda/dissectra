import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useColorScheme,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  AccentName,
  AppearanceMode,
  createTheme,
} from './theme';

const APPEARANCE_KEY = 'dissectra:appearance';
const ACCENT_KEY = 'dissectra:accent';

interface ThemeContextValue {
  appearance: AppearanceMode;
  accent: AccentName;
  theme: ReturnType<typeof createTheme>;

  setAppearance: (value: AppearanceMode) => Promise<void>;
  setAccent: (value: AccentName) => Promise<void>;
}

const ThemeContext =
  createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const systemScheme = useColorScheme();

  const [appearance, setAppearanceState] =
    useState<AppearanceMode>('dark');

  const [accent, setAccentState] =
    useState<AccentName>('monochrome');

  useEffect(() => {
    async function loadPreferences() {
      const [storedAppearance, storedAccent] =
        await Promise.all([
          AsyncStorage.getItem(APPEARANCE_KEY),
          AsyncStorage.getItem(ACCENT_KEY),
        ]);

      if (
        storedAppearance === 'dark' ||
        storedAppearance === 'light' ||
        storedAppearance === 'system'
      ) {
        setAppearanceState(storedAppearance);
      }

      if (
        storedAccent === 'monochrome' ||
        storedAccent === 'blue' ||
        storedAccent === 'violet' ||
        storedAccent === 'green' ||
        storedAccent === 'orange'
      ) {
        setAccentState(storedAccent);
      }
    }

    loadPreferences();
  }, []);

  async function setAppearance(value: AppearanceMode) {
    setAppearanceState(value);
    await AsyncStorage.setItem(APPEARANCE_KEY, value);
  }

  async function setAccent(value: AccentName) {
    setAccentState(value);
    await AsyncStorage.setItem(ACCENT_KEY, value);
  }

  const resolvedMode: 'dark' | 'light' =
    appearance === 'system'
      ? systemScheme === 'light'
        ? 'light'
        : 'dark'
      : appearance;

  const theme = useMemo(
    () => createTheme(resolvedMode, accent),
    [resolvedMode, accent],
  );

  return (
    <ThemeContext.Provider
      value={{
        appearance,
        accent,
        theme,
        setAppearance,
        setAccent,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      'useTheme must be used inside ThemeProvider',
    );
  }

  return context;
}

export default ThemeProvider;