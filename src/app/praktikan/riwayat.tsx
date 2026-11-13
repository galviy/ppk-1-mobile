// Riwayat kehadiran praktikan sendiri (real-time).
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { LoadingRow, Notice } from '@/components/notice';
import { ScreenShell } from '@/components/screen-shell';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Spacing } from '@/constants/theme';
import type { Profil } from '@/data/models';
import { useJadwalPraktikan, usePresensiSaya } from '@/hooks/use-praktikum';
import { jamDetik, tanggalPendek } from '@/lib/format';

export default function PraktikanRiwayatScreen() {
  return <ScreenShell>{(profil) => <Isi profil={profil} />}</ScreenShell>;
}

function Isi({ profil }: { profil: Profil }) {
  const jadwal = useJadwalPraktikan(profil.uid);
  const hadir = usePresensiSaya(jadwal.sesi.map((s) => s.id), profil.uid);

  const riwayat = jadwal.sesi
    .filter((s) => hadir.data[s.id])
    .map((s) => ({ sesi: s, presensi: hadir.data[s.id] }))
    .sort((a, b) => (b.presensi.waktu?.getTime() ?? Infinity) - (a.presensi.waktu?.getTime() ?? Infinity));

  const error = jadwal.error ?? hadir.error;
  const loading = jadwal.loading || hadir.loading;

  return (
    <View style={styles.content}>
      <View style={styles.title}>
        <ThemedText type="subtitle" style={styles.pageTitle}>Riwayat Presensi</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.small}>{riwayat.length} kehadiran tercatat</ThemedText>
      </View>
      <Notice data={error ? { tipe: 'err', teks: error } : null} />

      {loading ? (
        <LoadingRow />
      ) : (
        <FlatList
          data={riwayat}
          keyExtractor={(r) => r.sesi.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState title="Belum ada kehadiran" message="Presensi Anda akan tercatat di sini." />}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <ThemedText type="smallBold">{item.sesi.namaPraktikum}</ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.small}>
                {item.sesi.tanggal} • hadir {item.presensi.waktu ? `${tanggalPendek(item.presensi.waktu)} ${jamDetik(item.presensi.waktu)}` : '…'}
              </ThemedText>
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: Spacing.four },
  title: { paddingVertical: Spacing.three },
  pageTitle: { fontSize: 22, lineHeight: 28 },
  small: { fontSize: 13 },
  list: { paddingBottom: Spacing.four, flexGrow: 1 },
  card: { gap: 2 },
});
