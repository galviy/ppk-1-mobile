// Detail sesi (SRS-02 Sprint 2): data langsung dari Firestore; slot aksi per peran terisi.
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { LoadingRow, Notice, type NoticeData } from '@/components/notice';
import PresensiButton from '@/components/PresensiButton';
import { ScreenShell } from '@/components/screen-shell';
import { SesiAksi } from '@/components/sesi-aksi';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { useKelasDetail, usePresensiSesi, useSesiDetail } from '@/hooks/use-praktikum';
import { tanggalDariIso } from '@/lib/format';
import type { Peran } from '@/data/models';

function Baris({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <ThemedText themeColor="textSecondary" style={styles.label}>{label}</ThemedText>
      {typeof children === 'string' ? <ThemedText style={styles.value}>{children}</ThemedText> : children}
    </View>
  );
}

export default function DetailSesiScreen() {
  return <ScreenShell>{(p) => <Isi peran={p.role} />}</ScreenShell>;
}

function Isi({ peran }: { peran: Peran }) {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sesi = useSesiDetail(id ?? null);
  const kelas = useKelasDetail(sesi.data?.kelasId ?? null);
  const presensi = usePresensiSesi(peran === 'asisten' ? (id ?? null) : null);
  const [notice, setNotice] = React.useState<NoticeData>(null);
  const error = sesi.error ?? kelas.error;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Detail Sesi' }} />
      <Pressable onPress={() => router.back()}>
        <ThemedText type="smallBold" style={styles.back}>← Kembali</ThemedText>
      </Pressable>
      <Notice data={notice ?? (error ? { tipe: 'err', teks: error } : null)} />

      {sesi.loading ? (
        <LoadingRow />
      ) : !sesi.data ? (
        <EmptyState title="Sesi tidak ditemukan" message="Sesi ini mungkin sudah dihapus atau bukan untuk kelas Anda." />
      ) : (
        <>
          <Card>
            <Baris label="Praktikum">{sesi.data.namaPraktikum}</Baris>
            <Baris label="Kelas">{kelas.data?.nama ?? '—'}</Baris>
            <Baris label="Tanggal">{tanggalDariIso(sesi.data.tanggal)}</Baris>
            <Baris label="Jam">{`${sesi.data.jamMulai}–${sesi.data.jamSelesai}`}</Baris>
            {sesi.data.ruang ? <Baris label="Ruang">{sesi.data.ruang}</Baris> : null}
            <Baris label="Status">
              <StatusBadge status={sesi.data.status} />
            </Baris>
          </Card>

          <View style={styles.slot}>
            {peran === 'asisten' ? (
              <SesiAksi
                sesi={sesi.data}
                namaKelas={kelas.data?.nama ?? 'Kelas'}
                jumlahHadir={presensi.data.length}
                onResult={(tipe, teks) => setNotice({ tipe, teks })}
              />
            ) : (
              <PresensiButton sesi={sesi.data} />
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 16 },
  back: { color: '#2563EB' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  label: { fontSize: 14 },
  value: { fontSize: 14, fontWeight: '500', flexShrink: 1, textAlign: 'right', marginLeft: 16 },
  slot: { marginTop: 'auto' },
});
