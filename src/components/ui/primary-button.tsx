import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

interface PrimaryButtonProps {
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
  let buttonStyle = styles.primary;
  let textStyle = styles.textPrimary;

  if (variant === 'secondary') {
    buttonStyle = styles.secondary;
    textStyle = styles.textSecondary;
  } else if (variant === 'danger') {
    buttonStyle = styles.danger;
    textStyle = styles.textDanger;
  } else if (variant === 'outline') {
    buttonStyle = styles.outline;
    textStyle = styles.textOutline;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        buttonStyle,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}>
      <Text style={[styles.baseText, textStyle, disabled && styles.textDisabled]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  baseText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  primary: {
    backgroundColor: '#2563EB',
  },
  textPrimary: {
    color: '#FFFFFF',
  },
  secondary: {
    backgroundColor: '#F1F5F9',
  },
  textSecondary: {
    color: '#0F172A',
  },
  danger: {
    backgroundColor: '#EF4444',
  },
  textDanger: {
    color: '#FFFFFF',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#2563EB',
  },
  textOutline: {
    color: '#2563EB',
  },
  disabled: {
    backgroundColor: '#E2E8F0',
    borderColor: 'transparent',
    opacity: 0.6,
  },
  textDisabled: {
    color: '#94A3B8',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
