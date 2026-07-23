import React, {
  createContext,
  useContext,
  useMemo,
  useState,
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

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const systemScheme = useColorScheme();

  const [appearance, setAppearance] =
    useState<AppearanceMode>('system');

const [accent, setAccent] =
  useState<AccentName>(
    'monochrome',
  );

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
      setAppearance,
      setAccent,
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