export type ThemeMode = 'light' | 'dark';

export type AppearanceMode =
  | 'system'
  | 'light'
  | 'dark';

export type AccentName =
  | 'monochrome'
  | 'blue'
  | 'violet'
  | 'green'
  | 'orange';

// Compatibility alias
export type AccentColor = AccentName;

export const accents: Record<
  AccentName,
  string
> = {
  monochrome: '#FFFFFF',
  blue: '#3488F5',
  violet: '#A855F7',
  green: '#22C55E',
  orange: '#FF6846',
};

export function createTheme(
  mode: ThemeMode,
  accent: AccentName = 'monochrome',
) {
  const dark = mode === 'dark';

  const accentColor =
    accent === 'monochrome'
      ? dark
        ? '#FFFFFF'
        : '#111111'
      : accents[accent];

  return {
    mode,
    dark,

    colors: {
      background:
        dark
          ? '#000000'
          : '#F7F7F7',

      surface:
        dark
          ? '#111111'
          : '#FFFFFF',

      surfaceVariant:
        dark
          ? '#181818'
          : '#F2F2F2',

      elevated:
        dark
          ? '#1A1A1A'
          : '#FFFFFF',
       card:
    dark
      ? '#111111'
      : '#FFFFFF',


      primary: accentColor,

      onPrimary:
        accent === 'monochrome'
          ? dark
            ? '#000000'
            : '#FFFFFF'
          : '#FFFFFF',

      text:
        dark
          ? '#FFFFFF'
          : '#111111',

      textSecondary:
        dark
          ? '#A3A3A3'
          : '#666666',

      textDisabled:
        dark
          ? '#666666'
          : '#AAAAAA',

      border:
        dark
          ? '#292929'
          : '#E5E5E5',

      divider:
        dark
          ? '#202020'
          : '#EBEBEB',

      success: '#22C55E',
      warning: '#F59E0B',
      error: '#EF4444',

      overlay:
        'rgba(0,0,0,0.55)',

      tabBar:
        dark
          ? '#080808'
          : '#FFFFFF',

      tabInactive:
        dark
          ? '#858585'
          : '#777777',

      inverseSurface:
        dark
          ? '#FFFFFF'
          : '#111111',

      inverseBackground:
        dark
          ? '#FFFFFF'
          : '#111111',

      inverseText:
        dark
          ? '#111111'
          : '#FFFFFF',
    },

    spacing: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
      xxl: 32,
    },

    radius: {
      sm: 10,
      md: 16,
      lg: 22,
      xl: 28,
      pill: 999,
    },

typography: {
  display: {
    fontSize: 28,
    fontWeight: '800' as const,
  },

  h1: {
    fontSize: 24,
    fontWeight: '700' as const,
  },

  h2: {
    fontSize: 18,
    fontWeight: '700' as const,
  },

  // Legacy compatibility
  h4: {
    fontSize: 18,
    fontWeight: '700' as const,
  },

  h6: {
    fontSize: 16,
    fontWeight: '600' as const,
  },

  subtitle1: {
    fontSize: 15,
    fontWeight: '400' as const,
  },

  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
  },

  body1: {
    fontSize: 15,
    fontWeight: '400' as const,
  },

  body2: {
    fontSize: 13,
    fontWeight: '400' as const,
  },

  label: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
},

    shadows: {
      sm: {
        shadowColor: '#000000',

        shadowOffset: {
          width: 0,
          height: 2,
        },

        shadowOpacity:
          dark ? 0.35 : 0.08,

        shadowRadius: 5,

        elevation: 2,
      },

      md: {
        shadowColor: '#000000',

        shadowOffset: {
          width: 0,
          height: 6,
        },

        shadowOpacity:
          dark ? 0.4 : 0.12,

        shadowRadius: 12,

        elevation: 5,
      },
    },
  };
}

export type AppTheme =
  ReturnType<typeof createTheme>;

/*
 * Legacy compatibility theme.
 *
 * Older components that still do:
 *
 * import { theme } from '../../theme/theme'
 *
 * can continue compiling.
 *
 * New screens should use useTheme().
 */
export const theme =
  createTheme(
    'dark',
    'monochrome',
  );