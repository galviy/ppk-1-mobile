import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '../themed-text';
import { Radius, Spacing, Typography } from '../../constants/theme';
import { useTheme } from '../../hooks/use-theme';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, message, icon }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {icon && (
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: theme.neutralBg,
              borderColor: theme.borderSubtle,
            },
          ]}>
          {icon}
        </View>
      )}
      <ThemedText type="smallBold" style={styles.title}>
        {title}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.message}>
        {message}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  title: {
    ...Typography.heading,
    textAlign: 'center',
  },
  message: {
    ...Typography.bodySmall,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 300,
  },
});
