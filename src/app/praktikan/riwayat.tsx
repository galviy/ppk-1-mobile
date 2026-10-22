import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { RoleHeader } from '@/components/ui/role-header';
import { Spacing } from '@/constants/theme';
import { useApp } from '@/data/store';

export default function PraktikanRiwayatScreen() {
  const { identitas, presensi, daftarSesi } = useApp();

  // Kumpulkan semua presensi milik praktikan aktif
  const riwayatList = Object.entries(presensi).flatMap(([sesiId, list]) => {
    const sesi = daftarSesi.find((s) => s.id === sesiId);
    const myEntry = list.find((p) => p.praktikanId === identitas?.id);
    if (!myEntry || !sesi) return [];
    return [
      {
        sesiId,
        namaPraktikum: sesi.namaPraktikum,
        kelas: sesi.kelas,
        tanggal: sesi.tanggal,
        waktuHadir: myEntry.waktu,
      },
    ];
  });

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <RoleHeader />

        <View style={styles.content}>
          <View style={styles.titleSection}>
            <ThemedText type="subtitle" style={styles.pageTitle}>
              Riwayat Presensi
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.pageSubtitle}>
              Catatan kehadiran praktikum Anda
            </ThemedText>
          </View>

          {riwayatList.length === 0 ? (
            <EmptyState
              title="Belum Ada Catatan Kehadiran"
              message="Anda belum melakukan presensi pada sesi praktikum manapun."
            />
          ) : (
            <FlatList
              data={riwayatList}
              keyExtractor={(item) => item.sesiId}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <Card style={styles.riwayatCard}>
                  <ThemedText type="smallBold" style={styles.sessionTitle}>
                    {item.namaPraktikum}
                  </ThemedText>
                  <ThemedText themeColor="textSecondary" style={styles.sessionInfo}>
                    Kelas {item.kelas} • {item.tanggal}
                  </ThemedText>
                  <View style={styles.badgeSuccess}>
                    <ThemedText style={styles.badgeText}>
                      ✓ Hadir pukul {item.waktuHadir} WIB
                    </ThemedText>
                  </View>
                </Card>
              )}
            />
          )}
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
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  titleSection: {
    paddingVertical: Spacing.three,
  },
  pageTitle: {
    fontSize: 22,
    lineHeight: 28,
  },
  pageSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  listContent: {
    paddingBottom: Spacing.four,
  },
  riwayatCard: {
    marginVertical: 6,
    padding: 16,
    gap: 6,
  },
  sessionTitle: {
    fontSize: 16,
  },
  sessionInfo: {
    fontSize: 13,
  },
  badgeSuccess: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  badgeText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '600',
  },
});
