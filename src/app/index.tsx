import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import { Href, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { Card } from '../components/ui/card';
import { PrimaryButton } from '../components/ui/primary-button';
import { Radius, Spacing, Typography } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/use-theme';
import { getHomeRouteForRole } from '../lib/role-routing';

export default function IndexScreen() {
  const { user, isLoading } = useAuth();
  const theme = useTheme();

  // Mempertahankan sesi login dan mengarahkan otomatis sesuai 3 peran (FR-01.8, FR-01.9, FR-S4-01.4)
  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace(getHomeRouteForRole(user.role) as Href);
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <ThemedText themeColor="textSecondary" style={styles.loadingText}>
          Memuat sesi autentikasi...
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View
            style={[
              styles.badgeTop,
              {
                backgroundColor: theme.primaryBg,
                borderColor: theme.primaryBorder,
              },
            ]}>
            <ThemedText
              type="smallBold"
              style={[styles.badgeTopText, { color: theme.primaryText }]}>
              Aplikasi Praktikum PPK
            </ThemedText>
          </View>
          <ThemedText type="subtitle" style={styles.title}>
            Selamat Datang
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            Sistem Presensi, Manajemen Laboratorium, dan Pembayaran Praktikum
          </ThemedText>
        </View>

        <View style={styles.cardContainer}>
          <Card style={styles.mainCard}>
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: theme.primaryBg,
                    borderColor: theme.primaryBorder,
                  },
                ]}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={26}
                  color={theme.primaryText}
                />
              </View>
              <View style={styles.cardTextWrapper}>
                <ThemedText type="smallBold" style={styles.roleTitle}>
                  Autentikasi Akun PPK
                </ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.roleDesc}>
                  Masuk dengan akun Aslab, Asprak, atau Praktikan terdaftar.
                </ThemedText>
              </View>
            </View>
            <PrimaryButton
              label="Buka Halaman Login"
              onPress={() => router.replace('/(auth)/login')}
              style={styles.cardButton}
            />
          </Card>
        </View>

        <View style={styles.footer}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.footerText}>
            Aplikasi Praktikum PPK • RBAC 3 Peran
          </ThemedText>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    ...Typography.bodySmall,
    fontSize: 14,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.four,
    gap: Spacing.one,
  },
  badgeTop: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginBottom: 8,
    borderWidth: 1,
  },
  badgeTopText: {
    fontSize: 12,
  },
  title: {
    textAlign: 'center',
    fontSize: 26,
    lineHeight: 34,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    maxWidth: 320,
  },
  cardContainer: {
    gap: Spacing.three,
    marginVertical: Spacing.four,
  },
  mainCard: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 16,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextWrapper: {
    flex: 1,
    gap: 4,
  },
  roleTitle: {
    fontSize: 18,
  },
  roleDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  cardButton: {
    marginTop: 4,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: Spacing.three,
  },
  footerText: {
    fontSize: 12,
  },
});
