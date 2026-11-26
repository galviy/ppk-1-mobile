import React, { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, Href, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedSplashOverlay } from '../components/animated-icon';
import { PermissionNotice } from '../components/device';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { AppProvider } from '../data/store';
import { useNotifications } from '../hooks/use-notifications';
import { useTheme } from '../hooks/use-theme';
import { resolveRoleGuardRedirect } from '../lib/role-routing';

SplashScreen.preventAutoHideAsync();

function NavigationGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const { condition, retryRegistration } = useNotifications();
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const router = useRouter();
  const theme = useTheme();

  // Membatasi akses dan mengarahkan pengguna berdasarkan RBAC 3 peran (FR-01.8, FR-01.9, FR-01.11, S3-01.6, FR-S4-01.4)
  useEffect(() => {
    if (isLoading) return;

    const firstSegment = segments[0] as string | undefined;
    const redirectTarget = resolveRoleGuardRedirect(
      user?.role ?? null,
      firstSegment,
    );

    if (redirectTarget) {
      router.replace(redirectTarget as Href);
    }
  }, [user, isLoading, segments, router]);

  const conditionKey =
    user?.uid && condition ? `${user.uid}:${condition}` : null;
  const showConditionBanner =
    Boolean(conditionKey) && dismissedKey !== conditionKey;

  return (
    <View style={styles.container}>
      {showConditionBanner && condition ? (
        <View
          style={[
            styles.bannerWrapper,
            { paddingTop: Math.max(insets.top, 8) },
          ]}>
          <PermissionNotice
            jenis={condition}
            onRetry={() => {
              void retryRegistration();
            }}
            style={styles.bannerNotice}
          />
          <Pressable
            onPress={() => setDismissedKey(conditionKey)}
            accessibilityRole="button"
            accessibilityLabel="Tutup pemberitahuan"
            style={styles.dismissBtn}>
            <Text style={[styles.dismissText, { color: theme.warningText }]}>
              Tutup
            </Text>
          </Pressable>
        </View>
      ) : null}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <AppProvider>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <AnimatedSplashOverlay />
          <NavigationGuard>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="pilih-identitas" options={{ headerShown: false }} />
              <Stack.Screen name="praktikan" options={{ headerShown: false }} />
              <Stack.Screen name="aslab" options={{ headerShown: false }} />
              <Stack.Screen name="asprak" options={{ headerShown: false }} />
              <Stack.Screen name="sesi" options={{ headerShown: false }} />
            </Stack>
          </NavigationGuard>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  bannerWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 4,
    position: 'relative',
  },
  bannerNotice: {
    marginBottom: 0,
    paddingRight: 48,
  },
  dismissBtn: {
    position: 'absolute',
    right: 26,
    top: 18,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dismissText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
