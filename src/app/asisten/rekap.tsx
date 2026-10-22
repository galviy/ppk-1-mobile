// Tab "Rekap" (SRS-03 FR-3.5 – FR-3.8): pilih sesi -> daftar praktikan hadir + waktu.
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { PrimaryButton } from '@/components/ui/primary-button';
import { RoleHeader } from '@/components/ui/role-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Spacing } from '@/constants/theme';
import { useApp } from '@/data/store';

export default function AsistenRekapScreen() {
  const { daftarSesi, daftarPraktikan, presensi, tambahPresensi } = useApp();
  const params = useLocalSearchParams<{ sesiId?: string }>();

  // sesi terpilih disimpan di param rute; default sesi pertama
  const sesi = daftarSesi.find((s) => s.id === params.sesiId) ?? daftarSesi[0];

  // terkini di atas; "HH:MM:SS" dapat diurutkan sebagai string
  const hadir = sesi
    ? [...(presensi[sesi.id] ?? [])].sort((a, b) => b.waktu.localeCompare(a.waktu))
    : [];

  // total kelas diketahui dari dummy SRS-01 (praktikan sekelas)
  const totalKelas = sesi ? daftarPraktikan.filter((p) => p.kelas === sesi.kelas).length : 0;

  // hanya untuk demo (kriteria 3): simulasikan praktikan presensi tanpa menunggu SRS-04
  const tambahDummy = () => {
    if (!sesi) return;
    const belum = daftarPraktikan.find(
      (p) => p.kelas === sesi.kelas && !hadir.some((h) => h.praktikanId === p.id),
    );
    if (!belum) return;
    tambahPresensi(sesi.id, {
      praktikanId: belum.id,
      nama: belum.nama,
      kelas: belum.kelas,
      waktu: new Date().toTimeString().slice(0, 8),
    });
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <RoleHeader />

        <View style={styles.content}>
          <ThemedText type="subtitle" style={styles.pageTitle}>
            Rekap Presensi
          </ThemedText>

          <View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}>
              {daftarSesi.map((s) => {
                const active = s.id === sesi?.id;
                return (
                  <Pressable
                    key={s.id}
                    onPress={() => router.setParams({ sesiId: s.id })}
                    style={[styles.chip, active && styles.chipActive]}>
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {s.namaPraktikum.split(' — ')[0]} • Kelas {s.kelas}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {!sesi ? (
            <EmptyState title="Belum Ada Sesi" message="Pilih sesi untuk melihat rekap." />
          ) : (
            <FlatList
              data={hadir}
              keyExtractor={(item) => item.praktikanId}
              contentContainerStyle={styles.listContent}
              ListHeaderComponent={
                <View>
                  <Card style={styles.summaryCard}>
                    <View style={styles.summaryTop}>
                      <View style={styles.summaryTitleWrap}>
                        <ThemedText type="smallBold">{sesi.namaPraktikum}</ThemedText>
                        <ThemedText themeColor="textSecondary" style={styles.small}>
                          Kelas {sesi.kelas} • {sesi.tanggal}
                        </ThemedText>
                      </View>
                      <StatusBadge status={sesi.status} />
                    </View>
                    <ThemedText themeColor="textSecondary" style={styles.small}>
                      Total hadir
                    </ThemedText>
                    <ThemedText style={styles.summaryValue}>
                      {hadir.length}/{totalKelas} praktikan
                    </ThemedText>
                  </Card>
                </View>
              }
              ListEmptyComponent={
                <EmptyState
                  title="Belum ada yang hadir"
                  message={
                    sesi.status === 'belum_dibuka'
                      ? 'Sesi belum dibuka. Buka sesi di tab Sesi agar praktikan bisa presensi.'
                      : 'Praktikan yang sudah presensi akan muncul di sini.'
                  }
                />
              }
              ListFooterComponent={
                __DEV__ && sesi.status === 'dibuka' ? (
                  <PrimaryButton
                    label="Tambah presensi dummy (demo)"
                    variant="outline"
                    onPress={tambahDummy}
                    style={styles.demoBtn}
                  />
                ) : null
              }
              renderItem={({ item }) => (
                <Card style={styles.entryCard}>
                  <ThemedText type="smallBold">{item.nama}</ThemedText>
                  <ThemedText themeColor="textSecondary" style={styles.small}>
                    Kelas {item.kelas} • masuk {item.waktu}
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
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { flex: 1, paddingHorizontal: Spacing.four },
  pageTitle: { fontSize: 22, lineHeight: 28, paddingVertical: Spacing.three },
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
  listContent: { paddingBottom: Spacing.four, flexGrow: 1 },
  summaryCard: { gap: 4, marginBottom: Spacing.two },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: Spacing.two,
  },
  summaryTitleWrap: { flex: 1, gap: 2 },
  summaryValue: { fontSize: 26, fontWeight: '700', color: '#2563EB', lineHeight: 32 },
  small: { fontSize: 13 },
  entryCard: { gap: 2 },
  demoBtn: { marginTop: Spacing.three },
});
