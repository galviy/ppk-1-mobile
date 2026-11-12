import React, { useState } from 'react';
import {
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme';

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
          {label} {required && <Text style={styles.requiredAsterisk}>*</Text>}
        </Text>
      </View>

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: disabled ? '#F3F4F6' : theme.backgroundElement,
            borderColor: error
              ? '#EF4444'
              : isFocused
              ? '#2563EB'
              : '#E2E8F0',
          },
        ]}>
        <TextInput
          style={[
            styles.input,
            {
              color: theme.text,
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
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
            style={styles.eyeButton}
            hitSlop={8}>
            <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
          </Pressable>
        )}
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  requiredAsterisk: {
    color: '#EF4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 10,
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
  eyeIcon: {
    fontSize: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
  helperText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
});

