import { useSafeAreaInsets as useSafeAreaInsetsContext } from 'react-native-safe-area-context';

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export const defaultSafeAreaInsets: SafeAreaInsets = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
};

export function getSafeAreaInsetsValue(getInsets: () => SafeAreaInsets): SafeAreaInsets {
  try {
    return getInsets();
  } catch {
    return defaultSafeAreaInsets;
  }
}

export function useSafeAreaInsetsOrFallback(): SafeAreaInsets {
  return getSafeAreaInsetsValue(() => useSafeAreaInsetsContext());
}
