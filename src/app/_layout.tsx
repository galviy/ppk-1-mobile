import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AppProvider } from '@/data/store';

SplashScreen.preventAutoHideAsync();

function NavigationGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Membatasi akses dan mengarahkan pengguna berdasarkan role dan status login (FR-01.8, FR-01.9, FR-01.11)
  useEffect(() => {
    if (isLoading) return;

    const firstSegment = segments[0] as string | undefined;
    const inAuthGroup = firstSegment === '(auth)';
    const inPraktikanGroup = firstSegment === 'praktikan';
    const inAsistenGroup = firstSegment === 'asisten';
    const isRoot = !firstSegment || firstSegment === 'index';

    if (!user) {
      // Jika pengguna belum login dan mencoba mengakses rute yang dilindungi (FR-01.11)
      if (inPraktikanGroup || inAsistenGroup || firstSegment === 'sesi') {
        router.replace('/(auth)/login');
      }
    } else {
      // Pengguna sudah login (FR-01.8, FR-01.9, FR-01.11)
      if (inAuthGroup || isRoot) {
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

  return <>{children}</>;
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
