import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/data/store';
import { Role } from '@/data/types';

export default function IndexScreen() {
  const { user, isLoading } = useAuth();
  const { setRole } = useApp();

  // Mempertahankan sesi login dan mengarahkan otomatis sesuai role (FR-01.8 & FR-01.9)
  useEffect(() => {
    if (!isLoading) {
      if (user) {
        if (user.role === 'praktikan') {
          router.replace('/praktikan');
        } else {
          router.replace('/asisten');
        }
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [user, isLoading]);

  // Mode Uji Coba Dummy (Opsional untuk testing offline Sprint 1)
  const handlePilihPeranDummy = (selectedRole: Role) => {
    setRole(selectedRole);
    router.push({
      pathname: '/pilih-identitas',
      params: { role: selectedRole },
    });
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <ThemedText style={styles.loadingText}>Memuat sesi autentikasi...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.badgeTop}>
            <ThemedText type="smallBold" style={styles.badgeTopText}>
              Aplikasi Praktikum PPK • Sprint 2
            </ThemedText>
          </View>
          <ThemedText type="subtitle" style={styles.title}>
            Selamat Datang
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            Sistem Autentikasi dan Manajemen Pengguna Praktikum
          </ThemedText>
        </View>

        <View style={styles.cardContainer}>
          <Card style={styles.mainCard}>
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <ThemedText style={styles.iconEmoji}>🔐</ThemedText>
              </View>
              <View style={styles.cardTextWrapper}>
                <ThemedText type="smallBold" style={styles.roleTitle}>
                  Autentikasi Firebase (SRS-01)
                </ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.roleDesc}>
                  Masuk dengan akun terdaftar atau buat akun baru dengan peran Praktikan / Asisten.
                </ThemedText>
              </View>
            </View>
            <PrimaryButton
              label="Buka Halaman Login →"
              onPress={() => router.replace('/(auth)/login')}
              style={styles.cardButton}
            />
          </Card>

          {/* Opsi Mode Demo Cepat */}
          <View style={styles.devBox}>
            <ThemedText type="smallBold" style={styles.devTitle}>
              🛠️ Mode Pengujian Cepat
            </ThemedText>
            <View style={styles.devRow}>
              <Pressable
                onPress={() => handlePilihPeranDummy('praktikan')}
                style={styles.devChip}>
                <Text style={styles.devChipText}>Demo Praktikan</Text>
              </Pressable>
              <Pressable
                onPress={() => handlePilihPeranDummy('asisten')}
                style={styles.devChip}>
                <Text style={styles.devChipText}>Demo Asisten</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.footerText}>
            SRS-01 • Autentikasi dan Manajemen Pengguna
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
    fontSize: 14,
    color: '#64748B',
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
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  badgeTopText: {
    color: '#2563EB',
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DBEAFE',
  },
  iconEmoji: {
    fontSize: 26,
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
  devBox: {
    padding: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  devTitle: {
    fontSize: 13,
    color: '#475569',
  },
  devRow: {
    flexDirection: 'row',
    gap: 10,
  },
  devChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  devChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: Spacing.three,
  },
  footerText: {
    fontSize: 12,
  },
});
