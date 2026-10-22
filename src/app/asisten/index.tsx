// Tab "Kelola Sesi" (SRS-03): ringkasan seluruh sesi + buka/tutup dengan konfirmasi.
import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SesiAksi } from '@/components/sesi-aksi';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { RoleHeader } from '@/components/ui/role-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Spacing } from '@/constants/theme';
import { useApp } from '@/data/store';

type FilterKelas = 'Semua' | 'A' | 'B';

export default function AsistenSesiScreen() {
  const { daftarSesi, presensi } = useApp();
  const [filter, setFilter] = useState<FilterKelas>('Semua');

  const filteredSesi = daftarSesi.filter((s) => filter === 'Semua' || s.kelas === filter);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <RoleHeader />

        <View style={styles.content}>
          <View style={styles.titleSection}>
            <ThemedText type="subtitle" style={styles.pageTitle}>
              Kelola Sesi Praktikum
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.pageSubtitle}>
              Buka sesi saat praktikum dimulai, tutup setelah selesai
            </ThemedText>
          </View>

          <View style={styles.filterRow}>
            {(['Semua', 'A', 'B'] as FilterKelas[]).map((f) => {
              const active = filter === f;
              return (
                <Pressable
                  key={f}
                  onPress={() => setFilter(f)}
                  style={[styles.filterChip, active && styles.filterChipActive]}>
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>
                    {f === 'Semua' ? 'Semua Kelas' : `Kelas ${f}`}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <FlatList
            data={filteredSesi}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <EmptyState
                title="Belum Ada Sesi"
                message={
                  filter === 'Semua'
                    ? 'Jadwal sesi akan muncul di sini.'
                    : `Tidak ada sesi untuk Kelas ${filter}.`
                }
              />
            }
            renderItem={({ item }) => {
              const hadir = presensi[item.id]?.length ?? 0;
              return (
                <Card
                  style={styles.sessionCard}
                  onPress={() =>
                    router.push({ pathname: '/sesi/[id]', params: { id: item.id } })
                  }>
                  <View style={styles.cardTopRow}>
                    <View style={styles.titleWrapper}>
                      <ThemedText type="smallBold" style={styles.sessionTitle}>
                        {item.namaPraktikum}
                      </ThemedText>
                      <ThemedText themeColor="textSecondary" style={styles.sessionInfo}>
                        Kelas {item.kelas} • {item.tanggal}
                      </ThemedText>
                      <ThemedText themeColor="textSecondary" style={styles.sessionInfo}>
                        {item.jamMulai} - {item.jamSelesai} WIB • {hadir} hadir
                      </ThemedText>
                    </View>
                    <StatusBadge status={item.status} />
                  </View>

                  <SesiAksi sesiId={item.id} />

                  <Pressable
                    onPress={() =>
                      router.navigate({ pathname: '/asisten/rekap', params: { sesiId: item.id } })
                    }>
                    <ThemedText type="small" style={styles.linkRekap}>
                      Lihat rekap presensi
                    </ThemedText>
                  </Pressable>
                </Card>
              );
            }}
          />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { flex: 1, paddingHorizontal: Spacing.four },
  titleSection: { paddingVertical: Spacing.three },
  pageTitle: { fontSize: 22, lineHeight: 28 },
  pageSubtitle: { fontSize: 13, marginTop: 2 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.three },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterChipActive: { backgroundColor: '#2563EB' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  filterTextActive: { color: '#FFFFFF' },
  listContent: { paddingBottom: Spacing.four, flexGrow: 1 },
  sessionCard: { padding: 16, gap: 12 },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  titleWrapper: { flex: 1, gap: 4 },
  sessionTitle: { fontSize: 16 },
  sessionInfo: { fontSize: 13 },
  linkRekap: { color: '#2563EB', textAlign: 'center' },
});
