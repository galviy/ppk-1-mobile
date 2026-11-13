// Jadwal praktikan (FR-02.8) + presensi (FR-02.10 – FR-02.12), real-time dari Firestore.
import { router } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { LoadingRow, Notice } from '@/components/notice';
import PresensiButton from '@/components/PresensiButton';
import { ScreenShell } from '@/components/screen-shell';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { Spacing } from '@/constants/theme';
import type { Profil } from '@/data/models';
import { useJadwalPraktikan } from '@/hooks/use-praktikum';
import { tanggalDariIso } from '@/lib/format';

export default function PraktikanJadwalScreen() {
  return <ScreenShell>{(profil) => <Isi profil={profil} />}</ScreenShell>;
}

function Isi({ profil }: { profil: Profil }) {
  const jadwal = useJadwalPraktikan(profil.uid);
  const namaKelas = (id: string) => jadwal.kelas.find((k) => k.id === id)?.nama ?? '—';

  return (
    <View style={styles.content}>
      <View style={styles.title}>
        <ThemedText type="subtitle" style={styles.pageTitle}>Jadwal Sesi</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.small}>Sesi pada kelas yang Anda ikuti</ThemedText>
      </View>

      <Notice data={jadwal.error ? { tipe: 'err', teks: jadwal.error } : null} />

      {jadwal.loading ? (
        <LoadingRow />
      ) : (
        <FlatList
          data={jadwal.sesi}
          keyExtractor={(s) => s.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            jadwal.kelas.length === 0 ? (
              <EmptyState title="Belum terdaftar di kelas" message="Asisten perlu menambahkan Anda sebagai peserta kelas." />
            ) : (
              <EmptyState title="Belum ada jadwal" message="Jadwal sesi untuk kelas Anda belum dibuat." />
            )
          }
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Pressable
                onPress={() => router.push({ pathname: '/sesi/[id]', params: { id: item.id } })}
                style={styles.cardTop}>
                <View style={styles.flex}>
                  <ThemedText type="smallBold" style={styles.cardTitle}>{item.namaPraktikum}</ThemedText>
                  <ThemedText themeColor="textSecondary" style={styles.small}>
                    {namaKelas(item.kelasId)} • {tanggalDariIso(item.tanggal)}
                  </ThemedText>
                  <ThemedText themeColor="textSecondary" style={styles.small}>
                    {item.jamMulai} - {item.jamSelesai} WIB{item.ruang ? ` • ${item.ruang}` : ''}
                  </ThemedText>
                </View>
                <StatusBadge status={item.status} />
              </Pressable>
              <PresensiButton sesi={item} />
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flex: 1, paddingHorizontal: Spacing.four },
  title: { paddingVertical: Spacing.three },
  pageTitle: { fontSize: 22, lineHeight: 28 },
  small: { fontSize: 13 },
  list: { paddingBottom: Spacing.four, flexGrow: 1 },
  card: { gap: 12 },
  cardTop: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  cardTitle: { fontSize: 16 },
});
