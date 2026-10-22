// Simpan di: src/app/praktikan/riwayat.tsx
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { RoleHeader } from '@/components/ui/role-header';
import { Spacing } from '@/constants/theme';
import { useApp } from '@/data/store';

type Baris = {
  sesiId: string;
  namaPraktikum: string;
  kelas: string;
  tanggal: string;
  waktuHadir: string;
};

export default function PraktikanRiwayatScreen() {
  const { identitas, presensi, daftarSesi } = useApp();

  // FR-4.6: hanya sesi yang pernah dihadiri praktikan aktif, diurutkan terbaru di atas
  const riwayatList = useMemo<Baris[]>(() => {
    const hasil: Baris[] = [];
    for (const s of daftarSesi) {
      const myEntry = (presensi[s.id] ?? []).find((p) => p.praktikanId === identitas?.id);
      if (myEntry) {
        hasil.push({
          sesiId: s.id,
          namaPraktikum: s.namaPraktikum,
          kelas: s.kelas,
          tanggal: s.tanggal,
          waktuHadir: myEntry.waktu,
        });
      }
    }
    // Urutkan terbaru di atas
    return hasil.sort((a, b) => 
      a.tanggal === b.tanggal ? b.waktuHadir.localeCompare(a.waktuHadir) : b.tanggal.localeCompare(a.tanggal)
    );
  }, [daftarSesi, presensi, identitas?.id]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <RoleHeader />

        <View style={styles.content}>
          <View style={styles.titleSection}>
            <ThemedText type="subtitle" style={styles.pageTitle}>
              Riwayat Presensi
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.pageSubtitle}>
              Catatan kehadiran praktikum Anda ({riwayatList.length} sesi dihadiri)
            </ThemedText>
          </View>

          {riwayatList.length === 0 ? (
            <EmptyState
              title="Belum Ada Catatan Kehadiran"
              message="Presensi yang kamu lakukan akan muncul di sini."
            />
          ) : (
            <FlatList
              data={riwayatList}
              keyExtractor={(item) => item.sesiId}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <Card style={styles.riwayatCard}>
                  <View style={styles.cardAtas}>
                    <ThemedText type="smallBold" style={styles.sessionTitle} numberOfLines={2}>
                      {item.namaPraktikum}
                    </ThemedText>
                    <View style={styles.badgeSuccess}>
                      <ThemedText style={styles.badgeText}>Hadir</ThemedText>
                    </View>
                  </View>
                  <ThemedText themeColor="textSecondary" style={styles.sessionInfo}>
                    Kelas {item.kelas} • {item.tanggal}
                  </ThemedText>
                  <ThemedText style={styles.waktu}>
                    Waktu kehadiran: {item.waktuHadir}
                  </ThemedText>
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
    fontWeight: '700',
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
  cardAtas: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  sessionTitle: {
    flex: 1,
    fontSize: 16,
  },
  sessionInfo: {
    fontSize: 13,
  },
  badgeSuccess: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '600',
  },
  waktu: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '500',
  },
});