import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Radius, Spacing, Typography } from '../../constants/theme';
import { useTheme } from '../../hooks/use-theme';

export interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string | null;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
}

export function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  helperText,
  disabled = false,
  required = false,
}: InputFieldProps) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: theme.text }]}>
          {label}{' '}
          {required && (
            <Text style={{ color: theme.danger }}>*</Text>
          )}
        </Text>
      </View>

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: disabled ? theme.neutralBg : theme.backgroundElement,
            borderColor: error
              ? theme.danger
              : isFocused
              ? theme.primary
              : theme.border,
          },
        ]}>
        <TextInput
          style={[
            styles.input,
            {
              color: disabled ? theme.neutralText : theme.text,
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {secureTextEntry && (
          <Pressable
            onPress={() => setShowPassword((prev) => !prev)}
            accessibilityRole="button"
            accessibilityLabel={
              showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'
            }
            style={styles.eyeButton}
            hitSlop={8}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={theme.textSecondary}
            />
          </Pressable>
        )}
      </View>

      {error ? (
        <Text style={[styles.errorText, { color: theme.dangerText }]}>{error}</Text>
      ) : helperText ? (
        <Text style={[styles.helperText, { color: theme.textSecondary }]}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.three,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    ...Typography.label,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
  },
  eyeButton: {
    paddingLeft: 8,
    paddingVertical: 4,
  },
  errorText: {
    ...Typography.caption,
    marginTop: 4,
    marginLeft: 2,
  },
  helperText: {
    ...Typography.caption,
    marginTop: 4,
    marginLeft: 2,
  },
});

