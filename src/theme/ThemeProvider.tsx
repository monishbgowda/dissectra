import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme as darkTheme } from './theme';

type Appearance = 'dark' | 'light' | 'system';

const lightTheme = {
  ...darkTheme,
  colors: {
    ...darkTheme.colors,
    background: '#FFFFFF',
    surface: '#F7F9FC',
    surfaceVariant: '#F0F4F8',
    primary: '#0066CC',
    onPrimary: '#FFFFFF',
    text: '#0B1220',
    textSecondary: '#5B6B7A',
    border: 'rgba(0,0,0,0.06)',
    card: 'rgba(0,0,0,0.02)',
  },
};

const ThemeContext = createContext<any>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [appearance, setAppearance] = useState<Appearance>('dark');
  useEffect(() => {
    AsyncStorage.getItem('dissectra:appearance').then(v => {
      if (v === 'light' || v === 'dark' || v === 'system') setAppearance(v as Appearance);
    });
  }, []);

  const setAndPersist = async (a: Appearance) => {
    setAppearance(a);
    await AsyncStorage.setItem('dissectra:appearance', a);
  };

  const currentTheme = appearance === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ appearance, setAppearance: setAndPersist, theme: currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default ThemeProvider;
