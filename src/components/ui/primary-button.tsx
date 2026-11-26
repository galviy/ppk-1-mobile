import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

import { Radius } from '../../constants/theme';
import { useTheme } from '../../hooks/use-theme';

export interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  style?: StyleProp<ViewStyle>;
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
  style,
}: PrimaryButtonProps) {
  const theme = useTheme();

  let buttonColorStyle: ViewStyle = {
    backgroundColor: theme.primary,
  };
  let textColor: string = theme.onPrimary;

  if (variant === 'secondary') {
    buttonColorStyle = {
      backgroundColor: theme.secondaryBg,
      borderWidth: 1,
      borderColor: theme.secondaryBorder,
    };
    textColor = theme.secondaryText;
  } else if (variant === 'danger') {
    buttonColorStyle = {
      backgroundColor: theme.danger,
    };
    textColor = theme.onPrimary;
  } else if (variant === 'outline') {
    buttonColorStyle = {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: theme.primary,
    };
    textColor = theme.primaryText;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        buttonColorStyle,
        disabled && {
          backgroundColor: theme.neutralBg,
          borderColor: theme.neutralBorder,
          opacity: 0.7,
        },
        pressed && !disabled && styles.pressed,
        style,
      ]}>
      <Text
        style={[
          styles.baseText,
          { color: disabled ? theme.neutralText : textColor },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: Radius.lg - 4,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  baseText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
