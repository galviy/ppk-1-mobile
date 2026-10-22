import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Spacing } from '@/constants/theme';
import { useApp } from '@/data/store';
import { Role } from '@/data/types';

export default function PilihPeranScreen() {
  const { setRole } = useApp();

  const handlePilihPeran = (selectedRole: Role) => {
    setRole(selectedRole);
    router.push({
      pathname: '/pilih-identitas',
      params: { role: selectedRole },
    });
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.badgeTop}>
            <ThemedText type="smallBold" style={styles.badgeTopText}>
              Aplikasi Praktikum PPK
            </ThemedText>
          </View>
          <ThemedText type="subtitle" style={styles.title}>
            Pilih Peran Pengguna
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            Silakan pilih peran Anda untuk melanjutkan ke alur praktikum
          </ThemedText>
        </View>

        <View style={styles.cardContainer}>
          <Card style={styles.roleCard} onPress={() => handlePilihPeran('praktikan')}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconCircle, styles.praktikanCircle]}>
                <ThemedText style={styles.iconEmoji}>🎓</ThemedText>
              </View>
              <View style={styles.cardTextWrapper}>
                <ThemedText type="smallBold" style={styles.roleTitle}>
                  Saya Praktikan
                </ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.roleDesc}>
                  Lihat jadwal kelas Anda, pantau status sesi, dan lakukan presensi kehadiran.
                </ThemedText>
              </View>
            </View>
            <PrimaryButton
              label="Masuk sebagai Praktikan →"
              onPress={() => handlePilihPeran('praktikan')}
              style={styles.cardButton}
            />
          </Card>

          <Card style={styles.roleCard} onPress={() => handlePilihPeran('asisten')}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconCircle, styles.asistenCircle]}>
                <ThemedText style={styles.iconEmoji}>👨‍🏫</ThemedText>
              </View>
              <View style={styles.cardTextWrapper}>
                <ThemedText type="smallBold" style={styles.roleTitle}>
                  Saya Asisten
                </ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.roleDesc}>
                  Kelola dan pantau seluruh sesi kelas, buka/tutup sesi, serta rekap kehadiran.
                </ThemedText>
              </View>
            </View>
            <PrimaryButton
              label="Masuk sebagai Asisten →"
              onPress={() => handlePilihPeran('asisten')}
              variant="outline"
              style={styles.cardButton}
            />
          </Card>
        </View>

        <View style={styles.footer}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.footerText}>
            Sprint 1 • Modul Fondasi Aplikasi (SRS-01)
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
  roleCard: {
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
  },
  praktikanCircle: {
    backgroundColor: '#DBEAFE',
  },
  asistenCircle: {
    backgroundColor: '#FEF3C7',
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
  footer: {
    alignItems: 'center',
    paddingBottom: Spacing.three,
  },
  footerText: {
    fontSize: 12,
  },
});
