// Tab "Rekap" (asisten): kehadiran per sesi, real-time lewat listener Firestore.
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { LoadingRow, Notice } from '@/components/notice';
import { ScreenShell } from '@/components/screen-shell';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { Spacing } from '@/constants/theme';
import { jamDetik } from '@/lib/format';
import { useKelasAsisten, usePeserta, usePresensiSesi, useSesiAsisten } from '@/hooks/use-praktikum';

export default function AsistenRekapScreen() {
  return <ScreenShell>{() => <Isi />}</ScreenShell>;
}

function Isi() {
  const params = useLocalSearchParams<{ sesiId?: string }>();
  const sesiList = useSesiAsisten();
  const kelas = useKelasAsisten();

  // sesi terpilih disimpan di param rute; default sesi pertama
  const sesi = sesiList.data.find((s) => s.id === params.sesiId) ?? sesiList.data[0];
  const kelasSesi = kelas.data.find((k) => k.id === sesi?.kelasId);
  const presensi = usePresensiSesi(sesi?.id ?? null);
  const peserta = usePeserta(sesi?.kelasId ?? null);

  const hadirUid = new Set(presensi.data.map((p) => p.uid));
  const belumHadir = peserta.data.filter((p) => !hadirUid.has(p.uid));
  const total = kelasSesi?.pesertaUids.length ?? peserta.data.length;
  const error = sesiList.error ?? kelas.error ?? presensi.error ?? peserta.error;

  return (
    <View style={styles.content}>
      <ThemedText type="subtitle" style={styles.pageTitle}>Rekap Presensi</ThemedText>
      <Notice data={error ? { tipe: 'err', teks: error } : null} />

      {sesiList.loading ? (
        <LoadingRow />
      ) : !sesi ? (
        <EmptyState title="Belum ada sesi" message="Buat sesi di tab Sesi untuk melihat rekap kehadiran." />
      ) : (
        <>
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {sesiList.data.map((s) => {
                const aktif = s.id === sesi.id;
                const nk = kelas.data.find((k) => k.id === s.kelasId)?.nama ?? '—';
                return (
                  <Pressable key={s.id} onPress={() => router.setParams({ sesiId: s.id })}
                    style={[styles.chip, aktif && styles.chipActive]}>
                    <Text style={[styles.chipText, aktif && styles.chipTextActive]}>
                      {s.namaPraktikum.split(' — ')[0]} • {nk}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <FlatList
            data={presensi.data}
            keyExtractor={(p) => p.uid}
            contentContainerStyle={styles.list}
            ListHeaderComponent={
              <Card style={styles.summary}>
                <View style={styles.summaryTop}>
                  <View style={styles.flex}>
                    <ThemedText type="smallBold">{sesi.namaPraktikum}</ThemedText>
                    <ThemedText themeColor="textSecondary" style={styles.small}>
                      {kelasSesi?.nama ?? 'Kelas dihapus'} • {sesi.tanggal}
                    </ThemedText>
                  </View>
                  <StatusBadge status={sesi.status} />
                </View>
                <ThemedText themeColor="textSecondary" style={styles.small}>Total hadir</ThemedText>
                <ThemedText style={styles.summaryValue}>
                  {presensi.loading ? '…' : `${presensi.data.length}/${total} praktikan`}
                </ThemedText>
              </Card>
            }
            ListEmptyComponent={
              presensi.loading ? (
                <LoadingRow />
              ) : (
                <EmptyState
                  title="Belum ada yang hadir"
                  message={
                    sesi.status === 'belum_dibuka'
                      ? 'Sesi belum dibuka. Buka sesi agar praktikan bisa presensi.'
                      : 'Praktikan yang presensi akan muncul di sini secara otomatis.'
                  }
                />
              )
            }
            renderItem={({ item }) => (
              <Card style={styles.entry}>
                <ThemedText type="smallBold">{item.nim ? `${item.nim} • ` : ''}{item.nama}</ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.small}>masuk {item.waktu ? jamDetik(item.waktu) : '…'}</ThemedText>
              </Card>
            )}
            ListFooterComponent={
              belumHadir.length > 0 ? (
                <View style={styles.belum}>
                  <ThemedText type="smallBold">Belum hadir ({belumHadir.length})</ThemedText>
                  {belumHadir.map((p) => (
                    <ThemedText key={p.uid} themeColor="textSecondary" style={styles.small}>
                      {p.nim} • {p.nama}
                    </ThemedText>
                  ))}
                </View>
              ) : null
            }
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flex: 1, paddingHorizontal: Spacing.four },
  pageTitle: { fontSize: 22, lineHeight: 28, paddingVertical: Spacing.three },
  small: { fontSize: 13 },
  chipRow: { gap: 8, paddingBottom: Spacing.three },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F1F5F9' },
  chipActive: { backgroundColor: '#2563EB' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  chipTextActive: { color: '#FFFFFF' },
  list: { paddingBottom: Spacing.four, flexGrow: 1 },
  summary: { gap: 4, marginBottom: Spacing.two },
  summaryTop: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: Spacing.two },
  summaryValue: { fontSize: 26, fontWeight: '700', color: '#2563EB', lineHeight: 32 },
  entry: { gap: 2 },
  belum: { marginTop: Spacing.three, gap: 4 },
});
