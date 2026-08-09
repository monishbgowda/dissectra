import React from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Icon from
  'react-native-vector-icons/Ionicons';

import {
  useTheme,
} from '../../theme/ThemeProvider';

interface Props {
  title: string;

  onPress: () => void;

  icon?: string;

  disabled?: boolean;

  variant?: 'filled' | 'outline';
}

export function PrimaryButton({
  title,
  onPress,
  icon,
  disabled = false,
  variant = 'filled',
}: Props) {
  const { theme } = useTheme();

  const filled =
    variant === 'filled';

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,

        {
          backgroundColor: filled
            ? theme.colors.inverseSurface
            : 'transparent',

          borderColor:
            theme.colors.border,

          opacity:
            disabled
              ? 0.45
              : pressed
                ? 0.75
                : 1,
        },

        !filled &&
          styles.outline,
      ]}
    >
      <Text
        style={[
          styles.text,

          {
            color: filled
              ? theme.colors.inverseText
              : theme.colors.text,
          },
        ]}
      >
        {title}
      </Text>

      {icon && (
        <View>
          <Icon
            name={icon}
            size={22}
            color={
              filled
                ? theme.colors.inverseText
                : theme.colors.text
            }
          />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 58,

    borderRadius: 16,

    paddingHorizontal: 22,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent:
      'space-between',
  },

  outline: {
    borderWidth: 1,
  },

  text: {
    fontSize: 14,

    fontWeight: '800',

    letterSpacing: 0.3,
  },
});