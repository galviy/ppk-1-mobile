import React, { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { PermissionNotice } from '@/components/device';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AppProvider } from '@/data/store';
import { useNotifications } from '@/hooks/use-notifications';

SplashScreen.preventAutoHideAsync();

function NavigationGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const { condition, retryRegistration } = useNotifications();
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const router = useRouter();

  // Membatasi akses dan mengarahkan pengguna berdasarkan role dan status login (FR-01.8, FR-01.9, FR-01.11, S3-01.6)
  useEffect(() => {
    if (isLoading) return;

    const firstSegment = segments[0] as string | undefined;
    const inAuthGroup = firstSegment === '(auth)';
    const inPraktikanGroup = firstSegment === 'praktikan';
    const inAsistenGroup = firstSegment === 'asisten';
    const inIzinGroup = firstSegment === 'izin';
    const inPresensiGroup = firstSegment === 'presensi';
    const inMapsGroup = firstSegment === 'maps';
    const isPilihIdentitas = firstSegment === 'pilih-identitas';
    const isRoot = !firstSegment || firstSegment === 'index';

    if (!user) {
      // Jika pengguna belum login dan mencoba mengakses rute yang dilindungi (FR-01.11, FR-04.8, S3-01.6)
      if (
        inPraktikanGroup ||
        inAsistenGroup ||
        inIzinGroup ||
        inPresensiGroup ||
        inMapsGroup ||
        firstSegment === 'sesi' ||
        isPilihIdentitas
      ) {
        router.replace('/(auth)/login');
      }
    } else {
      // Pengguna sudah login (FR-01.8, FR-01.9, FR-01.11)
      if (inAuthGroup || isRoot || isPilihIdentitas) {
        if (user.role === 'praktikan') {
          router.replace('/praktikan');
        } else {
          router.replace('/asisten');
        }
      } else if (inPraktikanGroup && user.role !== 'praktikan') {
        // Pembatasan akses: asisten tidak boleh akses halaman praktikan
        router.replace('/asisten');
      } else if (inAsistenGroup && user.role !== 'asisten') {
        // Pembatasan akses: praktikan tidak boleh akses halaman asisten
        router.replace('/praktikan');
      }
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
            <Text style={styles.dismissText}>Tutup</Text>
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
              <Stack.Screen name="asisten" options={{ headerShown: false }} />
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
    color: '#78350F',
  },
});
