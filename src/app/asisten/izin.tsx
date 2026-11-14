// Tab "Izin" (asisten): daftar pengajuan izin + filter status, real-time dari Firestore.
// Keputusan (Terima/Tolak) diberikan di halaman detail `/izin/[id]`.
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { LeaveRequestCard } from '@/components/izin/leave-request-card';
import { LoadingRow, Notice } from '@/components/notice';
import { ScreenShell } from '@/components/screen-shell';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { Spacing } from '@/constants/theme';
import { STATUS_IZIN_LABEL, type StatusIzin } from '@/data/izin-types';
import type { Sesi } from '@/data/models';
import { useSemuaIzin } from '@/hooks/use-izin';
import { useKelasAsisten, useSesiAsisten } from '@/hooks/use-praktikum';

type FilterStatus = 'semua' | StatusIzin;

const FILTERS: { key: FilterStatus; label: string }[] = [
  { key: 'semua', label: 'Semua' },
  { key: 'menunggu', label: STATUS_IZIN_LABEL.menunggu },
  { key: 'diterima', label: STATUS_IZIN_LABEL.diterima },
  { key: 'ditolak', label: STATUS_IZIN_LABEL.ditolak },
];

export default function AsistenIzinScreen() {
  return <ScreenShell>{() => <Isi />}</ScreenShell>;
}

function Isi() {
  const semuaIzin = useSemuaIzin();
  const sesi = useSesiAsisten();
  const kelas = useKelasAsisten();
  const [filter, setFilter] = useState<FilterStatus>('semua');

  const sesiById = useMemo(
    () => Object.fromEntries(sesi.data.map((s) => [s.id, s])) as Record<string, Sesi>,
    [sesi.data],
  );
  const namaKelasById = useMemo(
    () => Object.fromEntries(kelas.data.map((k) => [k.id, k.nama])) as Record<string, string>,
    [kelas.data],
  );

  const jumlahPerStatus = useMemo(() => {
    const counts: Record<FilterStatus, number> = {
      semua: semuaIzin.data.length,
      menunggu: 0,
      diterima: 0,
      ditolak: 0,
    };
    for (const item of semuaIzin.data) {
      counts[item.status] += 1;
    }
    return counts;
  }, [semuaIzin.data]);

  const dataTampil = useMemo(
    () =>
      filter === 'semua'
        ? semuaIzin.data
        : semuaIzin.data.filter((item) => item.status === filter),
    [semuaIzin.data, filter],
  );

  const error = semuaIzin.error ?? sesi.error ?? kelas.error;
  const loading = semuaIzin.loading || sesi.loading || kelas.loading;

  return (
    <View style={styles.content}>
      <View style={styles.title}>
        <ThemedText type="subtitle" style={styles.pageTitle}>
          Pemeriksaan Izin
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.small}>
          Ketuk kartu pengajuan untuk melihat detail alasan, hasil analisis AI, dan memberikan keputusan
        </ThemedText>
      </View>

      <Notice data={error ? { tipe: 'err', teks: error } : null} />

      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}>
          {FILTERS.map((f) => {
            const aktif = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={[styles.chip, aktif && styles.chipActive]}>
                <Text style={[styles.chipText, aktif && styles.chipTextActive]}>
                  {f.label} ({jumlahPerStatus[f.key]})
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <LoadingRow />
      ) : (
        <FlatList
          data={dataTampil}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              title="Belum ada pengajuan izin"
              message={
                filter === 'semua'
                  ? 'Pengajuan izin dari praktikan akan muncul di sini secara otomatis.'
                  : `Tidak ada pengajuan izin dengan status "${STATUS_IZIN_LABEL[filter]}".`
              }
            />
          }
          renderItem={({ item }) => {
            const infoSesi = sesiById[item.sesiId];
            return (
              <LeaveRequestCard
                izin={item}
                showParticipant
                namaPraktikum={infoSesi?.namaPraktikum ?? 'Sesi praktikum'}
                tanggalSesi={infoSesi?.tanggal}
                namaKelas={namaKelasById[item.kelasId] ?? 'Kelas'}
                onPress={() =>
                  router.push({
                    pathname: '/izin/[id]',
                    params: { id: item.id },
                  })
                }
              />
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: Spacing.four },
  title: { paddingVertical: Spacing.three, gap: 2 },
  pageTitle: { fontSize: 22, lineHeight: 28 },
  small: { fontSize: 13 },
  chipRow: { gap: 8, paddingBottom: Spacing.three },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  chipActive: { backgroundColor: '#2563EB' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  chipTextActive: { color: '#FFFFFF' },
  list: { paddingBottom: Spacing.four, flexGrow: 1 },
});
