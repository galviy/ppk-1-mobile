// Tab "Izin" (praktikan): daftar pengajuan izin sendiri + navigasi ke form pengajuan & detail.
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { LeaveRequestCard } from '@/components/izin/leave-request-card';
import { LoadingRow, Notice } from '@/components/notice';
import { ScreenShell } from '@/components/screen-shell';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Spacing } from '@/constants/theme';
import type { Profil, Sesi } from '@/data/models';
import { useIzinSaya } from '@/hooks/use-izin';
import { useJadwalPraktikan } from '@/hooks/use-praktikum';

export default function PraktikanIzinScreen() {
  return <ScreenShell>{(profil) => <Isi profil={profil} />}</ScreenShell>;
}

function Isi({ profil }: { profil: Profil }) {
  const jadwal = useJadwalPraktikan(profil.uid);
  const izinSaya = useIzinSaya(profil.uid);

  const sesiById = useMemo(
    () => Object.fromEntries(jadwal.sesi.map((s) => [s.id, s])) as Record<string, Sesi>,
    [jadwal.sesi],
  );
  const namaKelasById = useMemo(
    () => Object.fromEntries(jadwal.kelas.map((k) => [k.id, k.nama])) as Record<string, string>,
    [jadwal.kelas],
  );

  const error = izinSaya.error ?? jadwal.error;
  const loading = izinSaya.loading || jadwal.loading;

  return (
    <View style={styles.content}>
      <View style={styles.titleRow}>
        <View style={styles.flex}>
          <ThemedText type="subtitle" style={styles.pageTitle}>
            Pengajuan Izin
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.small}>
            Ajukan izin dan pantau status keputusan asisten
          </ThemedText>
        </View>
        <PrimaryButton
          label="+ Ajukan Izin"
          onPress={() => router.push('/izin/ajukan')}
          style={styles.addBtn}
        />
      </View>

      <Notice data={error ? { tipe: 'err', teks: error } : null} />

      {loading ? (
        <LoadingRow />
      ) : (
        <FlatList
          data={izinSaya.data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              title="Belum ada pengajuan izin"
              message="Tekan + Ajukan Izin apabila Anda berhalangan mengikuti sesi praktikum."
            />
          }
          renderItem={({ item }) => {
            const sesi = sesiById[item.sesiId];
            return (
              <LeaveRequestCard
                izin={item}
                namaPraktikum={sesi?.namaPraktikum ?? 'Sesi praktikum'}
                tanggalSesi={sesi?.tanggal}
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
  flex: { flex: 1 },
  content: { flex: 1, paddingHorizontal: Spacing.four },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: Spacing.three,
  },
  pageTitle: { fontSize: 22, lineHeight: 28 },
  small: { fontSize: 13 },
  addBtn: { paddingVertical: 10 },
  list: { paddingBottom: Spacing.four, flexGrow: 1 },
});
