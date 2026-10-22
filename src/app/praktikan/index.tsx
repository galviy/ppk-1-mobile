import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { RoleHeader } from '@/components/ui/role-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Spacing } from '@/constants/theme';
import { useApp } from '@/data/store';

export default function PraktikanJadwalScreen() {
  const { identitas, daftarSesi } = useApp();

  // Filter jadwal khusus kelas praktikan yang sedang aktif (sesuai SRS-02 § 2.2)
  const kelasAktif = identitas?.kelas;
  const jadwalKelas = daftarSesi.filter(
    (sesi) => !kelasAktif || sesi.kelas === kelasAktif
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header Identitas & Ganti Peran (FR-1.4) */}
        <RoleHeader />

        <View style={styles.content}>
          <View style={styles.titleSection}>
            <ThemedText type="subtitle" style={styles.pageTitle}>
              Jadwal Praktikum
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.pageSubtitle}>
              Menampilkan sesi praktikum untuk Kelas {kelasAktif ?? 'A'}
            </ThemedText>
          </View>

          {jadwalKelas.length === 0 ? (
            <EmptyState
              title="Belum Ada Jadwal"
              message={`Tidak ada jadwal praktikum untuk Kelas ${kelasAktif ?? ''}. Hubungi asisten jika ada kendala.`}
            />
          ) : (
            <FlatList
              data={jadwalKelas}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <Card style={styles.sessionCard}>
                  <View style={styles.cardTopRow}>
                    <View style={styles.titleWrapper}>
                      <ThemedText type="smallBold" style={styles.sessionTitle}>
                        {item.namaPraktikum}
                      </ThemedText>
                      <ThemedText
                        themeColor="textSecondary"
                        style={styles.sessionInfo}>
                        Kelas {item.kelas} • {item.tanggal}
                      </ThemedText>
                      <ThemedText
                        themeColor="textSecondary"
                        style={styles.sessionTime}>
                        ⏰ {item.jamMulai} - {item.jamSelesai} WIB
                      </ThemedText>
                    </View>
                    <StatusBadge status={item.status} />
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
  sessionCard: {
    marginVertical: 6,
    padding: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  titleWrapper: {
    flex: 1,
    gap: 4,
  },
  sessionTitle: {
    fontSize: 16,
  },
  sessionInfo: {
    fontSize: 13,
  },
  sessionTime: {
    fontSize: 12,
    marginTop: 2,
  },
});
