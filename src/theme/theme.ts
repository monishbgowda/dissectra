export type AppearanceMode = 'dark' | 'light' | 'system';
export type AccentName =
  | 'monochrome'
  | 'blue'
  | 'violet'
  | 'green'
  | 'orange';

export const accents = {
  monochrome: {
    dark: '#FFFFFF',
    light: '#111111',
  },
  blue: {
    dark: '#4C9AFF',
    light: '#1677FF',
  },
  violet: {
    dark: '#B277FF',
    light: '#8B3DFF',
  },
  green: {
    dark: '#3DDC84',
    light: '#13A653',
  },
  orange: {
    dark: '#FF7448',
    light: '#F4511E',
  },
};

const common = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  typography: {
    h1: {
      fontSize: 30,
      fontWeight: '700' as const,
      lineHeight: 36,
    },
    h2: {
      fontSize: 26,
      fontWeight: '700' as const,
      lineHeight: 32,
    },
    h3: {
      fontSize: 22,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 26,
    },
    h5: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    h6: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 22,
    },
    body1: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 23,
    },
    body2: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    subtitle1: {
      fontSize: 14,
      fontWeight: '600' as const,
      lineHeight: 20,
    },
    subtitle2: {
      fontSize: 12,
      fontWeight: '600' as const,
      lineHeight: 16,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
    overline: {
      fontSize: 11,
      fontWeight: '600' as const,
      lineHeight: 16,
      textTransform: 'uppercase' as const,
    },
  },
};

export function createTheme(
  mode: 'dark' | 'light',
  accentName: AccentName = 'monochrome',
) {
  const isDark = mode === 'dark';
  const accent = accents[accentName][mode];

  return {
    ...common,

    mode,
    accentName,

    colors: isDark
      ? {
          background: '#000000',
          surface: '#0B0B0B',
          surfaceVariant: '#151515',
          elevated: '#1B1B1B',

          primary: accent,
          onPrimary:
            accentName === 'monochrome' ? '#000000' : '#FFFFFF',

          text: '#FFFFFF',
          textSecondary: '#9A9A9A',
          textDisabled: '#5C5C5C',

          border: '#292929',
          divider: '#202020',

          card: '#121212',
          overlay: 'rgba(0,0,0,0.72)',

          success: '#4ADE80',
          error: '#FF5A5F',
          warning: '#F5C451',

          tabBar: '#080808',
          input: '#151515',

          inverseBackground: '#FFFFFF',
          inverseText: '#000000',
        }
      : {
          background: '#FFFFFF',
          surface: '#FFFFFF',
          surfaceVariant: '#F4F4F4',
          elevated: '#FAFAFA',

          primary: accent,
          onPrimary:
            accentName === 'monochrome' ? '#FFFFFF' : '#FFFFFF',

          text: '#111111',
          textSecondary: '#6F6F6F',
          textDisabled: '#A5A5A5',

          border: '#E7E7E7',
          divider: '#ECECEC',

          card: '#F8F8F8',
          overlay: 'rgba(255,255,255,0.78)',

          success: '#16883E',
          error: '#D9363E',
          warning: '#A96C00',

          tabBar: '#FFFFFF',
          input: '#F4F4F4',

          inverseBackground: '#111111',
          inverseText: '#FFFFFF',
        },

    shadows: isDark
      ? {
          sm: {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 2,
          },
          md: {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
            elevation: 5,
          },
        }
      : {
          sm: {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          },
          md: {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.08,
            shadowRadius: 16,
            elevation: 4,
          },
        },
  };
}

export const theme = createTheme('dark', 'monochrome');